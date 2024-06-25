import crypto from "crypto";
import fs from "fs";
import fetch from "node-fetch";

/**
 * Downloads a file from a URL and saves it to a specified destination, returning the SHA-1 hash of the file.
 *
 * @param url - The URL to download the file from.
 * @param dest - The destination path to save the downloaded file.
 * @returns - Returns the SHA-1 hash of the downloaded file, or null if the download failed.
 */
export async function downloadFile(url: string, dest: string): Promise<string | null> {
  try {
    const res = await fetch(url);

    if (!res.ok || !res.body) {
      // If the response status is not OK or the body isn't present, return null
      return null;
    }

    const fileStream = fs.createWriteStream(dest);
    const hash = crypto.createHash('sha1');
    const writableStream = res.body.pipe(fileStream);

    res.body.on('data', (chunk: Buffer) => {
      hash.update(chunk);
    });

    return new Promise((resolve, reject) => {
      writableStream.on('finish', () => {
        const sha1 = hash.digest('hex');
        resolve(sha1);
      });

      writableStream.on('error', (err: any) => {
        fs.unlink(dest, () => reject(err)); // Delete the file if there's an error
      });
    });
  } catch (error) {
    return null;
  }
}
