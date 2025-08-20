export const isServer = typeof window === "undefined";
export const isDev = process.env["NODE_ENV"] !== "production";
export const isTest = Boolean(process.env["CI"]);
export const isClientDebug =
  !isServer && window.location.href.includes("debug");
