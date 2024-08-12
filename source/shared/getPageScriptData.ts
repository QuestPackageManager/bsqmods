/**
 * Retrieves and parses the page script data from the `data-page-script-data` attribute
 * of the document's body element.
 *
 * @template T - The expected type of the parsed data.
 * @returns The parsed data as an object of type T.
 *
 * @example
 * ```typescript
 * // Assuming the body element has a data-page-script-data attribute with JSON data:
 * // <body data-page-script-data='{"key": "value"}'>
 * interface MyData {
 *   key: string
 * }
 *
 * const data = getPageScriptData<MyData>();
 * console.log(data.key); // Output: "value"
 * ```
 */
export function getPageScriptData<T extends object>(): T {
  return JSON.parse(document.body.dataset?.pageScriptData ?? "{}") as T;
}
