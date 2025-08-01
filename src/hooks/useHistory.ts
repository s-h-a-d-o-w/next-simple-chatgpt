import { cloneDeep } from "lodash";
import { useEffect } from "react";
import useLocalStorageState from "use-local-storage-state";
import superjson from "superjson";
import { useStorageUsage } from "./useStorageUsage";
import type { UIMessage } from "ai";

export type HistoryEntry = {
  startTime: number;
  messages: UIMessage[];
};

function stripAttachmentsFromMessages(messages: UIMessage[]): UIMessage[] {
  // Could be optimized by filtering messages that have file parts and only processing those more deeply. But since this is only called on a single history entry, this seems excessive at the moment.
  return messages.map(({ parts, ...rest }) => ({
    parts: parts.map((part) =>
      part.type === "file"
        ? {
            type: "text",
            text: `[File (${part.mediaType}) ${part.filename || "<no name>"}]`,
          }
        : part,
    ),
    ...rest,
  }));
}

export function useHistory(
  isLoading: boolean,
  startTime: number | undefined,
  messages: UIMessage[],
  namespace?: string,
) {
  const [conversationHistory, setConversationHistory] = useLocalStorageState<
    HistoryEntry[]
  >(`history${namespace ? `-${namespace}` : ""}`, {
    defaultValue: [],
    serializer: superjson,
  });

  // Keep history in sync as messages arive
  useEffect(() => {
    if (!isLoading && startTime && messages.length > 1) {
      setConversationHistory((history) => {
        const nextHistory = cloneDeep(history);
        const newEntry = {
          startTime,
          messages: stripAttachmentsFromMessages(messages),
        };

        const index = nextHistory.findIndex(
          (messages) => messages.startTime === startTime,
        );
        if (index >= 0) {
          // Change a history entry that already existed (like the most recent one).
          nextHistory[index] = newEntry;
        } else {
          nextHistory.push(newEntry);
        }

        return nextHistory;
      });
    }
  }, [isLoading, startTime, messages, setConversationHistory]);

  // Prune history if we're using too much storage.
  const usedStorage = useStorageUsage();
  useEffect(() => {
    if (usedStorage && usedStorage > 1) {
      setConversationHistory((history) => {
        const total = history.length;
        const removeCount = Math.ceil(total * 0.25);
        return history.slice(removeCount);
      });
    }
  }, [usedStorage, setConversationHistory]);

  return [conversationHistory, setConversationHistory] as const;
}
