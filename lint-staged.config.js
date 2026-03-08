export default {
  "**/*.{?(c|m)js?(x),ts?(x)}": "pnpm lint",
  "**/*.ts?(x)": () => "pnpm typecheck",
  "**/*": "pnpm oxfmt --check",
};
