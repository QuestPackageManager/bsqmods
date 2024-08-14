import { parseQueryString } from "../parseQueryString";
import { ModLoader } from "./ModLoader";

/**
 * Describes the query string parameters sent by QAVS.
 */
export interface QavsQueryString {
  /** The game version reported by QAVS. */
  version?: string;

  /** If QAVS is requesting the page. */
  isqavs?: string;

  /** The port to use when linking back to qavs. */
  port?: string;

  /** If the game is modded. */
  ismodded?: string;

  /** The mod loader currently installed. */
  modloader?: string;
}

export interface QavsQueryData {
  /** The game version reported by QAVS. */
  version?: string;

  /** If QAVS is requesting the page. */
  isQavs: boolean;

  /** The port to use when linking back to qavs. */
  port?: number;

  /** If the game is modded. */
  isModded: boolean;

  /** The mod loader currently installed. */
  modLoader?: ModLoader;
}

export function getQavsQueryData(url: string = location.href): QavsQueryData {
  const parsed = parseQueryString<QavsQueryString>(url);
  return {
    version: parsed.version,
    isQavs: parsed.isqavs?.toLowerCase() == "true",
    port: (parsed.port || "").match(/^\d+$/) ? parseInt(parsed.port!) : undefined,
    isModded: parsed.ismodded?.toLowerCase() == "true",
    modLoader: Object.keys(ModLoader).includes(parsed.modloader || "") ? (parsed.modloader as ModLoader) : undefined
  };
}
