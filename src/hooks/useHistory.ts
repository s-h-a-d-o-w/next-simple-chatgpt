import { cloneDeep } from "lodash";
import { type Message as MessageType } from "ai/react";
import { useState, useEffect } from "react";
import useLocalStorageState from "use-local-storage-state";
import superjson from "superjson";

export function useHistory(isLoading: boolean, messages: MessageType[]) {
  const [conversationHistory, setConversationHistory] = useLocalStorageState<
    Array<MessageType[]>
  >("history", {
    defaultValue: [],
    serializer: superjson,
  });
  const [lastHistoryUpdate, setLastHistoryUpdate] = useState(0);

  // Keep history in sync as messages arive
  useEffect(() => {
    const latestMessageDate =
      messages[messages.length - 1]?.createdAt?.valueOf();
    if (
      !isLoading &&
      latestMessageDate &&
      lastHistoryUpdate < latestMessageDate
    ) {
      const firstMessageDate = messages
        .find((message) => message.role === "user")
        ?.createdAt?.valueOf();
      if (firstMessageDate) {
        setConversationHistory((history) => {
          const nextHistory = cloneDeep(history);
          const index = nextHistory.findIndex(
            (messages) =>
              messages[1]?.createdAt?.valueOf() === firstMessageDate,
          );

          // Already exists
          if (index >= 0) {
            nextHistory[index] = messages;
          } else {
            nextHistory.push(messages);
          }

          setLastHistoryUpdate(Date.now());
          return nextHistory;
        });
      }
    }
  }, [isLoading, lastHistoryUpdate, messages, setConversationHistory]);

  return [conversationHistory, setConversationHistory] as const;
}
