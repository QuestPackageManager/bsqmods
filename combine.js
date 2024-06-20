const fs = require("fs");
const path = require("path");
const modsPath = path.join(__dirname, "mods");
const combinedJsonPath = path.join(__dirname, "dist", "mods.json");
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
 */

var allMods = {};

function isNullOrWhitespace(input) {
    return !input || !input.trim();
}

function exitWithError(message, code) {
    code = (code == null ? 1 : code);

    console.error(message);
    process.exit(code);
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

fs.readdirSync(modsPath).filter(versionPath => {
    return fs.statSync(path.join(modsPath, versionPath)).isDirectory();
}).forEach(version => {
    const versionPath = path.join(modsPath, version);

    var mods = allMods[version] || (allMods[version] = []);

    fs.readdirSync(versionPath).filter(modPath => {
        return modPath.toLowerCase().endsWith(".json") && fs.statSync(path.join(versionPath, modPath)).isFile();
    }).forEach(modFilename => {
        const modPath = path.join(versionPath, modFilename);
        const shortModPath = modPath.substring(__dirname.length);
        const mod = JSON.parse(fs.readFileSync(modPath, "utf8"));
        const requiredFilename = getFilename(mod.id, mod.version, version);

        console.log(`Processing ${shortModPath}`)

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

        mods.push(mod);
    });
});

fs.mkdirSync(path.dirname(combinedJsonPath), { recursive: true });
fs.writeFileSync(combinedJsonPath, JSON.stringify(allMods, null, "\t"));
