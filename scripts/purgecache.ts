import { argv } from "process";
import { isNullOrWhitespace } from "../shared/isNullOrWhitespace";
import { hashesPath, coversPath } from "./shared/paths";
import { existsSync, unlinkSync, writeFileSync } from "fs";
import { basename, join, resolve } from "path";
import { getQmodHashes } from "./shared/getQmodHashes";

/** The name of the currently running script. */
const scriptName = basename(import.meta.filename);

/** A dictionary of all hashes for given urls. */
const savedHashes = getQmodHashes();

/**
 * Purges the cached images and saved hashes for the given URLs.
 * @param urls - An array of URLs whose cache and hashes need to be purged.
 */
export function purgeCache(urls: string[]) {
  for (const url of urls) {
    const hash = savedHashes[url];

    if (hash) {
      const coverPath = join(coversPath, `${hash}.png`);

      // If the cached image exists, delete it
      if (existsSync(coverPath)) {
        console.log(`Deleting ${basename(coverPath)}`);
        unlinkSync(coverPath);
      }

      // Remove the hash for the URL
      console.log(`Removing hash for ${url}`);
      delete savedHashes[url];

      // Update the hashes file
      writeFileSync(hashesPath, JSON.stringify(savedHashes, null, "  "));
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
        purgeCache(Object.keys(savedHashes));
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
