import { getIndentedMessage as indent } from "./getIndentedMessage";
import { Logger } from "./Logger";


export class IndentedConsoleLogger implements Logger {
  private level: number;

  log(...data: any[]) {
    const message = indent(data.map(element => `${element}`).join("\n"), this.level);
    console.log(message);
  }
  debug(...data: any[]) {
    const message = indent(data.map(element => `${element}`).join("\n"), this.level);
    console.debug(message);
  }
  warn(...data: any[]) {
    const message = indent(data.map(element => `${element}`).join("\n"), this.level);
    console.warn(message);
  }
  error(...data: any[]) {
    const message = indent(data.map(element => `${element}`).join("\n"), this.level);
    console.error(message);
  }

  constructor(level = 0) {
    this.level = level;
  }
}
