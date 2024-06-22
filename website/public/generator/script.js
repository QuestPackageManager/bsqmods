/**
 * @typedef {Object} Mod
 * @property {string?} name - The name of the mod.
 * @property {string?} description - A description of what the mod does.
 * @property {string?} id - The ID of the mod.
 * @property {string?} version - The version of the mod.
 * @property {string?} download - A direct link to the .qmod file.
 * @property {string?} source - A link to the source code for the mod.
 * @property {string?} website - A link to a website for the mod.
 * @property {string?} funding - A link to a page where people can donate some money.
 * @property {string?} porter - The porter(s) of the mod.
 * @property {string?} author - The author(s) of the mod.
 * @property {string?} cover - A direct link to a cover image.
 * @property {string?} modloader - The mod loader used by the mod.
 * @property {string?} packageVersion - The version of the game the mod is made for.
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
  const modNameElement = document.getElementById("modName");

  /**
   * @type {HTMLTextAreaElement}
   */
  const modDescriptionElement = document.getElementById("modDescription");

  /**
   * @type {HTMLInputElement}
   */
  const modIdElement = document.getElementById("modId");

  /**
   * @type {HTMLButtonElement}
   */
  const loadQmodElement = document.getElementById("loadQmod");

  /**
   * @type {HTMLInputElement}
   */
  const modDownloadLinkElement = document.getElementById("modDownloadLink");

  /**
   * @type {HTMLInputElement}
   */
  const modSourceLinkElement = document.getElementById("modSourceLink");

  /**
   * @type {HTMLInputElement}
   */
  const modWebsiteLinkElement = document.getElementById("modWebsiteLink");

  /**
   * @type {HTMLInputElement}
   */
  const modFundingLinkElement = document.getElementById("modFundingLink");

  /**
   * @type {HTMLInputElement}
   */
  const modCoverElement = document.getElementById("modCover");

  /**
   * @type {HTMLInputElement}
   */
  const modCreatorsElement = document.getElementById("modCreators");

  /**
   * @type {HTMLInputElement}
   */
  const modVersionElement = document.getElementById("modVersion");

  /**
   * @type {HTMLInputElement}
   */
  const targetGameVersionElement = document.getElementById("targetGameVersion");

  /**
   * @type {HTMLInputElement}
   */
  const modLoaderElement = document.getElementById("modLoader");

  /**
   * @type {HTMLElement}
   */
  const qmodDropZoneElement = document.getElementById("qmodDropZone");

  /**
   * @type {HTMLButtonElement}
   */
  const generateButtonElement = document.getElementById("generateJson");

  /**
   * JSON object containing mod data. The key is the target game version, and the value is an array of mods for that game version.
   * @type {Object.<string, Mod[]>}
   */
  let modJson = {};

  // Load the mod.json file
  (async function loadModJson() {
    try {
      const response = await fetch(`../mods.json?${Math.floor(Date.now() / 1000)}`);

      if (response.ok) {
        modJson = await response.json();
      }
    } catch (error) { }
  })();

  /**
   * Sanitizes the given filename by removing invalid filename characters.
   * @param {string} input The filename to sanitize.
   * @returns The sanitized filename.
   */
  function sanitizeFilename(input) {
    // Define a regex pattern for invalid filename characters
    // This pattern includes characters not allowed in Windows filenames
    const invalidChars = /[<>:"\/\\|?*\x00-\x1F]+/g;

    // Replace invalid characters with underscore
    return input.replace(invalidChars, '_');
  }

  /**
   * Gets the intended filename for the given mod values.
   * @param {string} id The mod ID.
   * @param {string} version The mod version.
   * @param {string} gameVersion The game version.
   * @returns
   */
  function getFilename(id, version, gameVersion) {
    return `mods/${sanitizeFilename(gameVersion.trim())}/${sanitizeFilename(`${id.trim()}-${version.trim()}.json`)}`;
  }

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
    const versionMods = modJson[gameVersion];

    if (versionMods == null) {
      return false;
    }

    // Loop through all mods for the specified game version
    for (const mod of versionMods) {
      // Check if mod id and version match the given id and version
      if (mod.id == id && mod.version == version) {
        return true;
      }
    }

    return false;
  }

  function readQmodFile(file) {
    const reader = new FileReader();

    console.log(`… ${file.name}`);

    reader.onloadend = qmodLoadHandler;
    reader.readAsArrayBuffer(file);
  }

  /**
   * Creates a temporary file input element and clicks it to select a .qmod file and load its information.
   * @this {HTMLElement}
   * @param {MouseEvent} e
   */
  function loadQmod(e) {
    /**
     * @type {HTMLInputElement}
     */
    const input = document.createElement("input");

    input.setAttribute("type", "file");
    input.onchange = function (e) {
      if (!this.files[0]) {
        return;
      }

      readQmodFile(this.files[0]);
    };
    input.click();
  }

  /**
   * Generates JSON for the mod, and opens a GitHub page with a new file pre-populated with it, or the existing file if it already exists.
   */
  function generateJson() {
    if (!modJson[targetGameVersionElement.value]) {
      modJson[targetGameVersionElement.value] = [];
    }

    /**
     * @type {Mod}
     */
    let mod = {
      name: modNameElement.value.trim(),
      description: modDescriptionElement.value.trim(),
      id: modIdElement.value.trim(),
      version: modVersionElement.value.trim(),
      author: modCreatorsElement.value.trim(),
      modloader: modLoaderElement.value.trim(),
      download: modDownloadLinkElement.value.trim(),
      source: modSourceLinkElement.value.trim(),
      cover: modCoverElement.value.trim(),
      funding: modFundingLinkElement.value.trim(),
      website: modWebsiteLinkElement.value.trim()
    };

    for (const key in mod) {
      if (mod[key] == "") {
        mod[key] = null;
      }
    }

    const modFilename = getFilename(mod.id || "", mod.version || "", targetGameVersionElement.value);

    if (checkMod(mod.id, mod.version, targetGameVersionElement.value)) {
      alert("This mod version already exists in the json");
      window.open(`https://github.com/DanTheMan827/bsqmods/edit/main/${modFilename}`);
    } else {
      window.open(`https://github.com/DanTheMan827/bsqmods/new/main?filename=${encodeURIComponent(modFilename)}&value=${encodeURIComponent(JSON.stringify(mod, null, "  "))}`);
    }
  }

  /**
   * Function to handle dropping of URLs on a text input.
   * @this {HTMLInputElement}
   * @param {DragEvent} e - The event object.
   */
  function urlDropHandler(e) {
    e.preventDefault();
    e.stopPropagation();

    /**
     * @type {HTMLInputElement}
     */
    const input = e.currentTarget;
    const url = e.dataTransfer.getData("URL");

    input.value = url;
    input.dispatchEvent(new Event("change"));
  }

  /**
   * Function to handle loading of QMOD files.
   * @this {FileReader}
   * @param {ProgressEvent<FileReader>} ev - The event object.
   */
  async function qmodLoadHandler(ev) {
    const reader = this;

    try {
      const zip = await JSZip.loadAsync(reader.result);

      /**
       * @type {Mod}
       */
      const modInfo = JSON.parse(await zip.file("mod.json").async("string"));

      modNameElement.value = modInfo.name || "";
      modDescriptionElement.value = modInfo.description || "";
      modIdElement.value = modInfo.id || "";
      modVersionElement.value = modInfo.version || "";
      modCreatorsElement.value = (!modInfo.porter ? "" : modInfo.porter + ",") + modInfo.author;
      targetGameVersionElement.value = modInfo.packageVersion || "";
      modLoaderElement.value = modInfo.modloader ?? "QuestLoader";
      modFundingLinkElement.value = modInfo.funding || "";
      modWebsiteLinkElement.value = modInfo.website || "";

      console.log(modInfo);
    } catch (error) {
      console.error('Error loading QMOD file:', error);
    }
  }

  /**
   * Function to handle drag/drop of qmod files on the drop zone.
   * @this {HTMLElement}
   * @param {DragEvent} e
   */
  function qmodDropHandler(e) {
    e.preventDefault();
    e.stopPropagation();

    const files = e.dataTransfer.items
      ? [...e.dataTransfer.items].filter(item => item.kind === "file").map(item => item.getAsFile())
      : [...e.dataTransfer.files];

    for (const file of files) {
      readQmodFile(file);
    }
  }

  /**
   * Fills in the source code text input if the link is from GitHub.
   * @this {HTMLInputElement}
   * @param {Event} e
   */
  function modDownloadLinkChangeHandler(e) {
    const match = ghRegex.exec(modDownloadLinkElement.value.trim());

    if (match && modSourceLinkElement.value.trim().length == 0) {
      modSourceLinkElement.value = `https://github.com/${match[1]}/${match[2]}`;
    }

    if (match && modWebsiteLinkElement.value.trim().length == 0) {
      modWebsiteLinkElement.value = `https://github.com/${match[1]}/${match[2]}`;
    }
  }

  // Prevent default behavior for dragover event
  qmodDropZoneElement.addEventListener("dragover", e => e.preventDefault(), false);

  // Event listener for dropping files into the qmodDropZone
  qmodDropZoneElement.addEventListener("drop", qmodDropHandler);

  // Event listener for clicking the QMOD button
  loadQmodElement.addEventListener("click", loadQmod);

  // Event listener for onchange event of link input
  modDownloadLinkElement.addEventListener("change", modDownloadLinkChangeHandler);

  // Add url drop handlers to the following
  for (const element of [modDownloadLinkElement, modSourceLinkElement, modWebsiteLinkElement, modFundingLinkElement, modCoverElement]) {
    element.addEventListener("drop", urlDropHandler);
  }

  // Event listener for generate button click event
  generateButtonElement.addEventListener("click", generateJson);
})().catch(error => {
  console.error(error);

  alert("An error has occurred during initialization, please see the console for more information.");
});
