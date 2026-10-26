import type { Configuration } from "lint-staged";

export default {
  "**/*": [
    "pnpm oxfmt --no-error-on-unmatched-pattern --check",
    () => "pnpm knip",
  ],
  "**/*.ts?(x)": () => "pnpm typecheck",
  "**/*.{?(c|m)js?(x),ts?(x)}": "pnpm lint --no-error-on-unmatched-pattern",

  // Dependency changes can break files that aren't staged, so check everything.
  "**/{package.json,pnpm-lock.yaml,pnpm-workspace.yaml}": () => [
    "pnpm oxfmt --no-error-on-unmatched-pattern --check",
    "pnpm lint --no-error-on-unmatched-pattern",
    "pnpm typecheck",
  ],
} satisfies Configuration;
