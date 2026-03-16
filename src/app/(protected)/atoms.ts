import type { HistoryEntryV1 } from "@/app/(protected)/hooks/useHistory";
import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import type { FileUIPart } from "ai";

export const activeHistoryEntryAtom = atom<HistoryEntryV1 | undefined>(
  undefined,
);
export const promptFilesAtom = atom<FileUIPart[]>([]);
export const chatIdAtom = atom(0);
export const chatStartTimeAtom = atom<number | undefined>(undefined);
export const isHistoryOpenAtom = atom(false);
export const systemPromptAtom = atomWithStorage(
  "system-message",
  "You are a concise assistant. Use markdown for your responses.",
);
