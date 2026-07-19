import { readFile } from "node:fs/promises";
import path from "node:path";
import type { LiteLLMModelInfo } from "@/types";
import { toDirname } from "./toDirname";

let cachedModelsFromFilesystem: Promise<Record<string, LiteLLMModelInfo>> | undefined = undefined;
export function getModelsFromFilesystem() {
  cachedModelsFromFilesystem ??= readFile(
    path.join(toDirname(import.meta.url), "model_prices_and_context_window.json"),
    "utf8",
  ).then(JSON.parse);
  return cachedModelsFromFilesystem;
}
