import { cloneDeep, isObject } from "lodash";
import { useEffect } from "react";
import useLocalStorageState from "use-local-storage-state";
import superjson from "superjson";
import { useStorageUsage } from "./useStorageUsage";
import type { UIMessage } from "ai";

export const CURRENT_HISTORY_VERSION = 1;

type HistoryV1 = {
  version: 1;
  history: HistoryEntryV1[];
};

export type HistoryEntryV1 = {
  startTime: number;
  messages: UIMessage[];
};

type LegacyHistoryEntry = HistoryEntryV1;

export function maybeMigrateHistory(value: unknown): HistoryEntryV1[] {
  if (
    isObject(value) &&
    "version" in value &&
    value.version === CURRENT_HISTORY_VERSION
  ) {
    return (value as HistoryV1).history;
  }

  return value as LegacyHistoryEntry[];
}

export const historySerializer = {
  stringify: (value: unknown) =>
    superjson.stringify({ version: CURRENT_HISTORY_VERSION, history: value }),
  parse: (value: string) => maybeMigrateHistory(superjson.parse(value)),
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

export function useHistory(namespace?: string) {
  const [conversationHistory, setConversationHistory] = useLocalStorageState<
    HistoryEntryV1[]
  >(`history${namespace ? `-${namespace}` : ""}`, {
    defaultValue: [],
    serializer: historySerializer,
  });

  return [conversationHistory, setConversationHistory] as const;
}

// Keep history in sync as messages arive
export function useSyncHistory(
  isLoading: boolean,
  startTime: number | undefined,
  messages: UIMessage[],
  namespace?: string,
) {
  const [_, setConversationHistory] = useLocalStorageState<HistoryEntryV1[]>(
    `history${namespace ? `-${namespace}` : ""}`,
    {
      defaultValue: [],
      serializer: historySerializer,
    },
  );

  useEffect(() => {
    if (!isLoading && startTime && messages.length > 1) {
      setConversationHistory((history) => {
        const nextHistory = cloneDeep(history);
        const newEntry: HistoryEntryV1 = {
          startTime,
          messages: stripAttachmentsFromMessages(messages),
        };

        const index = nextHistory.findIndex(
          (entry: HistoryEntryV1) => entry.startTime === startTime,
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
}
