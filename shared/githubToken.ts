var token: string | undefined | null = undefined;

export async function getGithubToken() {
  if (token !== undefined) {
    return token;
  }

  try {
    const process = await import("process");
    token = process.env.GITHUB_TOKEN || null;
  } catch (err) {
    // Silently ignore.  If we failed, we're probably in a browser.
    token = null;
  }

  return token;
}
