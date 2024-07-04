import fetch from "npm:node-fetch";

/**
 * Checks if a URL is accessible by sending a HEAD request.
 *
 * @param url - The URL to check.
 * @returns - Returns true if the URL is accessible, otherwise false.
 */
export async function checkUrl(url: string): Promise<boolean> {
  try {
    const res = await fetch(url, { method: "HEAD" });

    if (!res.ok) {
      // If the response status is not OK, return false
      return false;
    }

    return true;
  } catch (error) {
    // Handle fetch error
    return false;
  }
}
