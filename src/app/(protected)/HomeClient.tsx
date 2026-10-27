"use client";

import "@/lib/utils/logBuildInfo";
import type { Metadata } from "@/types";
import { History } from "@/app/(protected)/components/History";
import {
  chatStartTimeAtom,
  promptFilesAtom,
  chatSessionAtom,
  systemPromptAtom,
} from "@/app/(protected)/atoms";
import { Messages } from "./components/Messages";
import type { AppChatProps } from "@/app/api/chat/route";
import { withProfiler } from "@/components/withProfiler";
import { useSyncHistory } from "@/app/(protected)/hooks/useHistory";
import { useModelSelection } from "@/app/(protected)/hooks/useModelSelection";
import { useReasoningEffort } from "@/app/(protected)/hooks/useReasoningEffort";
import { useScrollToBottom } from "@/app/(protected)/hooks/useScrollToBottom";
import { useChat } from "@ai-sdk/react";
import type { FileUIPart, UIMessage } from "ai";
import { useAtomValue } from "jotai";
import { useCallback, useEffect, useMemo } from "react";
import { styled } from "@/styled-system/jsx";
import { TopBar } from "./components/TopBar";
import { SystemPrompt } from "./components/SystemPrompt";
import { Prompt } from "./components/Prompt";

const StyledMain = styled("main", {
  base: {
    width: "100%",
    maxWidth: "800px",
    padding: "10rem",
    marginInline: "auto",

    display: "flex",
    flexDirection: "column",
    gap: "10rem",
  },
});

function HomeClient() {
  const { id: sessionId, initialMessages } = useAtomValue(chatSessionAtom);
  const startTime = useAtomValue(chatStartTimeAtom);
  const systemPrompt = useAtomValue(systemPromptAtom);

  const { model } = useModelSelection();
  const { reasoningEffort } = useReasoningEffort();

  // Body to send along with the messages.
  const body = useMemo(
    () =>
      ({
        model,
        reasoningEffort,
      }) satisfies AppChatProps,
    [model, reasoningEffort],
  );

  const {
    messages,
    setMessages,
    status,
    stop,
    error,
    regenerate,
    sendMessage,
    // Might not be necessary here but is for code below.
  } = useChat<UIMessage<Metadata>>({
    id: sessionId,
    throttle: 500,
    messages: initialMessages ?? [
      {
        parts: [{ type: "text", text: systemPrompt }],
        role: "system",
        id: "system",
      } satisfies UIMessage,
    ],
  });
  const isLoading = status === "submitted" || status === "streaming";
  const hasFilesInChat =
    useAtomValue(promptFilesAtom).length > 0 ||
    messages.some((message) =>
      message.parts.some((part) => part.type === "file"),
    );

  useEffect(() => {
    if (error) {
      console.log(error);
    }
  }, [error]);

  const [conversationHistory] = useSyncHistory(isLoading, startTime, messages);

  useScrollToBottom(isLoading);

  const handleDeleteMessage = useCallback(
    (id: string) => {
      setMessages((previousMessages) =>
        previousMessages.filter((message) => message.id !== id),
      );
    },
    [setMessages],
  );

  const handleRegenerate = useCallback(() => {
    void regenerate({ body });
  }, [body, regenerate]);

  const handleSendMessage = useCallback(
    ({ files, input }: { files: FileUIPart[]; input: string }) => {
      void sendMessage(
        {
          parts: [
            { type: "text", text: input },
            ...(files.length > 0
              ? files.map(
                  ({ filename, mediaType, url }) =>
                    ({
                      type: "file",
                      filename,
                      mediaType,
                      url,
                    }) satisfies FileUIPart,
                )
              : []),
          ],
        },
        { body },
      );
    },
    [body, sendMessage],
  );

  return (
    <>
      <TopBar
        disabledHistoryActions={conversationHistory.length === 0}
        hasFilesInChat={hasFilesInChat}
      />
      <StyledMain>
        <SystemPrompt setMessages={setMessages} />
        <Messages
          hasError={Boolean(error)}
          isLoading={isLoading}
          messages={messages}
          onDelete={handleDeleteMessage}
          onRetry={handleRegenerate}
          showCopyAll
        />
        <Prompt
          disabledReplay={messages.at(-1)?.role !== "assistant"}
          isFirstPrompt={messages.length === 1}
          isLoading={isLoading}
          onReplay={handleRegenerate}
          onSend={handleSendMessage}
          onStop={stop}
        />
      </StyledMain>
      <History />
    </>
  );
}

const ProfiledHomeClient = withProfiler(HomeClient, true);

export default ProfiledHomeClient;
