export interface CoreModCollection {
  [key: string]: CoreMods;
}
export interface CoreMods {
  lastUpdated: string;
  mods: CoreMod[];
}

export interface CoreMod {
  id: string;
  version: string;
  downloadLink: string;
  filename?: string;
}

export async function getCoreMods(): Promise<CoreModCollection> {
  const res = await fetch(
    "https://raw.githubusercontent.com/QuestPackageManager/bs-coremods/main/core_mods.json",
  );

  if (!res.ok || !res.body) {
    return {}
  }

  return await res.json();
}
