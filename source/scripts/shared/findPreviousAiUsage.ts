import { compareVersionDescending } from "../../shared/comparisonFunctions";
import { AiUsage, aiUsageValues } from "../../shared/types/AiUsage";
import { iterateSplitMods } from "./iterateMods";

/**
 * Finds the AI usage of a mod from its listed versions. Every version is checked, newest mod version first (newest game
 * version first when a mod version is listed for several), and the first valid value wins. Versions listed before the
 * AI field existed have none, so older versions are still checked.
 * @param id The mod ID, matched case-insensitively.
 * @returns The AI usage, or null when no listed version has one.
 */
export function findPreviousAiUsage(id: string | null): AiUsage | null {
  const wantedId = id?.trim().toLowerCase();

  if (!wantedId) {
    return null;
  }

  const matches: { modVersion: string | null; gameVersion: string; ai: AiUsage }[] = [];

  for (const modData of iterateSplitMods()) {
    let mod;

    try {
      mod = modData.getModJson();
    } catch {
      continue;
    }

    if (mod.id?.toLowerCase() == wantedId && aiUsageValues.includes(mod.ai as AiUsage)) {
      matches.push({ modVersion: mod.version, gameVersion: modData.version, ai: mod.ai as AiUsage });
    }
  }

  matches.sort(
    (a, b) => compareVersionDescending(a.modVersion, b.modVersion) || compareVersionDescending(a.gameVersion, b.gameVersion)
  );

  return matches[0]?.ai ?? null;
}
