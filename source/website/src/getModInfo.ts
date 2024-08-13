import type { CoreMod } from "../../shared/CoreMods";

let mods: ModObject[] | null = null;

export interface ModObject {
  id: string;
  title: string;
  version: string;
  author: string;
  description: string;
  download: string[];
  coreModInfo?: CoreMod;
  source: string | null;
  funding: string[];

  /**
   * Optionally sets the marked state and returns the current state.
   * @param value The new value to set the mark state to.
   * @returns The current mark state.
   */
  isMarked: (value?: boolean) => boolean;

  /**
   * Optionally sets the visibility state and returns the current state.
   * @param value The new value to set the visibility state to.
   * @returns The current visibility state.
   */
  isVisible: (value?: boolean) => boolean;
}

/**
 * Searches the page for mod-card elements and returns information about the mods within.
 *
 * @returns An array of mod information
 */
export function getModInfo(): ModObject[] {
  if (mods === null) {
    mods = ([...document.querySelectorAll<HTMLElement>("mod-card")].map(
      (card) => ({
        id: (card.dataset.modId || "").trim(),
        title: (
          card.querySelector<HTMLElement>("mod-name")?.innerText || ""
        ).trim(),
        version: (
          card.querySelector<HTMLElement>("mod-version")?.innerText || ""
        ).trim(),
        author: (
          card.querySelector<HTMLElement>("mod-author")?.innerText || ""
        ).trim(),
        description: (
          card.querySelector<HTMLElement>("mod-description")?.innerText || ""
        ).trim(),
        download: [...card.querySelectorAll<HTMLAnchorElement>("a.mod-download")].map(a => a.href),
        coreModInfo: card.querySelector<HTMLElement>("core-mod-info")?.dataset as unknown as CoreMod | undefined,
        source: card.querySelector<HTMLAnchorElement>("a.mod-source")?.href || null,
        funding: [...card.querySelectorAll<HTMLAnchorElement>("a.funding-link")].map(link => link.href),
        isMarked: (value) => {
          var mark = card.querySelector<HTMLInputElement>("input.mod-checkbox")!;

          if (value === true || value === false) {
            mark.checked = value;
          }

          return mark.checked;
        },
        isVisible(value) {
          if (value === true) {
            card.style.display = "";
          } else if (value === false) {
            card.style.display = "none";
          }

          return card.style.display != "none";
        },
      })
    ));
  }

  return mods;
}
