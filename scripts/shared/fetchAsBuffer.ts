import fetch from "node-fetch";

/**
 * Fetches a resource from the given URL and returns it as a buffer.
 *
 * @param url - The URL of the resource to fetch.
 * @returns A promise that resolves to a buffer containing the fetched resource.
 * @throws - Throws an error if the HTTP response status is not ok.
 */
export async function fetchAsBuffer(url: string): Promise<Buffer> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  const buffer = await response.buffer();
  return buffer;
}
