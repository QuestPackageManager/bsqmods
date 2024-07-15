import { fetchJson } from "./fetch";
import { RateLimits } from "./types/GitHubAPI";

export async function logGithubApiUsage() {
  console.log("GitHub API", (await fetchJson<RateLimits>("https://api.github.com/rate_limit")).data);
}
