"use client";

import "../styles/prism-theme.css";

import { HistoryEntry, useHistory } from "@/hooks/useHistory";
import { useScrollToTarget } from "@/hooks/useScrollToTarget";
import { type ModelKey } from "@/config";
import { useChat } from "@ai-sdk/react";
import { FileUIPart, UIMessage } from "ai";
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
import { withProfiler } from "@/components/withProfiler";
import { config } from "@/config";

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

function Home() {
  const endOfPageRef = useRef<HTMLDivElement>(null);

  const [showHistory, setShowHistory] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [activeHistoryEntry, setActiveHistoryEntry] = useState<HistoryEntry>();
  const [files, setFiles] = useState<FileUIPart[]>([]);
  const [model, setModel] = useLocalStorageState<ModelKey>("model", {
    defaultValue: config.models.default,
  });
  const [input, setInput] = useState("");
  const [startTime, setStartTime] = useState<number>();
  const [systemValue, setSystemValue] = useLocalStorageState<string>(
    "system-message",
    {
      defaultValue:
        "You are a concise assistant. Use markdown for your responses.",
    },
  );

  const [chatId, setChatId] = useState(0);
  const {
    messages,
    setMessages,
    status,
    stop,
    error,
    sendMessage,
    regenerate,
  } = useChat<UIMessage>({
    id: chatId.toString(),
    experimental_throttle: 500,
    messages: [createSystemMessage(systemValue)],
  });
  const isLoading = status === "submitted" || status === "streaming";

  useEffect(() => {
    if (error) {
      console.log(error);
    }
  }, [error]);

  const [conversationHistory, setConversationHistory] = useHistory(
    isLoading,
    startTime,
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
          nextMessages[systemIndex].parts = [{ type: "text", text: content }];
        } else {
          nextMessages.unshift(createSystemMessage(content));
        }
        return nextMessages;
      });
    }, config.ui.systemMessageDebounce),
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

  // HISTORY HANDLERS
  // =================
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
    if (activeHistoryEntry) {
      setMessages(activeHistoryEntry.messages);
      setActiveHistoryEntry(undefined);
      setShowHistory(false);
      if (activeHistoryEntry.messages[0]?.parts[0]?.type === "text") {
        setSystemValue(activeHistoryEntry.messages[0].parts[0].text);
      }
    }
  }, [activeHistoryEntry, setSystemValue, setMessages]);

  const handleSetActiveHistoryEntry = useCallback(
    (nextMessages?: HistoryEntry) => {
      setActiveHistoryEntry(nextMessages);
    },
    [],
  );

  const handleDeleteHistory = useCallback(() => {
    setShowDeleteConfirmation(true);
  }, []);

  const handleLoadHistory = useCallback(async () => {
    try {
      const history = superjson.parse(await loadJsonFile()) as HistoryEntry[];
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
  // =================

  // ACTION HANDLERS
  // =================
  const handleReset = useCallback(() => {
    setChatId((currentChatId) => currentChatId + 1);
    setFiles([]);
    setStartTime(undefined);
  }, []);

  const handleShowHistory = useCallback(() => {
    setShowHistory(true);
  }, []);
  // =================

  const handleSubmit = useCallback(() => {
    if (!startTime) {
      setStartTime(Date.now());
    }
    sendMessage(
      { text: input },
      {
        body: {
          model,
        } satisfies Omit<ChatRequest, "messages">,
      },
    );
    setInput("");
    setFiles([]);
  }, [sendMessage, input, model, startTime]);

  return (
    <>
      <Actions
        disabledHistoryActions={Object.keys(conversationHistory).length === 0}
        model={model}
        onModelChange={setModel}
        onReset={handleReset}
        onShowHistory={handleShowHistory}
        showAttachmentModelsOnly={
          files.length > 0 ||
          messages.some(({ parts }) =>
            parts.some((part) => part.type === "file"),
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
          onRetry={regenerate}
          showCopyAll
        />
        <Prompt
          disabledReplay={messages.length < 2}
          input={input}
          isFirstPrompt={messages.length === 1}
          isLoading={isLoading}
          onChange={(e) => setInput(e.target.value)}
          onClickStop={stop}
          files={files}
          currentModel={model}
          onModelChange={setModel}
          onAddAttachments={(newAttachments) => {
            setFiles((previousAttachments) => [
              ...previousAttachments,
              ...newAttachments,
            ]);
          }}
          onRemoveAttachment={(index) => {
            setFiles((previousAttachments) =>
              previousAttachments.filter((_, i) => i !== index),
            );
          }}
          onSubmit={(event) => {
            event.preventDefault();
            if (input === "" && files.length === 0) {
              regenerate({
                body: {
                  model,
                } satisfies Omit<ChatRequest, "messages">,
              });
              return;
            } else {
              handleSubmit();
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

export default withProfiler(Home);
