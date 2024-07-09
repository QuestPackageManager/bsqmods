import { fetchHead } from "../shared/fetch";
import { getGithubIconUrl } from "../shared/getGithubIconUrl";
import { CapturingLogger } from "../shared/Logger";
import { writeIndentedLogMessage } from "../shared/writeIndentedLogMessage";
import { importRemoteQmod } from "./import";
import { iterateSplitMods } from "./shared/iterateMods";

for (const iteration of iterateSplitMods()) {
  try {
    const json = iteration.getModJson();

    if (json.cover && !(await fetchHead(json.cover))) {
      json.cover = null;
      iteration.writeModJson(json);
    }

    const logger = new CapturingLogger();

    if (!json.download) {
      continue;
    }

    const newJson = await importRemoteQmod(json.download, iteration.version, false, logger);

    if (logger.getErrorMessages().length == 0) {
      if (json.cover == null && newJson?.cover != null) {
        json.cover = json.cover || newJson?.cover || null
        iteration.writeModJson(json);
      }
    } else {
      console.log(iteration.shortModPath)

      for (const message of logger.getMessages()) {
        writeIndentedLogMessage(message)
      }

      console.log("");
    }
  } catch (err) {
    console.log(iteration.shortModPath);
    console.error(`  ${err}`);
    console.log("");
  }
}
