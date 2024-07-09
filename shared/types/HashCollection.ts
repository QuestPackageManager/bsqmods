import { Dictionary } from "./Dictionary";

/**
 * Represents a SHA-1 hash value.
 */
export type Sha1Hash = string;

/**
 * Represents a collection of SHA-1 hash values, indexed by strings.
 */
export type HashCollection = Dictionary<Sha1Hash>;
