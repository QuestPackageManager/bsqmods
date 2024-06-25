/**
 * Function to delete keys from an object that are not in the allowed list.
 *
 * @param obj - The object to be filtered.
 * @param allowedKeys - The list of keys to keep in the object.
 * @returns - The filtered object with only allowed keys.
 */
function deleteKeysNotInList<T extends Record<string, any>>(obj: T, allowedKeys: string[]): Partial<T> {
  for (const key in obj) {
    if (!allowedKeys.includes(key)) {
      delete obj[key];
    }
  }
  return obj;
}
