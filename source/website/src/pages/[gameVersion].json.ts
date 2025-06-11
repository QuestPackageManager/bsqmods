import type { GetStaticPaths } from "astro";
import { readAllModsJson } from "../../../shared/readAllModsJson";
import { getModGroups } from "../../../shared/getModGroups";

export const getStaticPaths = (() => {
  const modJson = readAllModsJson();
  return Object.keys(modJson).map((key) => ({
    params: {
      gameVersion: key
    }
  }));
}) satisfies GetStaticPaths;

export interface Params {
  gameVersion: string;
}

export function GET({ params, request }: { params: Params; request: Request }): Response {
  const { mappedMods } = getModGroups(readAllModsJson());
  const { gameVersion } = params as Params;
  const modGroups = mappedMods[gameVersion];

  return new Response(JSON.stringify(modGroups));
}
