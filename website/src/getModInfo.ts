let mods: ModObject[] | null = null;

export interface ModObject {
  id: string;
  title: string;
  version: string;
  author: string;
  description: string;
  download: string[];
  source: string | null;
  funding: string[];
  show: () => void;
  hide: () => void;
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
        id: (card.dataset.modId || "").toLowerCase(),
        title: (
          card.querySelector<HTMLElement>("mod-name")?.innerText || ""
        ).toLowerCase(),
        version: (
          card.querySelector<HTMLElement>("mod-version")?.innerText || ""
        ).toLowerCase(),
        author: (
          card.querySelector<HTMLElement>("mod-author")?.innerText || ""
        ).toLowerCase(),
        description: (
          card.querySelector<HTMLElement>("mod-description")?.innerText || ""
        ).toLowerCase(),
        download: [...card.querySelectorAll<HTMLAnchorElement>("a.mod-download")].map(a => a.href),
        source: card.querySelector<HTMLAnchorElement>("a.mod-source")?.href || null,
        funding: [...card.querySelectorAll<HTMLAnchorElement>("a.funding-link")].map(link => link.href),
        show: () => card.style.display = "",
        hide: () => card.style.display = "none"
      })
    ));
  }

  return mods;
}
