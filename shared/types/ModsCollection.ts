import { Mod } from "./Mod.ts";

export type GameVersion = string;
export interface ModsCollection {
  [key: GameVersion]: Mod[];
}
