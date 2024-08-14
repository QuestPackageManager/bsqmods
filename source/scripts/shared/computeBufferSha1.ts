import crypto from "crypto";

/**
 * Computes the SHA-1 hash of a given buffer.
 *
 * @param buffer - The buffer to hash.
 * @returns - The SHA-1 hash of the buffer.
 */
export function computeBufferSha1(buffer: Buffer): string {
  const hash = crypto.createHash("sha1");

  hash.update(buffer);

  return hash.digest("hex");
}
