"use client";

import { useChat, type Message as MessageType } from "ai/react";
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
import { VStack } from "../../styled-system/jsx";
import { loadJsonFile } from "../utils/loadJsonFile";
import { saveJsonFile } from "../utils/saveJsonFile";
import { DeleteConfirmationModal } from "./components/DeleteConfirmationModal";
import { History } from "./components/History";
import { Messages } from "./components/Messages";
import { Navigation } from "./components/Navigation";
import { Prompt } from "./components/Prompt";
import { SystemPrompt } from "./components/SystemPrompt";

function createSystemMessage(content: string) {
  return {
    content,
    role: "system",
    id: "system",
  } as const;
}

export default function Home() {
  const endOfPageRef = useRef<HTMLDivElement>(null);

  const [showHistory, setShowHistory] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [activeHistoryEntry, setActiveHistoryEntry] = useState<MessageType[]>();
  const [systemValue, setSystemValue] = useState(
    "You are a concise assistant.",
  );
  const {
    messages,
    setMessages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    stop,
    error,
    reload,
  } = useChat({
    keepLastMessageOnError: true,
    initialMessages: [createSystemMessage(systemValue)],
  });
  const [conversationHistory, setConversationHistory] = useLocalStorageState<
    Array<MessageType[]>
  >("history", {
    defaultValue: [],
    serializer: superjson,
  });
  const [lastHistoryUpdate, setLastHistoryUpdate] = useState(0);

  // Scroll to bottom while message loads
  useEffect(() => {
    let scrollingInterval: number | undefined;

    if (isLoading) {
      scrollingInterval = window.setInterval(() => {
        endOfPageRef.current?.scrollIntoView();
      }, 100);
    } else {
      clearInterval(scrollingInterval);
    }

    return () => {
      clearInterval(scrollingInterval);
    };
  }, [isLoading]);

  // Keep history in sync
  useEffect(() => {
    const latestMessageDate =
      messages[messages.length - 1].createdAt?.valueOf();
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
            (messages) => messages[1].createdAt?.valueOf() === firstMessageDate,
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

  const handleDelete = (id: string) => {
    setMessages(messages.filter((message) => message.id !== id));
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const updateSystemMessage = useCallback(
    debounce((content: string) => {
      setMessages((innerMessages) => {
        const systemIndex = innerMessages.findIndex(
          (message) => message.role === "system",
        );
        const nextMessages = cloneDeep(innerMessages);
        if (systemIndex >= 0) {
          nextMessages[systemIndex].content = content;
        } else {
          nextMessages.unshift(createSystemMessage(content));
        }
        return nextMessages;
      });
    }, 300),
    [setMessages],
  );

  const handleSystemInput: ChangeEventHandler<HTMLTextAreaElement> = (
    event,
  ) => {
    setSystemValue(event.target.value);
    updateSystemMessage(event.target.value);
  };

  return (
    <>
      <Navigation
        conversationHistory={conversationHistory}
        onDeleteHistory={() => {
          setShowDeleteConfirmation(true);
        }}
        onHistory={() => {
          setShowHistory(true);
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
        onReset={() => {
          setMessages([createSystemMessage(systemValue)]);
        }}
        onSave={() => {
          saveJsonFile(
            conversationHistory,
            `history-${new Date().toISOString().replace(/[:.]/g, "-")}`,
          );
        }}
      />

      <main>
        <VStack>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              maxWidth: "800px",
              width: "100%",
              padding: "10rem",
              gap: "10rem",
              marginBottom: "100rem",
            }}
          >
            <SystemPrompt value={systemValue} onChange={handleSystemInput} />

            <Messages
              hasError={Boolean(error)}
              messages={messages}
              onDelete={handleDelete}
              onRetry={reload}
            />

            <Prompt
              disabledReplay={messages.length < 2}
              input={input}
              isLoading={isLoading}
              onChange={handleInputChange}
              onClickStop={stop}
              onSubmit={(event) => {
                if (input === "") {
                  event.preventDefault();
                  reload();
                } else {
                  handleSubmit(event);
                }
              }}
            />
          </div>
        </VStack>
        <div ref={endOfPageRef} />
      </main>

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
          if (activeHistoryEntry) {
            setMessages(activeHistoryEntry);
            setActiveHistoryEntry(undefined);
            setShowHistory(false);
          }
        }}
        onSetActiveHistoryEntry={(nextMessages) => {
          setActiveHistoryEntry(nextMessages);
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
