export function getIndentedMessage(message: string, level = 0, indentation = "  ") {
  return message.replace(/\r/g, "").split("\n").map(line => `${new Array(level + 1).join(indentation)}${line}`).join("\n");
}
