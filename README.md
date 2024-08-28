# next-boilerplate


## Decisions

- 

## Problems

- TS in vscode doesn't seem to pick up new .d.ts files. Often has to be restarted for auto imports to work.
- Go to declaration made possible by `typescript-plugin-css-modules` doesn't work well. Also: It seems to generate virtual .d.ts modules - could they enable named exports in the same way as `typed-css-modules` does if created differently?
- Finding references for class names from inside of CSS modules doesn't work. (Even if React CSS modules extension was used - it doesn't support named exports.)
- Official stylelint docs don't provide an installation guide that works with package managers other than npm. Nothing on manual installation. A sign that they're living in the past. https://stylelint.io/user-guide/get-started#linting-css
