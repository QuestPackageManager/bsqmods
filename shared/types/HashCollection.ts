
/** The target version of the game. */

export type Url = string;
export type Sha1Hash = string;

export interface HashCollection {
  [key: Url]: Sha1Hash
}
