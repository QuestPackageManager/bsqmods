import { fetchRedirectedLocation } from "../shared/fetch";
import { getGithubIconUrl } from "../shared/getGithubIconUrl";
import { ghRawRegex, ghRawRegexAnywhere } from "../shared/ghRawRegex";
import { ghRegex, ghRegexAnywhere } from "../shared/ghRegex";
import { Mod } from "../shared/types/Mod";
import { iterateSplitMods } from "./shared/iterateMods";

async function doWithRegexMatch(input: string | null | undefined, regex: RegExp, callback: (match: RegExpExecArray) => Promise<void>) {
  if (input == null) {
    return;
  }

  const match = regex.exec(input);

  if (match) {
    await callback(match);
  }
}

for (const iteration of iterateSplitMods()) {
  console.log(iteration.shortModPath);

  try {
    const json = iteration.getModJson();

    for (const key of ["download", "source", "cover", "website", "authorIcon"] as (keyof Mod)[]) {
      await doWithRegexMatch(json[key] as string, ghRegex, async match => {
        const redirected = await fetchRedirectedLocation(`https://github.com/${match[1]}/${match[2]}`);

        const value = json[key] as string | null;

        if (value) {
          (json[key] as string) = value.replace(match[0], redirected)
        }
      });

      await doWithRegexMatch(json[key] as string, ghRawRegex, async rawMatch => {
        const redirected = await fetchRedirectedLocation(`https://github.com/${rawMatch[1]}/${rawMatch[2]}`);
        const redirectedMatch = ghRegex.exec(redirected);

        const value = json[key] as string | null;

        if (value && redirectedMatch) {
          (json[key] as string) = value.replace(rawMatch[0], `https://raw.githubusercontent.com/${redirectedMatch[1]}/${redirectedMatch[2]}/${rawMatch[3]}/`)
        }
      });
    }

    iteration.writeModJson(json);
  } catch (err) {
    console.log(iteration.shortModPath);
    console.error(`  ${err}`);
    console.log("");
  }
}
