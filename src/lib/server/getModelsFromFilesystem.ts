import { readFile } from "node:fs/promises";
import path from "node:path";
import type { LiteLLMModelInfo, OpenRouterModelInfo } from "@/types";
import { toDirname } from "./toDirname";

function readJsonFile<T>(fileName: string): Promise<T> {
  return readFile(path.join(toDirname(import.meta.url), fileName), "utf8").then(
    JSON.parse,
  );
}

let cachedModelsFromFilesystem:
  | Promise<Record<string, LiteLLMModelInfo>>
  | undefined = undefined;
export function getModelsFromFilesystem() {
  cachedModelsFromFilesystem ??= readJsonFile(
    "model_prices_and_context_window.json",
  );
  return cachedModelsFromFilesystem;
}

let cachedOpenRouterModelsFromFilesystem:
  | Promise<Record<string, OpenRouterModelInfo>>
  | undefined = undefined;
export function getOpenRouterModelsFromFilesystem() {
  cachedOpenRouterModelsFromFilesystem ??= readJsonFile(
    "openrouter_models.json",
  );
  return cachedOpenRouterModelsFromFilesystem;
}
