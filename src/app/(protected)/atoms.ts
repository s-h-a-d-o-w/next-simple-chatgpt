import type { HistoryEntryV1 } from "@/app/(protected)/hooks/useHistory";
import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import type { FileUIPart } from "ai";
import { v4 as uuidv4 } from "uuid";

export const activeHistoryEntryAtom = atom<HistoryEntryV1 | undefined>(
  undefined,
);
export const promptFilesAtom = atom<FileUIPart[]>([]);
// Used with useChat to make it reset conversation when needed
export const sessionIdAtom = atom(uuidv4());
// Only set once prompt is sent, used in history
export const chatStartTimeAtom = atom<number | undefined>(undefined);
export const isHistoryOpenAtom = atom(false);
export const tokenAtom = atom<string | undefined>(undefined);
export const systemPromptAtom = atomWithStorage(
  "system-message",
  "You are a concise assistant. Use markdown for your responses.",
);
