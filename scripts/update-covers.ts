import { fetchHead, fetchJson } from "../shared/fetch";
import { getQmodCoverUrl } from "../shared/getQmodCoverUrl";
import { delay } from "../shared/delay"
import { iterateSplitMods } from "./shared/iterateMods";

console.log("GitHub API", (await fetchJson("https://api.github.com/rate_limit")).data)

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
  } catch (err: any) {
    console.error(`  ${err}`);
    console.log("");

    if ((err?.message || "").startsWith("API issue.")) {
      process.exit(1);
    }
  }
}
