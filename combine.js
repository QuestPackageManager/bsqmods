(async () => {
    const fs = require("fs");
    const JSZip = require("jszip");
    const sharp = require("sharp");

    const path = require("path");
    const crypto = require("crypto");
    const fetch = (await import("node-fetch")).default;

    const baseHref = "https://dantheman827.github.io/bsqmods";
    const modsPath = path.join(__dirname, "mods");
    const coversPath = path.join(__dirname, "dist", "covers");
    const hashesPath = path.join(__dirname, "dist", "sha1sums.json");
    const combinedJsonPath = path.join(__dirname, "dist", "mods.json");
    const qmodsPath = path.join(__dirname, "qmods");
    const modLoaders = ["QuestLoader", "Scotland2"]

    /**
     * @typedef {Object} Mod
     * @property {string} name - The name of the mod.
     * @property {string} description - The description of the mod.
     * @property {string} id - The ID of the mod.
     * @property {string} version - The version of the mod.
     * @property {string} download - The download link of the mod.
     * @property {string} source - The source link of the mod.
     * @property {string} author - The author(s) of the mod.
     * @property {string} cover - The cover image link of the mod.
     * @property {string} modloader - The modloader used by the mod.
     * @property {string} hash - The sha1 hash of the download.
     */

    var allMods = {};
    var hashes = JSON.parse(readTextFile(hashesPath, "{}"));

    function isNullOrWhitespace(input) {
        return !input || !input.trim();
    }

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

    function readTextFile(path, defaultValue) {
        if (fs.existsSync(path)) {
            return fs.readFileSync(path, "utf8");
        }

        return defaultValue;
    }

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
            // Handle fetch error
            //console.error('Error downloading the file:', error);
            return null;
        }
    }

    function sanitizeFilename(input) {
        // Define a regex pattern for invalid filename characters
        // This pattern includes characters not allowed in Windows filenames
        const invalidChars = /[<>:"\/\\|?*\x00-\x1F]/g;

        // Replace invalid characters with underscore
        return input.replace(invalidChars, '_');
    }

    function getFilename(id, version, gameVersion, basePath, extension) {
        basePath = basePath || modsPath;
        extension = extension || "json";

        return path.join(basePath, sanitizeFilename(gameVersion.trim()), sanitizeFilename(`${id.trim()}-${version.trim()}.${extension}`));
    }

    // Function to hash a buffer
    function hashBuffer(buffer) {
        const hash = crypto.createHash('sha1');
        hash.update(buffer);
        return hash.digest('hex');
    }

    /**
     *
     * @param {Mod} modInfo
     * @param {string} gameVersion
     * @returns
     */
    async function processQmod(mod, gameVersion) {
        var output = {
            errors: [],
            warnings: [],
            hash: null
        };

        // We've already processed this, don't do it again.
        if (Object.keys(hashes).indexOf(mod.download) != -1) {
            output.hash = hashes[mod.download];
            return output;
        }

        const qmodPath = getFilename(mod.id, mod.version, gameVersion, qmodsPath, "qmod");
        fs.mkdirSync(path.dirname(qmodPath), { recursive: true });

        const qmodHash = await downloadFile(mod.download, qmodPath);

        if (qmodHash == null) {
            // File not found.
            output.errors.push(`File not found: ${mod.download}`);
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
            var zip = await JSZip.loadAsync(fs.readFileSync(qmodPath));

            /**
             * @type JSZip.JSZipObject
             */
            let infoFile;

            if (infoFile = zip.file("bmbfmod.json")) {
                try {
                    var json = JSON.parse(await infoFile.async("text"));
                    const coverImageFilename = json.coverImageFilename;

                    if (!isNullOrWhitespace(coverImageFilename) && coverImageFilename != "undefined" && (coverFile = await zip.file(coverImageFilename)) == null) {
                        output.warnings.push(`Cover file not found: ${path.join(qmodPath.substring(qmodsPath.length), coverImageFilename)}`);
                    }
                } catch (error) {
                    output.errors.push("Error processing bmbfmod.json");
                    return output;
                }
            } else if (infoFile = zip.file("mod.json")) {
                try {
                    var json = JSON.parse(await infoFile.async("text"));
                    coverImageFilename = json.coverImage;

                    if (!isNullOrWhitespace(coverImageFilename) && coverImageFilename != "undefined" && (coverFile = await zip.file(coverImageFilename)) == null) {
                        output.warnings.push(`Cover file not found: ${path.join(qmodPath.substring(qmodsPath.length), coverImageFilename)}`);
                    }
                } catch (error) {
                    output.errors.push("Error processing mod.json");
                    return output;
                }
            } else {
                output.errors.push("No info json");
                return output;
            }
        } catch (error) {
            output.errors.push("Error reading archive");
            fs.unlinkSync(qmodPath);
            return output;
        }

        if (coverFile) {
            try {
                const coverBuffer = await coverFile.async("nodebuffer");
                const outputFilename = path.join(coversPath, `${hashBuffer(coverBuffer)}.png`);

                if (!fs.existsSync(outputFilename)) {
                    fs.mkdirSync(coversPath, { recursive: true });

                    await sharp(coverBuffer)
                        .rotate()
                        .resize(178, 100, {
                            fit: "contain"
                        })
                        .png({

                        })
                        .toFile(outputFilename);
                }

                mod.cover = `${baseHref}/covers/${path.basename(outputFilename)}`;

            } catch (error) {
                output.warnings.push("Error processing cover file");
                output.warnings.push(error);
            }
        }

        //fs.unlinkSync(qmodPath);

        return output;
    }

    const gameVersions = fs.readdirSync(modsPath).filter(versionPath => {
        return fs.statSync(path.join(modsPath, versionPath)).isDirectory();
    });

    for (let versionIndex = 0; versionIndex < gameVersions.length; versionIndex++) {
        const version = gameVersions[versionIndex]
        const versionPath = path.join(modsPath, version);
        const mods = allMods[version] || (allMods[version] = []);
        const modFilenames = fs.readdirSync(versionPath).filter(modPath => {
            return modPath.toLowerCase().endsWith(".json") && fs.statSync(path.join(versionPath, modPath)).isFile();
        });

        for (let modIndex = 0; modIndex < modFilenames.length; modIndex++) {
            const modFilename = modFilenames[modIndex];
            const modPath = path.join(versionPath, modFilename);
            const shortModPath = modPath.substring(__dirname.length);
            const mod = JSON.parse(fs.readFileSync(modPath, "utf8"));
            const requiredFilename = getFilename(mod.id, mod.version, version);

            if (shortModPath != requiredFilename.substring(__dirname.length)) {
                exitWithError(`Mod filename is not what it should be.  ${shortModPath} should be ${requiredFilename.substring(__dirname.length)}`);
            }

            if (isNullOrWhitespace(mod.name)) {
                exitWithError("Mod name not set");
            }

            if (isNullOrWhitespace(mod.id)) {
                exitWithError("Mod ID not set");
            }

            if (isNullOrWhitespace(mod.version)) {
                exitWithError("Mod version not set");
            }

            if (isNullOrWhitespace(mod.download)) {
                exitWithError("Mod download link not set");
            }

            if (modLoaders.indexOf(mod.modloader) == -1) {
                exitWithError("Mod loader is invalid");
            }

            deleteKeysNotInList(mod, [
                "name",
                "description",
                "id",
                "version",
                "download",
                "source",
                "author",
                "modloader",
                "hash"
            ]);

            const qmodResult = await processQmod(mod, version);

            if (qmodResult.errors.length == 0) {
                mod.hash = hashes[mod.download];
                mods.push(mod);
            }

            if (qmodResult.warnings.length > 0 || qmodResult.errors.length > 0) {
                console.log(`${qmodResult.errors.length > 0 ? "Errors" : "Warnings"} when processing ${shortModPath}`);

                qmodResult.warnings.forEach(warning => {
                    console.warn(`  Warning: ${warning}`);
                });

                qmodResult.errors.forEach(error => {
                    console.warn(`  Error: ${error}`);
                });

                console.log("");
            }

            fs.writeFileSync(hashesPath, JSON.stringify(hashes, null, "\t"));
        }
    }

    fs.mkdirSync(path.dirname(combinedJsonPath), { recursive: true });
    fs.writeFileSync(combinedJsonPath, JSON.stringify(allMods, null, "\t"));

})();
