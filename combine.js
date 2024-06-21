/**
 * @typedef {Object} Mod
 * @property {string} name - The name of the mod.
 * @property {string} description - A description of what the mod does.
 * @property {string} id - The ID of the mod.
 * @property {string} version - The version of the mod.
 * @property {string} download - A direct link to the .qmod file.
 * @property {string} source - A link to the source code for the mod.
 * @property {string} website - A link to a website for the mod
 * @property {string?} porter - The porter(s) of the mod.
 * @property {string} author - The author(s) of the mod.
 * @property {string?} cover - A direct link to a cover image.
 * @property {string} modloader - The mod loader used by the mod.
 * @property {string?} packageVersion - The version of the game the mod is made for.
 */

// Anonymous async function so we can use await.
(async () => {
  // Modules
  const JSZip = require("jszip");
  const crypto = require("crypto");
  const fetch = (await import("node-fetch")).default;
  const fs = require("fs");
  const path = require("path");
  const sharp = require("sharp");

  // Paths
  const modsPath = path.join(__dirname, "mods");
  const coversPath = path.join(__dirname, "dist", "covers");
  const hashesPath = path.join(__dirname, "dist", "sha1sums.json");
  const combinedJsonPath = path.join(__dirname, "dist", "mods.json");
  const qmodsPath = path.join(__dirname, "qmods");

  /**
   * @type {Object.<string, Mod[]>}
   */
  const allMods = {};

  /**
   * A dictionary of all hashes for given urls.
   * @type {Object.<string, string>}
   */
  const hashes = JSON.parse(readTextFile(hashesPath, "{}"));

  /**
   * Allowed mod loaders
   */
  const modLoaders = ["QuestLoader", "Scotland2"]

  /**
   * Public url base
   */
  let urlBase = ".";

  // Set the urlBase variable if given one in the command line arguments.
  (function setUrlBase() {
    const baseHrefArg = "--baseHref=";

    for (const arg of process.argv) {
      if (arg.startsWith(baseHrefArg)) {
        urlBase = arg.substring(baseHrefArg.length);
      }
    }
  })();

  /**
   * Checks if a given string is null, undefined, or consists only of whitespace characters.
   *
   * @param {string} input - The string to check.
   * @returns {boolean} - Returns true if the input is null, undefined, or whitespace; otherwise, false.
   */
  function isNullOrWhitespace(input) {
    return !input || !input.trim();
  }

  /**
   * Logs an error message to the console and exits the process with the specified exit code.
   *
   * @param {string} message - The error message to log.
   * @param {number} [code=1] - The exit code (default is 1).
   */
  function exitWithError(message, code) {
    code = (code == null ? 1 : code);

    console.error(message);
    process.exit(code);
  }

  /**
   * Function to delete keys from an object that are not in the allowed list.
   * @param {Object} obj - The object to be filtered.
   * @param {Array} allowedKeys - The list of keys to keep in the object.
   * @returns {Object} - The filtered object with only allowed keys.
   */
  function deleteKeysNotInList(obj, allowedKeys) {
    for (const key in obj) {
      if (!allowedKeys.includes(key)) {
        delete obj[key];
      }
    }

    return obj;
  }

  /**
   * Reads the content of a text file if it exists, otherwise returns a default value.
   *
   * @param {string} path - The path to the text file.
   * @param {string} defaultValue - The default value to return if the file does not exist.
   * @returns {string} - The content of the text file or the default value.
   */
  function readTextFile(path, defaultValue) {
    if (fs.existsSync(path)) {
      return fs.readFileSync(path, "utf8");
    }

    return defaultValue;
  }

  /**
   * Checks if a URL is accessible by sending a HEAD request.
   *
   * @param {string} url - The URL to check.
   * @returns {Promise<boolean>} - Returns true if the URL is accessible, otherwise false.
   */
  async function checkUrl(url) {
    try {
      const res = await fetch(url, { method: "HEAD" });

      if (!res.ok) {
        // If the response status is not OK, return false
        return false;
      }

      return true;
    } catch (error) {
      // Handle fetch error
      return false;
    }
  }

  /**
   * Downloads a file from a URL and saves it to a specified destination, returning the SHA-1 hash of the file.
   *
   * @param {string} url - The URL to download the file from.
   * @param {string} dest - The destination path to save the downloaded file.
   * @returns {Promise<string|null>} - Returns the SHA-1 hash of the downloaded file, or null if the download failed.
   */
  async function downloadFile(url, dest) {
    try {
      const res = await fetch(url);

      if (!res.ok) {
        // If the response status is not OK, return null
        return null;
      }

      const fileStream = fs.createWriteStream(dest);
      const hash = crypto.createHash('sha1');
      const writableStream = res.body.pipe(fileStream);

      res.body.on('data', (chunk) => {
        hash.update(chunk);
      });

      return new Promise((resolve, reject) => {
        writableStream.on('finish', () => {
          const sha1 = hash.digest('hex');
          resolve(sha1);
        });

        writableStream.on('error', (err) => {
          fs.unlink(dest, () => reject(err)); // Delete the file if there's an error
        });
      });
    } catch (error) {
      return null;
    }
  }

  /**
   * Replaces invalid filename or directory characters with an underscore.
   *
   * @param {string} input - The input string to sanitize.
   * @returns {string} - The sanitized string.
   */
  function sanitizeFilename(input) {
    // Define a regex pattern for invalid filename characters
    // This pattern includes characters not allowed in Windows filenames
    const invalidChars = /[<>:"\/\\|?*\x00-\x1F]+/g;

    // Replace invalid characters with underscore
    return input.replace(invalidChars, '_');
  }

  /**
   * Constructs a sanitized filename based on given parameters.
   *
   * @param {string} id - The ID for the filename.
   * @param {string} version - The version for the filename.
   * @param {string} gameVersion - The game version for the filename.
   * @param {string} [basePath=modsPath] - The base path where the file will be located.
   * @param {string} [extension="json"] - The file extension.
   * @returns {string} - The constructed filename.
   */
  function getFilename(id, version, gameVersion, basePath = modsPath, extension = "json") {
    return path.join(
      basePath,
      sanitizeFilename(gameVersion.trim()),
      sanitizeFilename(`${id.trim()}-${version.trim()}.${extension}`)
    );
  }

  /**
   * Computes the SHA-1 hash of a given buffer.
   *
   * @param {Buffer} buffer - The buffer to hash.
   * @returns {string} - The SHA-1 hash of the buffer.
   */
  function computeBufferSha1(buffer) {
    const hash = crypto.createHash('sha1');

    hash.update(buffer);

    return hash.digest('hex');
  }

  /**
   * Processes a mod by downloading the file, hashing it, creating a resized cover image, and updating the cover image link.
   * @param {Mod} modInfo - The mod info
   * @param {string} gameVersion - The target game version
   * @returns
   */
  async function processQmod(mod, gameVersion) {
    const output = {
      messages: [],
      errors: [],
      warnings: [],
      hash: null
    };

    if (process.argv.indexOf("--skipHashes") != -1) {
      return output;
    }

    let qmodHash = hashes[mod.download];
    let coverFilename = path.join(coversPath, `${qmodHash}.png`);

    if (process.argv.indexOf("--recheckUrls") != -1 && qmodHash != null && !(await checkUrl(mod.download))) {
      qmodHash = null;
      delete hashes[mod.download];
    }

    // We've already processed this, don't do it again.
    if (qmodHash != null) {
      output.hash = qmodHash;

      if (fs.existsSync(coverFilename)) {
        mod.cover = `${urlBase}/covers/${path.basename(coverFilename)}`
      }
      return output;
    }

    const qmodPath = getFilename(mod.id, mod.version, gameVersion, qmodsPath, "qmod");
    fs.mkdirSync(path.dirname(qmodPath), { recursive: true });

    output.messages.push(mod.download);

    if (fs.existsSync(qmodPath)) {
      qmodHash = computeBufferSha1(fs.readFileSync(qmodPath));
    } else {
      qmodHash = await downloadFile(mod.download, qmodPath);
    }

    if (qmodHash == null) {
      // File not found.
      output.errors.push("Not found");
      return output;
      //process.exit(1);
    }

    hashes[mod.download] = qmodHash;
    output.hash = qmodHash;

    if (!fs.existsSync(qmodPath)) {
      output.errors.push("Local file not found");
      return output;
    }

    /**
     * @type JSZip.JSZipObject
     */
    let coverFile;

    try {
      const zip = await JSZip.loadAsync(fs.readFileSync(qmodPath));

      /**
       * @type JSZip.JSZipObject
       */
      const infoFile = zip.file("bmbfmod.json") || zip.file("mod.json");

      if (infoFile != null) {
        try {
          const json = JSON.parse(await infoFile.async("text"));
          const coverImageFilename = json.coverImageFilename || json.coverImage;

          if (!isNullOrWhitespace(coverImageFilename) && coverImageFilename !== "undefined") {
            coverFile = zip.file(coverImageFilename);

            if (coverFile == null) {
              output.warnings.push(`Cover file not found: ${path.join(qmodPath.substring(qmodsPath.length + 1), coverImageFilename)}`);
            }
          }
        } catch (error) {
          output.errors.push(`Processing ${infoFile.name}`);
          return output;
        }
      } else {
        output.errors.push("No info json");
        return output;
      }
    } catch (error) {
      output.errors.push("Reading archive");
      fs.unlinkSync(qmodPath);
      return output;
    }

    if (coverFile) {
      coverFilename = path.join(coversPath, `${qmodHash}.png`);

      try {
        const coverBuffer = await coverFile.async("nodebuffer");

        if (!fs.existsSync(coverFilename)) {
          fs.mkdirSync(coversPath, { recursive: true });

          await sharp(coverBuffer)
            .rotate()
            .resize(178, 100, {
              fit: "contain"
            })
            .png({

            })
            .toFile(coverFilename);
        }

        mod.cover = `${urlBase}/covers/${path.basename(coverFilename)}`;

      } catch (error) {
        output.warnings.push("Error processing cover file");
        output.warnings.push(error);
      }
    }

    return output;
  }

  (async function main() {
    const gameVersions = fs.readdirSync(modsPath)
      .filter(versionPath => fs.statSync(path.join(modsPath, versionPath)).isDirectory());

    for (const version of gameVersions) {
      const versionPath = path.join(modsPath, version);
      const mods = allMods[version] || (allMods[version] = []);
      const modFilenames = fs.readdirSync(versionPath)
        .filter(modPath => modPath.toLowerCase().endsWith(".json") && fs.statSync(path.join(versionPath, modPath)).isFile());

      for (const modFilename of modFilenames) {
        const modPath = path.join(versionPath, modFilename);
        const shortModPath = modPath.substring(__dirname.length + 1);
        const mod = JSON.parse(fs.readFileSync(modPath, "utf8"));
        const requiredFilename = getFilename(mod.id, mod.version, version);
        const modKeys = [
          "name", "description", "id", "version", "author", "modloader",
          "download", "source", "cover", "funding", "website"
        ];

        if (shortModPath != requiredFilename.substring(__dirname.length + 1)) {
          exitWithError(`Mod filename is not what it should be.  ${shortModPath} should be ${requiredFilename.substring(__dirname.length + 1)}`);
        }

        for (const field of ["name", "id", "version", "download"]) {
          if (isNullOrWhitespace(mod[field])) {
            exitWithError(`Mod ${field} not set`);
          }
        }

        if (!modLoaders.includes(mod.modloader)) {
          exitWithError("Mod loader is invalid");
        }

        const qmodResult = await processQmod(mod, version);
        const uniformMod = {}

        for (const key of modKeys) {
          uniformMod[key] = (mod[key] || "").trim();

          if (uniformMod[key] == "") {
            uniformMod[key] = null;
          }
        }

        if (qmodResult.errors.length == 0) {
          uniformMod.hash = hashes[uniformMod.download];
          mods.push(uniformMod);
        } else {
          delete hashes[uniformMod.download];
        }

        if (qmodResult.warnings.length > 0 || qmodResult.errors.length > 0) {
          console.log(`${qmodResult.errors.length > 0 ? "Errors" : "Warnings"} when processing ${shortModPath}`);

          qmodResult.messages.forEach(warning => console.log(`  Message: ${warning}`));
          qmodResult.warnings.forEach(warning => console.warn(`  Warning: ${warning}`));
          qmodResult.errors.forEach(error => console.error(`  Error: ${error}`));

          console.log("");
        }

        fs.writeFileSync(hashesPath, JSON.stringify(hashes, null, "  "));
      }
    }

    fs.mkdirSync(path.dirname(combinedJsonPath), { recursive: true });
    fs.writeFileSync(combinedJsonPath, JSON.stringify(allMods, null, "  "));
  })();

})();
