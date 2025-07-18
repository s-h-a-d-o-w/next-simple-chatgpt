import { cloneDeep } from "lodash";
import { type Message as MessageType } from "ai/react";
import { useState, useEffect } from "react";
import useLocalStorageState from "use-local-storage-state";
import superjson from "superjson";
import { useStorageUsage } from "./useStorageUsage";

function stripAttachmentsFromMessages(messages: MessageType[]): MessageType[] {
  return messages.map(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    ({ experimental_attachments, ...messageWithoutAttachments }) => ({
      ...messageWithoutAttachments,
      content:
        experimental_attachments && experimental_attachments.length > 0
          ? `[Attachments: ${experimental_attachments
              .map((attachment) => attachment.name)
              .join(", ")}] ${messageWithoutAttachments.content}`
          : messageWithoutAttachments.content,
    }),
  );
}

export function useHistory(
  isLoading: boolean,
  messages: MessageType[],
  namespace?: string,
) {
  const [conversationHistory, setConversationHistory] = useLocalStorageState<
    Array<MessageType[]>
  >(`history${namespace ? `-${namespace}` : ""}`, {
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
          const messagesWithoutAttachments =
            stripAttachmentsFromMessages(messages);

          const index = nextHistory.findIndex(
            (messages) =>
              messages[1]?.createdAt?.valueOf() === firstMessageDate,
          );
          if (index >= 0) {
            // Change a history entry that already existed (like the most recent one).
            nextHistory[index] = messagesWithoutAttachments;
          } else {
            nextHistory.push(messagesWithoutAttachments);
          }

          setLastHistoryUpdate(Date.now());
          return nextHistory;
        });
      }
    }
  }, [isLoading, lastHistoryUpdate, messages, setConversationHistory]);

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
