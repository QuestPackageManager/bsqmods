/**
 * Fetches the final redirected location of a URL.
 *
 * @param url - The URL to fetch the redirected location for.
 * @returns A promise that resolves to the redirected location URL, or the original URL if no redirection occurs.
 */
export async function fetchRedirectedLocation(url: string): Promise<string> {
  try {
    const response = await fetch(url, { method: 'HEAD', redirect: 'manual' });

    if (response.status >= 300 && response.status < 400 && response.headers.get('location')) {
      const redirectedUrl = new URL(response.headers.get('location') as string, url).href;
      return redirectedUrl;
    } else {
      return url;
    }
  } catch (error: any) {
    throw new Error(`Error fetching redirected URL: ${error.message}`);
  }
}
