const fs = require("fs");
const path = require("path");
const modsPath = path.join(__dirname, "mods");
const combinedJsonPath = path.join(__dirname, "dist", "mods.json");

var allMods = {};

fs.readdirSync(modsPath).filter(versionPath => {
    return fs.statSync(path.join(modsPath, versionPath)).isDirectory();
}).forEach(version => {
    const versionPath = path.join(modsPath, version);

    var mods = allMods[version] || (allMods[version] = []);

    fs.readdirSync(versionPath).filter(modPath => {
        return modPath.toLowerCase().endsWith(".json") && fs.statSync(path.join(versionPath, modPath)).isFile();
    }).forEach(modFilename => {
        const modPath = path.join(versionPath, modFilename);
        const mod = JSON.parse(fs.readFileSync(modPath, "utf8"));

        mods.push(mod);
    });
});

fs.mkdirSync(path.dirname(combinedJsonPath), { recursive: true });
fs.writeFileSync(combinedJsonPath, JSON.stringify(allMods, null, "\t"));