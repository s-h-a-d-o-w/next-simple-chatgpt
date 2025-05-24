"use client";

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
import { loadJsonFile } from "../utils/loadJsonFile";
import { saveJsonFile } from "../utils/saveJsonFile";
import { DeleteConfirmationModal } from "./components/DeleteConfirmationModal";
import { History } from "./components/History";
import { Messages } from "./components/Messages";
import { Actions } from "./components/Actions";
import { Prompt } from "./components/Prompt";
import { SystemPrompt } from "./components/SystemPrompt";
import { useScrollToTarget } from "@/hooks/useScrollToTarget";
import { useHistory } from "@/hooks/useHistory";
import { styled } from "../../styled-system/jsx";
import { isDev } from "@/utils/consts";
import useLocalStorageState from "use-local-storage-state";

if (!isDev) {
  const buildInfo = process.env["NEXT_PUBLIC_BUILD_INFO"]?.split(",");
  if (buildInfo && buildInfo[0]) {
    console.log(
      new Date(parseInt(buildInfo[0], 10)).toLocaleString(),
      buildInfo[1],
    );
  }
}

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
  const [model, setModel] = useLocalStorageState<string>("model", {
    defaultValue: "gpt-4-turbo",
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
    },
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

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const syncSystemMessage = useCallback(
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

  const handleDelete = (id: string) => {
    setMessages(messages.filter((message) => message.id !== id));
  };

  const handleSystemInput: ChangeEventHandler<HTMLTextAreaElement> = (
    event,
  ) => {
    setSystemValue(event.target.value);
    syncSystemMessage(event.target.value);
  };

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
          setMessages([createSystemMessage(systemValue)]);
        }}
      />

      <StyledMain>
        <SystemPrompt value={systemValue} onChange={handleSystemInput} />
        <Messages
          hasError={Boolean(error)}
          isLoading={isLoading}
          messages={messages}
          onDelete={handleDelete}
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
        onClose={() => {
          setShowHistory(false);
          setActiveHistoryEntry(undefined);
        }}
        onDeleteHistoryEntry={(index) => {
          const nextHistory = cloneDeep(conversationHistory);
          nextHistory.splice(index, 1);
          setConversationHistory(nextHistory);
        }}
        onRestoreHistoryEntry={() => {
          if (activeHistoryEntry?.[0]) {
            setSystemValue(activeHistoryEntry[0].content);
            setMessages(activeHistoryEntry);
            setActiveHistoryEntry(undefined);
            setShowHistory(false);
          }
        }}
        onSetActiveHistoryEntry={(nextMessages) => {
          setActiveHistoryEntry(nextMessages);
        }}
        onDeleteHistory={() => {
          setShowDeleteConfirmation(true);
        }}
        onLoad={async () => {
          try {
            const history = superjson.parse(await loadJsonFile()) as Array<
              MessageType[]
            >;
            setConversationHistory(history);
          } catch {
            // TODO: user cancelled or picked nonsense. should probably show error.
          }
        }}
        onSave={() => {
          saveJsonFile(
            conversationHistory,
            `history-${new Date().toISOString().replace(/[:.]/g, "-")}`,
          );
        }}
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
