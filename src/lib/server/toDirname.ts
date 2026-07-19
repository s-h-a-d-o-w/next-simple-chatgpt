import path from "node:path";
import { fileURLToPath } from "node:url";

// Why? See: https://github.com/vercel/next.js/issues/60879
export function toDirname(url: string) {
  return path.dirname(fileURLToPath(url));
}
