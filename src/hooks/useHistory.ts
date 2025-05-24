import { cloneDeep } from "lodash";
import { type Message as MessageType } from "ai/react";
import { useState, useEffect } from "react";
import useLocalStorageState from "use-local-storage-state";
import superjson from "superjson";

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

          const messagesWithoutAttachments =
            stripAttachmentsFromMessages(messages);
          if (index >= 0) {
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

  return [conversationHistory, setConversationHistory] as const;
}
