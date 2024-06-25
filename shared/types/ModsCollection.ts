import { Mod } from "./Mod";

export type GameVersion = string;
export interface ModsCollection {
  [key: GameVersion]: Mod[];
}
