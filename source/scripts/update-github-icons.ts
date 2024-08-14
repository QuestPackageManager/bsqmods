import { getGithubIconUrl } from "../shared/getGithubIconUrl";
import { iterateSplitMods } from "./shared/iterateMods";

for (const iteration of iterateSplitMods()) {
  try {
    var json = iteration.getModJson();

    if (json.authorIcon == null) {
      if ((json.authorIcon = (await getGithubIconUrl(json.download as string)).data)) {
        iteration.writeModJson(json);
      }
    }
  } catch (err) {
    console.log(iteration.shortModPath);
    console.error(`  ${err}`);
    console.log("");
  }
}
