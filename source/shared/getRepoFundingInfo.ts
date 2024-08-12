import { cachedFetchJson } from "./cachedFetch";
import { ghRegex } from "./ghRegex";
import { Message, RepoContent, RepoContents } from "./types/GitHubAPI";
import { checkGithubResponse } from "./checkGithubResponse";
import { fetchText } from "./fetch";
import { parse } from "yaml";

async function checkFunding(contents: RepoContent[]) {
  const links = [] as string[];

  for (const file of contents) {
    if (file.name.toLowerCase() == "funding.yml" && file.download_url != null) {
      const fundingFile = await fetchText(file.download_url);

      if (fundingFile.data) {
        const parsed = parse(fundingFile.data);

        for (const key of Object.keys(parsed)) {
          const value = parsed[key];
          switch (key) {
            case "community_bridge":
              if (value) {
                links.push(`https://funding.communitybridge.org/projects/${value}`);
              }
              break;

            case "github":
              if (typeof (value) === "string") {
                if (value) {
                  links.push(`https://github.com/sponsors/${value}`);;
                }
              } else if (value instanceof Array) {
                for (const user of value) {
                  if (user) {
                    links.push(`https://github.com/sponsors/${user}`);
                  }
                }
              }
              break;

            case "issuehunt":
              if (value) {
                links.push(`https://issuehunt.io/r/${value}`);
              }
              break;

            case "ko_fi":
              if (value) {
                links.push(`https://ko-fi.com/${value}`);
              }
              break;

            case "liberapay":
              if (value) {
                links.push(`https://liberapay.com/${value}`);
              }
              break;

            case "open_collective":
              if (value) {
                links.push(`https://opencollective.com/${value}`);
              }
              break;

            case "patreon":
              if (value) {
                links.push(`https://patreon.com/${value}`);
              }
              break;

            case "tidelift":
              if (value) {
                links.push(`https://tidelift.com/funding/github/${value}`);
              }
              break;

            case "polar":
              if (value) {
                links.push(`https://polar.sh/${value}`);
              }
              break;

            case "buy_me_a_coffee":
              if (value) {
                links.push(`https://buymeacoffee.com/${value}`);
              }
              break;

            case "custom":
              if (typeof (value) === "string") {
                if (value) {
                  links.push(`${value}`);;
                }
              } else if (value instanceof Array) {
                for (const link of value) {
                  if (link) {
                    links.push(`${link}`);
                  }
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

export async function getRepoFundingInfo(repoLink: string, subDirectory?: string): Promise<string[]> {
  const match = ghRegex.exec(repoLink);
  const funding = [] as string[];

  if (match) {
    const result = await cachedFetchJson<RepoContents>(`https://api.github.com/repos/${match[1]}/${match[2]}/contents${subDirectory ? `/${subDirectory}` : ""}`);

    if (result.data == null) {
      return funding;
    }

    checkGithubResponse(result.data as Message);

    const dotGithub = (result.data as RepoContent[]).filter(entry => entry.type == "dir" && entry.path.toLowerCase() == ".github")?.at(0)?.path;

    for (const link of await checkFunding(result.data as RepoContent[])) {
      funding.push(link);
    }

    if (funding.length == 0 && dotGithub) {
      for (const link of await getRepoFundingInfo(repoLink, dotGithub)) {
        funding.push(link);
      }
    }

    if (funding.length == 0 && match[2].toLowerCase() != ".github") {
      for (const link of await getRepoFundingInfo(`https://github.com/${match[1]}/.github/`)) {
        funding.push(link);
      }
    }
  }

  return funding;
}
