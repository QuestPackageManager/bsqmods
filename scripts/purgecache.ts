import { argv } from "process";
import { isNullOrWhitespace } from "../shared/isNullOrWhitespace";
import { modMetadataPath } from "../shared/paths";
import { existsSync, unlinkSync, writeFileSync } from "fs";
import { basename, resolve } from "path";
import { getQmodHashes } from "./shared/getQmodHashes";
import { getOptimizedCoverFilePath } from "./shared/getOptimizedCoverFilePath";
import { getOriginalCoverFilePath } from "./shared/getOriginalCoverFilePath";
import { getIndentedMessage as indent } from "../shared/getIndentedMessage";

/** The name of the currently running script. */
const scriptName = basename(import.meta.filename);

/** A dictionary of all hashes for given urls. */
const saveMetadata = getQmodHashes();

/**
 * Purges the cached images and saved hashes for the given URLs.
 * @param urls - An array of URLs whose cache and hashes need to be purged.
 */
export function purgeCache(urls: string[]) {
  for (const url of urls) {
    const metadata = saveMetadata[url];

    if (metadata) {
      console.log(`Removing hash for ${url}`);

      if (metadata.image?.hash) {
        const referenceCount = Object.values(saveMetadata).filter(meta => meta.image?.hash && meta.image.hash == metadata.image?.hash).length;

        console.log(indent(`Cover reference count: ${referenceCount}`, 1))

        // If the cached image exists, and only one entry is referencing it, delete it
        if (referenceCount == 1) {
          for (const path of [
            getOptimizedCoverFilePath(metadata.image),
            getOriginalCoverFilePath(metadata.image)
          ]) {
            if (path && existsSync(path)) {
              console.log(indent(`Deleting ${basename(path)}`, 1));
              unlinkSync(path);
            }
          }
        }
      }

      // Remove the hash for the URL
      delete saveMetadata[url];

      // Update the hashes file
      writeFileSync(modMetadataPath, JSON.stringify(saveMetadata));
    }
  }
}

/**
 * Main entry point of the script.
 * Checks if the script is run directly and processes the command line arguments.
 */
if (argv.length > 1 && resolve(import.meta.filename) == resolve(argv[1])) {
  // Check if there are command line arguments provided
  if (argv.length > 2) {
    // Check if the first argument is not null or whitespace
    if (!isNullOrWhitespace(argv[2])) {
      if (argv[2] === "--all") {
        // If the argument is "--all", purge the cache for all saved URLs
        purgeCache(Object.keys(saveMetadata));
      } else {
        // Otherwise, split the argument by '|' and purge the cache for the specified URLs
        purgeCache(argv[2].split("|"));
      }
    }
  } else {
    // If no arguments are provided, display the usage information
    console.log([
      `Usage: ${scriptName} [--all] [urls]`,
      '',
      'This script purges the cached images and saved hashes.',
      '',
      'Options:',
      '  --all        Clear the entire cache.',
      '',
      'Arguments:',
      '  urls         A list of URLs to purge, separated by \'|\'.',
      '',
      'Examples:',
      `  node ${scriptName} --all`,
      `  node ${scriptName} "http://example.com/mod1.qmod|http://example.com/mod2.qmod"`
    ].join('\n'));
  }
}
