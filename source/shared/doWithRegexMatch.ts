export async function doWithRegexMatch<T>(input: string | null | undefined, regex: RegExp, callback: (match: string[]) => Promise<T>) {
  if (input == null) {
    return;
  }

  const match = regex.exec(input);

  if (match) {
    return await callback(match);
  }
}
