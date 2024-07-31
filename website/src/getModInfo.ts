let mods: ModObject[] | null = null;

export interface ModObject {
  element: HTMLElement;
  id: string;
  title: string;
  version: string;
  author: string;
  description: string;
  download: string;
  source: string | null
  funding: string[]
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
        element: card,
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
        download: card.querySelector<HTMLAnchorElement>("a.mod-download")!.href,
        source: card.querySelector<HTMLAnchorElement>("a.mod-source")?.href || null,
        funding: [...card.querySelectorAll<HTMLAnchorElement>("a.funding-link")].map(link => link.href)
      })
    ));
  }

  return mods;
}
