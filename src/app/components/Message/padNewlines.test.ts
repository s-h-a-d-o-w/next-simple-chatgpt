import { padNewlines } from "./padNewlines";

test(padNewlines.name, () => {
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
