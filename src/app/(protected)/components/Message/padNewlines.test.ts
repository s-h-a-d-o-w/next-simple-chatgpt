import { padNewlines } from "./padNewlines";
import { it, describe, expect } from "vitest";

describe(padNewlines, () => {
  it("pads newlines correctly", () => {
    expect(
      padNewlines(
        "This is a test\n`code line\nanother line`\n```\ninside triple\n backticks\n```\noutside backticks",
      ),
    ).toMatchInlineSnapshot(`
      "This is a test  
      \`code line
      another line\`  
      \`\`\`
      inside triple
       backticks
      \`\`\`  
      outside backticks"
    `);
  });
});
