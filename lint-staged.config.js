export default {
  "**/*.{?(c|m)js?(x),ts?(x)}": "pnpm lint",
  "**/*.ts?(x)": () => "pnpm typecheck",
  "**/*": "pnpm oxfmt --no-error-on-unmatched-pattern --check",
  ".oxlintrc.json": () => "pnpm lint",
  ".oxfmtrc.jsonc": () => "pnpm oxfmt --no-error-on-unmatched-pattern --check",
};
