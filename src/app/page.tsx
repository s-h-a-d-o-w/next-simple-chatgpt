"use client";

import "../styles/prism-theme.css";

import { useHistory } from "@/hooks/useHistory";
import { useScrollToTarget } from "@/hooks/useScrollToTarget";
import { config, type ModelKey } from "@/config";
import { useChat, type Message as MessageType } from "@ai-sdk/react";
import { cloneDeep, debounce } from "lodash";
import {
  ChangeEventHandler,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import superjson from "superjson";
import useLocalStorageState from "use-local-storage-state";
import { styled } from "../../styled-system/jsx";
import { loadJsonFile } from "../utils/loadJsonFile";
import "../utils/logBuildInfo";
import { saveJsonFile } from "../utils/saveJsonFile";
import type { ChatRequest } from "./api/chat/route";
import { Actions } from "./components/Actions";
import { DeleteConfirmationModal } from "./components/DeleteConfirmationModal";
import { History } from "./components/History";
import { Messages } from "./components/Messages";
import { Prompt } from "./components/Prompt";
import { SystemPrompt } from "./components/SystemPrompt";

function createSystemMessage(content: string) {
  return {
    content,
    role: "system",
    id: "system",
  } as const;
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

export default function Home() {
  const endOfPageRef = useRef<HTMLDivElement>(null);

  const [showHistory, setShowHistory] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [activeHistoryEntry, setActiveHistoryEntry] = useState<MessageType[]>();
  const [attachments, setAttachments] = useState<
    NonNullable<MessageType["experimental_attachments"]>
  >([]);
  const [model, setModel] = useLocalStorageState<ModelKey>("model", {
    defaultValue: config.models.default,
  });
  const [systemValue, setSystemValue] = useLocalStorageState<string>(
    "system-message",
    {
      defaultValue:
        "You are a concise assistant. Use markdown for your responses.",
    },
  );

  const {
    messages,
    setMessages,
    input,
    handleInputChange,
    handleSubmit,
    status,
    stop,
    error,
    reload,
  } = useChat({
    keepLastMessageOnError: true,
    initialMessages: [createSystemMessage(systemValue)],
    body: {
      model,
    } satisfies Omit<ChatRequest, "messages">,
  });
  const isLoading = status === "submitted" || status === "streaming";

  useEffect(() => {
    if (error) {
      console.log(error);
    }
  }, [error]);

  const [conversationHistory, setConversationHistory] = useHistory(
    isLoading,
    messages,
  );

  useScrollToTarget(isLoading, endOfPageRef);

  // Syncs the system prompt into the array of messages when it changes.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSyncSystemMessage = useCallback(
    debounce((content: string) => {
      setMessages((innerMessages) => {
        const nextMessages = cloneDeep(innerMessages);
        const systemIndex = nextMessages.findIndex(
          (message) => message.role === "system",
        );
        if (systemIndex >= 0 && nextMessages[systemIndex]) {
          nextMessages[systemIndex].content = content;
        } else {
          nextMessages.unshift(createSystemMessage(content));
        }
        return nextMessages;
      });
    }, 300),
    [setMessages],
  );

  const handleDeleteMessage = useCallback(
    (id: string) => {
      setMessages(messages.filter((message) => message.id !== id));
    },
    [messages, setMessages],
  );

  const handleChangeSystemInput: ChangeEventHandler<HTMLTextAreaElement> = (
    event,
  ) => {
    setSystemValue(event.target.value);
    debouncedSyncSystemMessage(event.target.value);
  };

  const handleCloseHistory = useCallback(() => {
    setShowHistory(false);
    setActiveHistoryEntry(undefined);
  }, []);

  const handleDeleteHistoryEntry = useCallback(
    (index: number) => {
      const nextHistory = cloneDeep(conversationHistory);
      nextHistory.splice(index, 1);
      setConversationHistory(nextHistory);
    },
    [conversationHistory, setConversationHistory],
  );

  const handleRestoreHistoryEntry = useCallback(() => {
    if (activeHistoryEntry?.[0]) {
      setSystemValue(activeHistoryEntry[0].content);
      setMessages(activeHistoryEntry);
      setActiveHistoryEntry(undefined);
      setShowHistory(false);
    }
  }, [activeHistoryEntry, setSystemValue, setMessages]);

  const handleSetActiveHistoryEntry = useCallback(
    (nextMessages?: MessageType[]) => {
      setActiveHistoryEntry(nextMessages);
    },
    [],
  );

  const handleDeleteHistory = useCallback(() => {
    setShowDeleteConfirmation(true);
  }, []);

  const handleLoadHistory = useCallback(async () => {
    try {
      const history = superjson.parse(await loadJsonFile()) as Array<
        MessageType[]
      >;
      setConversationHistory(history);
    } catch {
      // TODO: user cancelled or picked nonsense. should probably show error.
    }
  }, [setConversationHistory]);

  const handleSaveHistory = useCallback(() => {
    saveJsonFile(
      conversationHistory,
      `history-${new Date().toISOString().replace(/[:.]/g, "-")}`,
    );
  }, [conversationHistory]);

  return (
    <>
      <Actions
        disabledHistoryActions={Object.keys(conversationHistory).length === 0}
        model={model}
        onModelChange={setModel}
        onShowHistory={() => {
          setShowHistory(true);
        }}
        onReset={() => {
          setAttachments([]);
          setMessages([createSystemMessage(systemValue)]);
        }}
        showAttachmentModelsOnly={
          attachments.length > 0 ||
          messages.some(
            ({ experimental_attachments }) =>
              experimental_attachments && experimental_attachments.length > 0,
          )
        }
      />

      <StyledMain>
        <SystemPrompt value={systemValue} onChange={handleChangeSystemInput} />
        <Messages
          hasError={Boolean(error)}
          isLoading={isLoading}
          messages={messages}
          onDelete={handleDeleteMessage}
          onRetry={reload}
          showCopyAll
        />
        <Prompt
          disabledReplay={messages.length < 2}
          input={input}
          isFirstPrompt={messages.length === 1}
          isLoading={isLoading}
          onChange={handleInputChange}
          onClickStop={stop}
          attachments={attachments}
          currentModel={model}
          onModelChange={setModel}
          onAddAttachments={(newAttachments) => {
            setAttachments((previousAttachments) => [
              ...previousAttachments,
              ...newAttachments,
            ]);
          }}
          onRemoveAttachment={(index) => {
            setAttachments((previousAttachments) =>
              previousAttachments.filter((_, i) => i !== index),
            );
          }}
          onSubmit={(event) => {
            event.preventDefault();
            if (input === "" && attachments.length === 0) {
              reload();
              return;
            } else {
              handleSubmit(event, {
                experimental_attachments: attachments,
              });

              setAttachments([]);
            }
          }}
        />
        <div ref={endOfPageRef} />
      </StyledMain>

      {/* DIALOGS */}
      {/* ================ */}
      <History
        activeHistoryEntry={activeHistoryEntry}
        conversationHistory={conversationHistory}
        isOpen={showHistory}
        onClose={handleCloseHistory}
        onDeleteHistoryEntry={handleDeleteHistoryEntry}
        onRestoreHistoryEntry={handleRestoreHistoryEntry}
        onSetActiveHistoryEntry={handleSetActiveHistoryEntry}
        onDeleteHistory={handleDeleteHistory}
        onLoad={handleLoadHistory}
        onSave={handleSaveHistory}
      />

      <DeleteConfirmationModal
        isOpen={showDeleteConfirmation}
        onConfirm={() => {
          setConversationHistory([]);
          setShowDeleteConfirmation(false);
        }}
        onClose={() => {
          setShowDeleteConfirmation(false);
        }}
      />
    </>
  );
}
