export { captureRequestError as onRequestError } from "@sentry/nextjs";
export async function register() {
  if (process.env["NEXT_RUNTIME"] === "nodejs") {
    // Next 16.3's httpxy rewrite proxy adds 9 `close` listeners per response on external rewrites (Sentry's
    // tunnelRoute), Sentry adds 2, tripping Node's limit of 10.
    const { EventEmitter } = await import("node:events");
    EventEmitter.defaultMaxListeners = 15;

    await import("../sentry.server.config");
  }

  if (process.env["NEXT_RUNTIME"] === "edge") {
    await import("../sentry.edge.config");
  }
}
