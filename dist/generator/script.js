"use strict";
(async () => {
    const ghRegex = /^https:\/\/(?:www\.)?github\.com\/([^\/]+)\/([^\/]+)/;
    const link = document.getElementById("link");
    const games = document.getElementById("games");
    const version = document.getElementById("version");
    const creators = document.getElementById("creators");
    const id = document.getElementById("id");
    const description = document.getElementById("description");
    const name = document.getElementById("name");
    const source = document.getElementById("source");
    const modloader = document.getElementById("modloader");
    const cover = document.getElementById("cover");
    const qmodDropZone = document.body;
    const generateButton = document.getElementById("generate");
    const qmodButton = document.getElementById("qmodButton");
    var json = {};
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
    qmodDropZone.addEventListener("dragover", function (e) {
        e = e || event;
        e.preventDefault();
    }, false);
    qmodDropZone.addEventListener("drop", function (e) {
        e = e || event;
        e.preventDefault();
    }, false);
    link.onchange = () => {
        var githubLink = "";
        if (link.value.includes("github.com")) {
            githubLink = link.value.substring(0, link.value.indexOf("releases"));
        }
        if (githubLink)
            source.value = githubLink;
    };
    function urlDrop(e) {
        /**
         * @type HTMLInputElement
         **/
        let input = e.currentTarget;
        e.preventDefault();
        e.stopPropagation();
        let url = e.dataTransfer.getData("URL");
        input.value = url;
        input.onchange();
    }
    cover.addEventListener("drop", urlDrop);
    link.addEventListener("drop", urlDrop);
    generate.addEventListener("click", function GenerateJSON(e) {
        console.log("generating");
        if (!json[games.value])
            json[games.value] = [];
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
        window.open(`https://github.com/DanTheMan827/bsqmods/new/main?filename=${encodeURIComponent(`mods/${games.value}/${id.value}-${version.value}.json`)}&value=${encodeURIComponent(JSON.stringify(mod, null, "\t"))}`);
    });
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