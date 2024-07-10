import { fetchHead } from "../shared/fetch";
import { getQmodCoverUrl } from "../shared/getQmodCoverUrl";
import { delay } from "../shared/delay"
import { iterateSplitMods } from "./shared/iterateMods";

for (const iteration of iterateSplitMods()) {
  try {
    console.log(iteration.shortModPath);
    const json = iteration.getModJson();

    if (json.cover && !(await fetchHead(json.cover))) {
      json.cover = null;
      iteration.writeModJson(json);
    }

    if (!json.download) {
      continue;
    }

    if (!json.cover) {
      json.cover = await getQmodCoverUrl(json.download);
      iteration.writeModJson(json);

      // Delay to keep GitHub happy.
      await delay(2000);
    }
  } catch (err) {
    console.error(`  ${err}`);
    console.log("");
  }
}
