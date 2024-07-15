import { match } from "assert";
import { cachedFetchJson } from "./cachedFetch";
import { ghRegex } from "./ghRegex";
import { Message, RepoContent, RepoContents } from "./types/GitHubAPI";
import { checkGithubResponse } from "./checkGithubResponse";
import { fetchText } from "./fetch";
import { parse } from "yaml";

async function checkFunding(contents: RepoContent[]) {
  const links = [] as string[];

  for (const file of contents) {
    if (file.path.toLowerCase() == "funding.yml" && file.download_url != null) {
      const fundingFile = await fetchText(file.download_url);

      if (fundingFile.data) {
        const parsed = parse(fundingFile.data);

        for (const key of Object.keys(parsed)) {
          const value = parsed[key];
          switch (key) {
            case "community_bridge":
              links.push(`https://funding.communitybridge.org/projects/${value}`)
              break;

            case "github":
              if (typeof (value) === "string") {
                links.push(`https://github.com/sponsors/${value}`);
              } else if (value instanceof Array) {
                for (const user of value) {
                  links.push(`https://github.com/sponsors/${user}`);
                }
              }
              break;

            case "issuehunt":
              links.push(`https://issuehunt.io/r/${value}`)
              break;

            case "ko_fi":
              links.push(`https://ko-fi.com/${value}`)
              break;

            case "liberapay":
              links.push(`https://liberapay.com/${value}`)
              break;

            case "open_collective":
              links.push(`https://opencollective.com/${value}`)
              break;

            case "patreon":
              links.push(`https://patreon.com/${value}`)
              break;

            case "tidelift":
              links.push(`https://tidelift.com/funding/github/${value}`)
              break;

            case "polar":
              links.push(`https://polar.sh/${value}`)
              break;

            case "buy_me_a_coffee":
              links.push(`https://buymeacoffee.com/${value}`)
              break;

            case "custom":
              if (typeof (value) === "string") {
                links.push(`${value}`);
              } else if (value instanceof Array) {
                for (const link of value) {
                  links.push(`${link}`);
                }
              }
              break;
          }
        }
      }
      break;
    }
  }

  return links;
}

export async function getRepoFundingInfo(link: string): Promise<string[]> {
  const match = ghRegex.exec(link);
  const funding = [] as string[];

  if (match) {
    const result = await cachedFetchJson<RepoContents>(`https://api.github.com/repos/${match[1]}/${match[2]}/contents`);

    if (result.data == null) {
      return funding;
    }

    checkGithubResponse(result.data as Message);

    for (const link of await checkFunding(result.data as RepoContent[])) {
      funding.push(link);
    }

    if (funding.length == 0 && match[2].toLowerCase() != ".github") {
      for (const link of await getRepoFundingInfo(`https://github.com/${match[1]}/.github/`)) {
        funding.push(link);
      }
    }
  }

  return funding;
}
