import { fundingInfoPath } from "../../shared/paths";
import { Dictionary } from "../../shared/types/Dictionary";
import { readTextFile } from "./readTextFile";

export async function getFundingCache(): Promise<Dictionary<string[]>> {
  return JSON.parse(await readTextFile(fundingInfoPath, "{}"));
}
