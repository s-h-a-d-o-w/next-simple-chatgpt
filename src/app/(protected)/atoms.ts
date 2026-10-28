import type { HistoryEntryV1 } from "@/app/(protected)/hooks/useHistory";
import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import type { FileUIPart, UIMessage } from "ai";
import type { Metadata } from "@/types";
import { generateSessionId } from "@/lib/utils/generateSessionId";

export const activeHistoryEntryAtom = atom<HistoryEntryV1 | undefined>(
  undefined,
);
export const promptFilesAtom = atom<FileUIPart[]>([]);
// Used with useChat to make it reset conversation when needed. initialMessages are only applied when the id changes.
export const chatSessionAtom = atom<{
  id: string;
  initialMessages?: UIMessage<Metadata>[];
}>({ id: generateSessionId() });
// Only set once prompt is sent, used in history
export const chatStartTimeAtom = atom<number | undefined>(undefined);
export const isHistoryOpenAtom = atom(false);
export const systemPromptAtom = atomWithStorage(
  "system-message",
  "You are a concise assistant. Use markdown for your responses.",
);
