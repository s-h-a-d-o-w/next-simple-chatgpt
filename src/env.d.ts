// Declared so that it can be accessed via dot notation despite
// `noPropertyAccessFromIndexSignature` - Next.js only inlines `NEXT_PUBLIC_*`
// env vars into client bundles when they are accessed that way.
declare namespace NodeJS {
  // eslint-disable-next-line typescript/consistent-type-definitions -- declaration merging requires an interface
  interface ProcessEnv {
    NEXT_PUBLIC_TEST?: string;
  }
}
