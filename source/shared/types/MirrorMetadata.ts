import { fetchJson } from "../fetch";
import { Dictionary } from "./Dictionary";
import { isMirrorError, MirrorError } from "./MirrorError";

export interface MirrorMetadata extends Dictionary<MirrorError | string> {}
export function hasMirrorUrl(value: string, metadata: MirrorMetadata): boolean {
  if (metadata[value] && !isMirrorError(metadata[value])) {
    return true;
  }

  return false;
}

export const mirrorBase = `https://github.com/${process.env.GITHUB_REPOSITORY}/releases/download/mod-mirror`;
export const mirrorMetadataUrl = `${mirrorBase}/metadata.json`;

export async function getMirrorMetadata(): Promise<MirrorMetadata> {
  try {
    return (await fetchJson<MirrorMetadata>(`${mirrorMetadataUrl}?${new Date().getTime()}`)).data || {};
  } catch (err) {
    return {};
  }
}
