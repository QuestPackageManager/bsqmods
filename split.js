const fs = require("fs");
const path = require("path");
const allMods = require(path.join(__dirname, "dist", "mods.json"));
const modsPath = path.join(__dirname, "mods");

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

function sanitizeFilename(input) {
    // Define a regex pattern for invalid filename characters
    // This pattern includes characters not allowed in Windows filenames
    const invalidChars = /[<>:"\/\\|?*\x00-\x1F]/g;

    // Replace invalid characters with underscore
    return input.replace(invalidChars, '_');
}

function getFilename(id, version, gameVersion) {
    return path.join(modsPath, sanitizeFilename(gameVersion.trim()), sanitizeFilename(`${id.trim()}-${version.trim()}.json`));
}

Object.keys(allMods).forEach(gameVersion => {

    allMods[gameVersion].forEach(mod => {
        deleteKeysNotInList(mod, [
            "name",
            "description",
            "id",
            "version",
            "download",
            "source",
            "author",
            "modloader"
        ]);

        let modJson = getFilename(mod.id, mod.version, gameVersion);
        fs.mkdirSync(path.dirname(modJson), { recursive: true });
        fs.writeFileSync(modJson, JSON.stringify(mod, null, "\t"));
    });
});
