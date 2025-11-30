export const isServer = typeof window === "undefined";
export const isDev = process.env["NODE_ENV"] !== "production";
export const isTest = Boolean(process.env["NEXT_PUBLIC_E2E"]);
export const isClientDebug =
  !isServer && window.location.href.includes("debug");
