import { unlinkSync } from "fs";
import { iterateSplitMods } from "./shared/iterateMods";
import { fetchHead } from "../shared/fetch";
import { getMirrorMetadata, hasMirrorUrl } from "../shared/types/MirrorMetadata";

const mirrorMetadata = await getMirrorMetadata();

console.log(mirrorMetadata);

for (const iteration of iterateSplitMods()) {
  console.log(iteration.shortModPath);
  const json = iteration.getModJson();

  if (!json.download) {
    unlinkSync(iteration.modPath);
    continue;
  }

  try {

    if (!(await fetchHead(json.download)) && !hasMirrorUrl(json.download, mirrorMetadata)) {
      unlinkSync(iteration.modPath)
    }
  } catch (err) {
    console.log(iteration.shortModPath);
    console.error(`  ${err}`);
    console.log("");
  }
}
