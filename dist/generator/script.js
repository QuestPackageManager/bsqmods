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

"use strict";
(async () => {
    /**
     * Regular expression for matching GitHub repository URLs.
     * @type {RegExp}
     */
    const ghRegex = /^https:\/\/(?:www\.)?github\.com\/([^\/]+)\/([^\/]+)/;

    /**
     * @type {HTMLInputElement}
     */
    const link = document.getElementById("link");

    /**
     * @type {HTMLInputElement}
     */
    const games = document.getElementById("games");

    /**
     * @type {HTMLInputElement}
     */
    const version = document.getElementById("version");

    /**
     * @type {HTMLInputElement}
     */
    const creators = document.getElementById("creators");

    /**
     * @type {HTMLInputElement}
     */
    const id = document.getElementById("id");

    /**
     * @type {HTMLInputElement}
     */
    const description = document.getElementById("description");

    /**
     * @type {HTMLInputElement}
     */
    const name = document.getElementById("name");

    /**
     * @type {HTMLInputElement}
     */
    const source = document.getElementById("source");

    /**
     * @type {HTMLInputElement}
     */
    const modloader = document.getElementById("modloader");

    /**
     * @type {HTMLInputElement}
     */
    const cover = document.getElementById("cover");

    /**
     * @type {HTMLElement}
     */
    const qmodDropZone = document.body;

    /**
     * @type {HTMLButtonElement}
     */
    const generateButton = document.getElementById("generate");

    /**
     * @type {HTMLButtonElement}
     */
    const qmodButton = document.getElementById("qmodButton");

    /**
     * JSON object containing mod data.
     * @type {Mod}
     */
    var json = {};

    // Fetch mods JSON file
    fetch(`../mods.json?${Math.floor(Date.now() / 1000)}`).then(response => response.json()).then(modsJson => json = modsJson);

    /**
     * Checks if a mod with the given id and version already exists for the specified game version.
     *
     * @param {string} id - The ID of the mod.
     * @param {string} version - The version of the mod.
     * @param {string} gameVersion - The version of the game.
     * @returns {boolean} - Returns true if the mod with the given id and version exists for the specified game version, false otherwise.
     */
    function checkMod(id, version, gameVersion) {
        /**
         * Array of mods for the specified game version.
         * @type {Mod[]|null}
         */
        const versionMods = json[gameVersion];

        if (versionMods == null) {
            return false;
        }

        // Loop through all mods for the specified game version
        for (var i = 0; i < versionMods.length; i++) {
            /**
             * @type {Mod}
             */
            const mod = versionMods[i];

            // Check if mod id and version match the given id and version
            if (mod.id == id && mod.version == version) {
                return true;
            }
        }

        return false;
    }

    /**
     * Function to handle loading of QMOD files.
     * @param {ProgressEvent<FileReader>} ev - The event object.
     */
    function onQmodLoad(ev) {
        let reader = this;
        var zip = new JSZip();
        zip.loadAsync(reader.result).then((zip) => {
            zip
                .file("mod.json")
                .async("string")
                .then((res) => {
                    var _a;
                    var m = JSON.parse(res);
                    name.value = m.name;
                    description.value = m.description;
                    creators.value = (!m.porter ? "" : m.porter + ",") + m.author;
                    version.value = m.version;
                    games.value = m.packageVersion;
                    id.value = m.id;
                    modloader.value = (_a = m.modloader) !== null && _a !== void 0 ? _a : "QuestLoader";
                    console.log(m);
                });
        });
    }

    // Event listener for dropping files into the qmodDropZone
    qmodDropZone.addEventListener("drop", function (event) {
        event.preventDefault();
        event.stopPropagation();
        if (event.dataTransfer.items) {
            // Use DataTransferItemList interface to access the file(s)
            [...event.dataTransfer.items].forEach((item, i) => {
                // If dropped items aren't files, reject them
                if (item.kind === "file") {
                    const file = item.getAsFile();
                    console.log(`… file[${i}].name = ${file.name}`);
                    var reader = new FileReader();
                    var fileName = file.name;
                    reader.onloadend = onQmodLoad;
                    reader.readAsArrayBuffer(file);
                }
            });
        }
        else {
            // Use DataTransfer interface to access the file(s)
            [...event.dataTransfer.files].forEach((file, i) => {
                console.log(`… file[${i}].name = ${file.name}`);
                var reader = new FileReader();
                var fileName = file.name;
                reader.onloadend = onQmodLoad;
                reader.readAsArrayBuffer(file);
            });
        }
    });

    // Prevent default behavior for dragover and drop events
    qmodDropZone.addEventListener("dragover", function (e) {
        e = e || event;
        e.preventDefault();
    }, false);

    // Prevent default behavior for drop event
    qmodDropZone.addEventListener("drop", function (e) {
        e = e || event;
        e.preventDefault();
    }, false);

    // Event listener for onchange event of link input
    link.onchange = () => {
        var githubLink = "";
        if (link.value.includes("github.com")) {
            githubLink = link.value.substring(0, link.value.indexOf("releases"));
        }
        if (githubLink)
            source.value = githubLink;
    };

    /**
     * Function to handle dropping of URLs.
     * @param {DragEvent} e - The event object.
     */
    function urlDrop(e) {
        /**
         * @type {HTMLInputElement}
         */
        let input = e.currentTarget;
        e.preventDefault();
        e.stopPropagation();
        let url = e.dataTransfer.getData("URL");
        input.value = url;
        input.onchange();
    }

    // Event listener for dropping URLs on cover element
    cover.addEventListener("drop", urlDrop);

    // Event listener for dropping URLs on link element
    link.addEventListener("drop", urlDrop);

    // Event listener for generate button click event
    generateButton.addEventListener("click", function GenerateJSON(e) {
        console.log("generating");
        if (!json[games.value])
            json[games.value] = [];

        /**
         * @type Mod
         */
        var mod = {
            name: name.value,
            description: description.value,
            id: id.value,
            version: version.value,
            download: link.value,
            source: source.value,
            author: creators.value,
            cover: cover.value,
            modloader: modloader.value
        };

        const modFilename = `mods/${games.value}/${id.value}-${version.value}.json`;

        if (checkMod(mod.id, mod.version, games.value)) {
            alert("This mod version already exists in the json");
            window.open(`https://github.com/DanTheMan827/bsqmods/edit/main/${modFilename}`);
        } else {
            window.open(`https://github.com/DanTheMan827/bsqmods/new/main?filename=${encodeURIComponent(modFilename)}&value=${encodeURIComponent(JSON.stringify(mod, null, "\t"))}`);
        }
    });

    // Event listener for clicking the QMOD button
    qmodButton.addEventListener("click", function LoadQMOD() {
        var input = document.createElement("input");
        input.setAttribute("type", "file");
        input.onchange = (e) => {
            if (!this.files[0]) {
                return;
            }
            var reader = new FileReader();
            var fileName = this.files[0].name;
            reader.onloadend = onQmodLoad;
            reader.readAsArrayBuffer(this.files[0]);
        };
        input.click();
    });
})();
