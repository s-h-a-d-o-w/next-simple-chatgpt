// Adds two spaces before all \n, so that markdown will actually do a line break. (Except for code blocks, where line breaks happen even without spaces.)
export function padNewlines(input: string): string {
  let inSingleBacktick = false;
  let inTripleBacktick = false;
  let result = "";

  for (let i = 0; i < input.length; i++) {
    const char = input[i];

    // In triple backtick?
    if (input.substring(i, i + 3) === "```") {
      inTripleBacktick = !inTripleBacktick;
      result += "```";
      i += 2;
      continue;
    }

    // In single backtick?
    if (char === "`" && !inTripleBacktick) {
      inSingleBacktick = !inSingleBacktick;
      result += "`";
      continue;
    }

    if (char === "\n" && !inSingleBacktick && !inTripleBacktick) {
      result += "  \n";
    } else {
      result += char;
    }
  }

  return result;
}
