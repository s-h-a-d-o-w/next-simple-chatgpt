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
import { styled, VStack } from "../../styled-system/jsx";
import { Button } from "./components/Button";
import { DeleteConfirmationModal } from "./components/DeleteConfirmationModal";
import { History } from "./components/History";
import { Message } from "./components/Message";
import { Navigation } from "./components/Navigation";
import Spinner from "./components/Spinner";
import { loadJsonFile } from "./loadJsonFile";
import { saveJsonFile } from "./saveJsonFile";
import { css } from "../../styled-system/css";

// const DEBUG = true;

const StyledInput = styled("textarea", {
  base: {
    border: "1px solid black",
    padding: "4rem 8rem",
  },
});

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
            <form style={{ display: "flex", flexDirection: "column" }}>
              <div>System</div>
              <StyledInput
                name="prompt"
                value={systemValue}
                onChange={handleSystemInput}
                style={{ flexGrow: 1 }}
              />
            </form>

            {messages.map((message) => (
              <Message
                key={message.id}
                handleDelete={handleDelete}
                className={
                  message.role === "user"
                    ? css({ width: "80%", alignSelf: "flex-start" })
                    : css({ width: "80%", alignSelf: "flex-end" })
                }
                {...message}
              />
            ))}

            {error && (
              <>
                <div>An error occurred.</div>
                <Button type="button" onClick={() => reload()}>
                  Retry
                </Button>
              </>
            )}

            <div
              style={{
                position: "fixed",
                bottom: 0,
                left: 0,
                right: 0,

                display: "flex",
                justifyContent: "center",
              }}
            >
              <form
                onSubmit={(event) => {
                  if (input === "") {
                    event.preventDefault();
                    reload();
                  } else {
                    handleSubmit(event);
                  }
                }}
                className={css({
                  display: "flex",
                  maxWidth: "800px",
                  width: "100%",
                  padding: "10rem",

                  alignItems: "center",
                  gap: "10rem",
                  backgroundColor: "amber.50",
                  boxShadow: "lg",
                })}
              >
                <StyledInput
                  name="prompt"
                  placeholder="Leave empty to re-run."
                  value={input}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  style={{ flexGrow: 1 }}
                />

                {isLoading ? (
                  <>
                    <Spinner />
                    <Button type="button" onClick={() => stop()}>
                      Stop
                    </Button>
                  </>
                ) : (
                  <Button type="submit">Run</Button>
                )}
              </form>
            </div>
          </div>
        </VStack>
        <div ref={endOfPageRef} />
      </main>

      {showHistory && (
        <History
          activeHistoryEntry={activeHistoryEntry}
          conversationHistory={conversationHistory}
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
      )}

      <DeleteConfirmationModal
        isOpen={showDeleteConfirmation}
        onConfirm={() => {
          console.log("ok");
          // setConversationHistory([]);
          setShowDeleteConfirmation(false);
        }}
        onClose={() => {
          console.log("cancel");
          setShowDeleteConfirmation(false);
        }}
      />
    </>
  );
}
