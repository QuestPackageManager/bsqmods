/**
 * ANSI escape sequences for colors and formatting.
 * Supports standard, 8-bit, and 24-bit colors, plus text formatting.
 */
export namespace ANSI {
  /**
   * Resets all attributes (colors and styles) to default.
   */
  export const reset = "\x1b[0m";

  export enum Styles {
    /**
     * Bold or increased intensity.
     */
    bold = "\x1b[1m",
    /**
     * Faint (decreased intensity). Not widely supported.
     */
    faint = "\x1b[2m",
    /**
     * Italic. Not widely supported.
     */
    italic = "\x1b[3m",
    /**
     * Underline.
     */
    underline = "\x1b[4m",
    /**
     * Slow Blink (less than 150 per minute).
     */
    blinkSlow = "\x1b[5m",
    /**
     * Rapid Blink (150+ per minute). Not widely supported.
     */
    blinkRapid = "\x1b[6m",
    /**
     * Reverse video (swap foreground and background).
     */
    inverse = "\x1b[7m",
    /**
     * Conceal (hide text). Not widely supported.
     */
    conceal = "\x1b[8m",
    /**
     * Crossed-out (marked for deletion). Not widely supported.
     */
    crossedOut = "\x1b[9m",
    /**
     * Primary (default) font.
     */
    primaryFont = "\x1b[10m",
    /**
     * Alternate font 1.
     */
    font1 = "\x1b[11m",
    /**
     * Alternate font 2.
     */
    font2 = "\x1b[12m",
    /**
     * Alternate font 3.
     */
    font3 = "\x1b[13m",
    /**
     * Alternate font 4.
     */
    font4 = "\x1b[14m",
    /**
     * Alternate font 5.
     */
    font5 = "\x1b[15m",
    /**
     * Alternate font 6.
     */
    font6 = "\x1b[16m",
    /**
     * Alternate font 7.
     */
    font7 = "\x1b[17m",
    /**
     * Alternate font 8.
     */
    font8 = "\x1b[18m",
    /**
     * Alternate font 9.
     */
    font9 = "\x1b[19m",
    /**
     * Fraktur (hardly ever supported).
     */
    fraktur = "\x1b[20m",
    /**
     * Bold off or double underline (hardly ever supported).
     */
    boldOffOrDoubleUnderline = "\x1b[21m",
    /**
     * Normal color or intensity (neither bold nor faint).
     */
    normalIntensity = "\x1b[22m",
    /**
     * Not italic, not Fraktur.
     */
    notItalicOrFraktur = "\x1b[23m",
    /**
     * Underline off.
     */
    underlineOff = "\x1b[24m",
    /**
     * Blink off.
     */
    blinkOff = "\x1b[25m",
    /**
     * Inverse off.
     */
    inverseOff = "\x1b[27m",
    /**
     * Reveal (conceal off).
     */
    reveal = "\x1b[28m",
    /**
     * Not crossed out.
     */
    notCrossedOut = "\x1b[29m",
    /**
     * Framed.
     */
    framed = "\x1b[51m",
    /**
     * Encircled.
     */
    encircled = "\x1b[52m",
    /**
     * Overlined.
     */
    overlined = "\x1b[53m",
    /**
     * Not framed or encircled.
     */
    notFramedOrEncircled = "\x1b[54m",
    /**
     * Not overlined.
     */
    notOverlined = "\x1b[55m",
    /**
     * Ideogram underline (hardly ever supported).
     */
    ideogramUnderline = "\x1b[60m",
    /**
     * Ideogram double underline (hardly ever supported).
     */
    ideogramDoubleUnderline = "\x1b[61m",
    /**
     * Ideogram overline (hardly ever supported).
     */
    ideogramOverline = "\x1b[62m",
    /**
     * Ideogram double overline (hardly ever supported).
     */
    ideogramDoubleOverline = "\x1b[63m",
    /**
     * Ideogram stress marking (hardly ever supported).
     */
    ideogramStressMarking = "\x1b[64m",
    /**
     * Ideogram attributes off (reset effects of 60-64).
     */
    ideogramAttributesOff = "\x1b[65m"
  }

  /**
   * Contains ANSI escape codes for colors.
   */
  export namespace Colors {
    /**
     * Standard foreground colors.
     */
    export enum Foreground {
      /**
       * Black foreground.
       */
      black = "\x1b[30m",
      /**
       * Red foreground.
       */
      red = "\x1b[31m",
      /**
       * Green foreground.
       */
      green = "\x1b[32m",
      /**
       * Yellow foreground.
       */
      yellow = "\x1b[33m",
      /**
       * Blue foreground.
       */
      blue = "\x1b[34m",
      /**
       * Magenta foreground.
       */
      magenta = "\x1b[35m",
      /**
       * Cyan foreground.
       */
      cyan = "\x1b[36m",
      /**
       * White foreground.
       */
      white = "\x1b[37m",
      /**
       * Default foreground color.
       */
      default = "\x1b[39m",

      /**
       * Bright black (gray) foreground.
       */
      brightBlack = "\x1b[90m",
      /**
       * Bright red foreground.
       */
      brightRed = "\x1b[91m",
      /**
       * Bright green foreground.
       */
      brightGreen = "\x1b[92m",
      /**
       * Bright yellow foreground.
       */
      brightYellow = "\x1b[93m",
      /**
       * Bright blue foreground.
       */
      brightBlue = "\x1b[94m",
      /**
       * Bright magenta foreground.
       */
      brightMagenta = "\x1b[95m",
      /**
       * Bright cyan foreground.
       */
      brightCyan = "\x1b[96m",
      /**
       * Bright white foreground.
       */
      brightWhite = "\x1b[97m"
    }

    /**
     * Returns ANSI escape code for 8-bit (256) color foreground.
     * @param colorCode - Color code (0-255)
     * @returns ANSI escape sequence string
     */
    export function Foreground8Bit(colorCode: number): string {
      return `\x1b[38;5;${colorCode}m`;
    }

    /**
     * Returns ANSI escape code for 24-bit (truecolor) foreground.
     * @param r - Red (0-255)
     * @param g - Green (0-255)
     * @param b - Blue (0-255)
     * @returns ANSI escape sequence string
     */
    export function Foreground24Bit(r: number, g: number, b: number): string {
      return `\x1b[38;2;${r};${g};${b}m`;
    }

    /**
     * Standard background colors
     */
    export enum Background {
      /**
       * Black background.
       */
      black = "\x1b[40m",
      /**
       * Red background.
       */
      red = "\x1b[41m",
      /**
       * Green background.
       */
      green = "\x1b[42m",
      /**
       * Yellow background.
       */
      yellow = "\x1b[43m",
      /**
       * Blue background.
       */
      blue = "\x1b[44m",
      /**
       * Magenta background.
       */
      magenta = "\x1b[45m",
      /**
       * Cyan background.
       */
      cyan = "\x1b[46m",
      /**
       * White background.
       */
      white = "\x1b[47m",
      /**
       * Default background color.
       */
      default = "\x1b[49m",

      /**
       * Bright black (gray) background.
       */
      brightBlack = "\x1b[100m",
      /**
       * Bright red background.
       */
      brightRed = "\x1b[101m",
      /**
       * Bright green background.
       */
      brightGreen = "\x1b[102m",
      /**
       * Bright yellow background.
       */
      brightYellow = "\x1b[103m",
      /**
       * Bright blue background.
       */
      brightBlue = "\x1b[104m",
      /**
       * Bright magenta background.
       */
      brightMagenta = "\x1b[105m",
      /**
       * Bright cyan background.
       */
      brightCyan = "\x1b[106m",
      /**
       * Bright white background.
       */
      brightWhite = "\x1b[107m"
    }

    /**
     * Returns ANSI escape code for 8-bit (256) color background.
     * @param colorCode - Color code (0-255)
     * @returns ANSI escape sequence string
     */
    export function Background8Bit(colorCode: number): string {
      return `\x1b[48;5;${colorCode}m`;
    }
    /**
     * Returns ANSI escape code for 24-bit (truecolor) background.
     * @param r - Red (0-255)
     * @param g - Green (0-255)
     * @param b - Blue (0-255)
     * @returns ANSI escape sequence string
     */
    export function Background24Bit(r: number, g: number, b: number): string {
      return `\x1b[48;2;${r};${g};${b}m`;
    }
  }

  /**
   * Resets all text styles (SGR attributes) to default, but does not reset colors.
   * Equivalent to SGR codes: 22 (normal intensity), 23 (not italic), 24 (underline off),
   * 25 (blink off), 27 (inverse off), 28 (reveal), 29 (not crossed out).
   */
  export const resetStyles = `${Styles.normalIntensity}${Styles.notItalicOrFraktur}${Styles.underlineOff}${Styles.blinkOff}${Styles.inverseOff}${Styles.reveal}${Styles.notCrossedOut}`;

  /**
   * Resets only colors (foreground and background) to default, but does not reset styles.
   * Equivalent to SGR codes: 39 (default foreground), 49 (default background).
   */
  export const resetColors = `${Colors.Background.default}${Colors.Foreground.default}`;

  /**
   * Returns ANSI escape codes for the specified background and foreground colors.
   * @param background The background color.
   * @param foreground The foreground color.
   * @returns The ANSI escape codes for the colors.
   */
  export function GetColors(
    background: Colors.Background | string = Colors.Background.default,
    foreground: Colors.Foreground | string = Colors.Foreground.default
  ): string {
    let output = [] as string[];

    if (background) {
      output.push(background);
    }
    if (foreground) {
      output.push(foreground);
    }

    return output.join("");
  }

  /**
   * Wraps text with ANSI colors.
   * @param text The text to wrap.
   * @param background The background color.
   * @param foreground The foreground color.
   * @returns The wrapped text.
   */
  export function WrapColors(
    text: string,
    background: Colors.Background | string = Colors.Background.default,
    foreground: Colors.Foreground | string = Colors.Foreground.default
  ): string {
    return `${GetColors(background, foreground)}${text}${resetColors}`;
  }

  /**
   * Wraps text with ANSI styles.
   * @param text The text to wrap.
   * @param styles The styles to apply.
   * @returns The wrapped text.
   */
  export function WrapStyles(text: string, ...styles: Styles[]): string {
    return `${text}${resetStyles}${styles.join("")}${text}${resetStyles}`;
  }
}
