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

const fs = require("fs");
const path = require("path");
const modsPath = path.join(__dirname, "mods");

[
    "name", "description", "id", "version", "author", "modloader",
    "download", "source", "cover", "funding", "website"
]

/**
 * @type {Object.<string, Mod[]>}
 */
const allMods = require(path.join(__dirname, "dist", "mods.json"));

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

// Loop through the keys of allMods as gameVersion
for (gameVersion in allMods) {
    // Loop through all the mods for that game version.
    for (const mod of allMods[gameVersion]) {
        // Delete keys that don't have a value, or are only whitespace. "undefined" too.
        for (const key in mod) {
            if (mod[key] == null || mod[key].length == 0 || mod[key] == "undefined") {
                delete mod[key];
            }
        }

        const uniformMod = {}

        for (const key of modKeys) {
            uniformMod[key] = (mod[key] || "").trim();

            if (uniformMod[key] == "") {
                uniformMod[key] = null;
            }
        }

        const modJson = getFilename(mod.id, mod.version, gameVersion);

        fs.mkdirSync(path.dirname(modJson), { recursive: true });
        fs.writeFileSync(modJson, JSON.stringify(uniformMod, null, "\t"));
    }
}
