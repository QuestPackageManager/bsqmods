import { iterateSplitMods } from "./shared/iterateMods";
import { CapturingLogger, LogLevel } from "../shared/Logger";
import { writeIndentedLogMessage } from "../shared/writeIndentedLogMessage";
import { updateModDependencies } from "./shared/updateModDependencies";

for (const iteration of iterateSplitMods()) {
  const mod = iteration.getModJson();
  const logger = new CapturingLogger();
  console.log(iteration.shortModPath);

  await updateModDependencies(mod, logger);

  for (const message of logger.getMessages()) {
    writeIndentedLogMessage(message);
  }

  if (logger.getMessages().filter(m => m.level === LogLevel.Error).length == 0) {
    iteration.writeModJson(mod);
  }
}
