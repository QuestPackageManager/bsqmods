/**
 * Returns a message with each line indented by a specified number of indentation levels.
 *
 * @param {string} message - The message to be indented.
 * @param {number} [level=0] - The number of indentation levels to apply to each line. Default is 0.
 * @param {string} [indentation="  "] - The string to use for each level of indentation. Default is two spaces.
 * @returns {string} The indented message.
 */
export function getIndentedMessage(message: string, level = 0, indentation = "  ") {
  // Create the indentation string
  const indent = new Array(level + 1).join(indentation);

  // Split the message into lines, indent each line, and join them back into a single string
  return message
    .replace(/\r/g, "")
    .split("\n")
    .map((line) => `${indent}${line}`)
    .join("\n");
}
