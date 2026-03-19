"use client";

import "@/lib/utils/logBuildInfo";

import { History } from "@/app/(protected)/components/History";
import {
  chatIdAtom,
  chatStartTimeAtom,
  systemPromptAtom,
} from "@/app/(protected)/atoms";
import { Messages } from "./components/Messages";
import type { ChatRequest } from "@/app/api/chat/route";
import { withProfiler } from "@/components/withProfiler";
import { useSyncHistory } from "@/app/(protected)/hooks/useHistory";
import { useModelSelection } from "@/app/(protected)/hooks/useModelSelection";
import { useScrollToBottom } from "@/app/(protected)/hooks/useScrollToBottom";
import { useChat } from "@ai-sdk/react";
import type { FileUIPart, UIMessage } from "ai";
import { useAtom } from "jotai";
import { useCallback, useEffect, useMemo } from "react";
import { styled } from "@/styled-system/jsx";
import { TopBar } from "./components/TopBar";
import { SystemPrompt } from "./components/SystemPrompt";
import { Prompt } from "./components/Prompt";

function createSystemMessage(content: string) {
  return {
    parts: [{ type: "text", text: content }],
    role: "system",
    id: "system",
  } satisfies UIMessage;
}

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
  const [chatId] = useAtom(chatIdAtom);
  const [startTime] = useAtom(chatStartTimeAtom);
  const [systemPrompt] = useAtom(systemPromptAtom);

  const { model } = useModelSelection();

  const {
    messages,
    setMessages,
    status,
    stop,
    error,
    regenerate,
    sendMessage,
  } = useChat<UIMessage>({
    id: chatId.toString(),
    experimental_throttle: 500,
    messages: [createSystemMessage(systemPrompt)],
  });
  const isLoading = status === "submitted" || status === "streaming";

  // Body to send along with the messages.
  const body = useMemo(() => {
    return {
      model,
    } satisfies Omit<ChatRequest, "messages">;
  }, [model]);

  useEffect(() => {
    if (error) {
      console.log(error);
    }
  }, [error]);

  const [conversationHistory] = useSyncHistory(isLoading, startTime, messages);

  useScrollToBottom(isLoading, messages);

  const handleDeleteMessage = useCallback(
    (id: string) => {
      setMessages((previousMessages) =>
        previousMessages.filter((message) => message.id !== id),
      );
    },
    [setMessages],
  );

  const handleSendMessage = useCallback(
    ({ files, input }: { files: FileUIPart[]; input: string }) => {
      void sendMessage(
        {
          parts: [
            { type: "text", text: input },
            ...(files.length > 0
              ? files.map(({ filename, mediaType, url }) => {
                  return {
                    type: "file",
                    filename,
                    mediaType,
                    url,
                  } satisfies FileUIPart;
                })
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
        messages={messages}
      />
      <StyledMain>
        <SystemPrompt setMessages={setMessages} />
        <Messages
          hasError={Boolean(error)}
          isLoading={isLoading}
          messages={messages}
          onDelete={handleDeleteMessage}
          onRetry={() => {
            void regenerate({ body });
          }}
          showCopyAll
        />
        <Prompt
          disabledReplay={messages.at(-1)?.role !== "assistant"}
          isFirstPrompt={messages.length === 1}
          isLoading={isLoading}
          onReplay={() => {
            void regenerate({
              body,
            });
          }}
          onSend={handleSendMessage}
          onStop={stop}
        />
      </StyledMain>
      <History setMessages={setMessages} />
    </>
  );
}

const ProfiledHomeClient = withProfiler(HomeClient, true);

export default ProfiledHomeClient;
