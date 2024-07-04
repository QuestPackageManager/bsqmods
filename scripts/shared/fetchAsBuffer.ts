import fetch from "npm:node-fetch";

/**
 * Fetches a resource from the given URL and returns it as a buffer.
 *
 * @param url - The URL of the resource to fetch.
 * @returns A promise that resolves to a buffer containing the fetched resource.
 * @throws - Throws an error if the HTTP response status is not ok.
 */
export async function fetchAsBuffer(url: string): Promise<ArrayBuffer | null> {
  try {
    const res = await fetch(url);

    if (!res.ok || !res.body) {
      // If the response status is not OK or the body isn't present, return null
      return null;
    }

    return await res.arrayBuffer();
  } catch (error) {
    return null;
  }
}
