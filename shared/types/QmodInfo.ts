import { Mod } from "./Mod";

export interface QmodInfo extends Mod {
  /**
   * The porter(s) of the mod.
   */
  porter: string | null;

  /**
   * The version of the game the mod is made for.
   */
  packageVersion: string | null;
}
