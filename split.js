const fs = require("fs");
const path = require("path");
const allMods = require(path.join(__dirname, "dist", "mods.json"));
const modsPath = path.join(__dirname, "mods");

Object.keys(allMods).forEach(version => {
    let versionPath = path.join(modsPath, version);

    if (!fs.existsSync(versionPath)) {
        fs.mkdirSync(versionPath, { recursive: true });
    }

    allMods[version].forEach(mod => {
        let modJson = path.join(versionPath, `${mod.id}-${mod.version}.json`);
        fs.writeFileSync(modJson, JSON.stringify(mod, null, "\t"));
    });
});