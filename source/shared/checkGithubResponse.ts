import { Message } from "./types/GitHubAPI";

/**
 * Throws an error if the data given is a GitHub API error message
 * @param data The data to check.
 */
export function checkGithubResponse(data: Message) {
  if (data && data.message) {
    throw new Error([data.message, data.documentation_url].join("\n\n").trim());
  }
}
