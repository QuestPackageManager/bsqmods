import { unlinkSync } from "fs";
import { iterateSplitMods } from "./shared/iterateMods";
import { fetchHead } from "../shared/fetch";
import { getMirrorMetadata, hasMirrorUrl } from "../shared/types/MirrorMetadata";
import { delay } from "../shared/delay";

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
    let unlinkMod = true;

    for (let i = 0; i < 5; i++) {
      // try a couple times to make sure the file is actually gone
      // and that there wasn't just a temporary hiccup.

      if ((await fetchHead(json.download)) || hasMirrorUrl(json.download, mirrorMetadata)) {
        // We won't be deleting this because the url exists, or we have a mirror.
        unlinkMod = false;
        break;
      }

      // Put in a delay for future attempts just in case.
      delay(1000);
    }

    if (unlinkMod) {
      unlinkSync(iteration.modPath);
    }
  } catch (err) {
    console.log(iteration.shortModPath);
    console.error(`  ${err}`);
    console.log("");
  }
}
