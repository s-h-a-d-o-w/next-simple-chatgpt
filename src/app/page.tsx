"use client";

import { useChat, type Message as MessageType } from "ai/react";
import { formatDistance } from "date-fns/formatDistance";
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
import { css } from "../../styled-system/css";
import { styled, VStack } from "../../styled-system/jsx";
import { Button } from "./components/Button";
import HmrTimestamp from "./components/HmrTimestamp";
import { Message } from "./components/Message";
import Spinner from "./components/Spinner";
import { loadJsonFile } from "./loadJsonFile";
import { saveJsonFile } from "./saveJsonFile";
import { DeleteConfirmationModal } from "./components/DeleteConfirmationModal";

// const DEBUG = true;
const isDev = process.env.NODE_ENV !== "production";

const StyledInput = styled("textarea", {
  base: {
    border: "1px solid black",
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
    data,
    metadata,
  } = useChat({
    keepLastMessageOnError: true,
    initialMessages: [createSystemMessage(systemValue)],
  });
  const [history, setHistory] = useLocalStorageState<Array<MessageType[]>>(
    "history",
    {
      defaultValue: [],
      serializer: superjson,
    },
  );
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
        setHistory((history) => {
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
  }, [isLoading, lastHistoryUpdate, messages, setHistory]);

  console.log({
    data,
    metadata,
  });

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
      <nav
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "flex-end",
          alignItems: "center",
          gap: "12rem",
          marginRight: "12rem",
          padding: "12rem",
        }}
      >
        | Built:{" "}
        {process.env.buildTimestamp
          ? new Date(
              parseInt(process.env.buildTimestamp, 10),
            ).toLocaleTimeString()
          : "unknown build time"}{" "}
        |{" "}
        {isDev && (
          <>
            Last update: <HmrTimestamp /> |
          </>
        )}
        <Button
          onClick={() => {
            setMessages([createSystemMessage(systemValue)]);
          }}
        >
          Reset
        </Button>
        <Button
          disabled={Object.keys(history).length === 0}
          onClick={() => {
            setShowHistory(!showHistory);
          }}
        >
          History
        </Button>
        <Button
          disabled={Object.keys(history).length === 0}
          onClick={() => {
            setShowDeleteConfirmation(true);
          }}
        >
          Delete History
        </Button>
        <Button
          onClick={async () => {
            try {
              const history = superjson.parse(await loadJsonFile()) as Array<
                MessageType[]
              >;
              setHistory(history);
            } catch {
              // user cancelled or picked nonsense. should probably show error.
            }
          }}
        >
          Load
        </Button>
        <Button
          onClick={() => {
            saveJsonFile(
              history,
              `history-${new Date().toISOString().replace(/[:.]/g, "-")}`,
            );
          }}
        >
          Save
        </Button>
      </nav>
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
            <form style={{ display: "flex", gap: "8rem" }}>
              System
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
                style={{
                  display: "flex",
                  maxWidth: "800px",
                  width: "100%",
                  padding: "10rem",

                  alignItems: "center",
                  gap: "10rem",
                  backgroundColor: "white",
                  border: "1px solid black",
                }}
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
        <div
          style={{
            position: "fixed",
            width: "100%",
            height: "100%",
            top: 0,
            backgroundColor: "white",
            opacity: "0.5",
          }}
          onClick={() => {
            if (showHistory) {
              setShowHistory(false);
              setActiveHistoryEntry(undefined);
            }
          }}
        />
      )}
      {showHistory && history && (
        <div
          style={{
            position: "fixed",
            top: "10%",
            bottom: "10%",
            right: "8rem",
            overflow: "auto",

            width: "40%",

            backgroundColor: "white",
            border: "1px solid black",
            padding: "12rem",
          }}
        >
          {history
            .slice(0)
            .reverse()
            .map((messages, index) => (
              <div
                key={index}
                onClick={() => {
                  setActiveHistoryEntry(messages);
                }}
                className={css({
                  backgroundColor: "orange.100",
                  padding: "4rem",
                  marginBottom: "8rem",
                  cursor: "pointer",
                  maxHeight: "115rem",
                  overflowY: "hidden",
                  textOverflow: "ellipsis",
                })}
              >
                <div>
                  {messages[1].createdAt
                    ? formatDistance(messages[1].createdAt, new Date(), {
                        addSuffix: true,
                      })
                    : ""}
                  <span
                    onClick={(event) => {
                      event.stopPropagation();
                      const index = history.findIndex(
                        (_messages) => _messages === messages,
                      );
                      const nextHistory = cloneDeep(history);
                      nextHistory.splice(index, 1);
                      setHistory(nextHistory);
                    }}
                  >
                    🚮
                  </span>
                </div>
                {messages[1].content}
              </div>
            ))}
        </div>
      )}
      {activeHistoryEntry && (
        <div
          style={{
            position: "fixed",
            top: "8rem",
            left: "8rem",
            bottom: "8rem",
            width: "58%",
            backgroundColor: "white",
            border: "1px solid black",
            padding: "12rem",
            overflow: "auto",

            display: "flex",
            flexDirection: "column",
            gap: "8rem",
          }}
        >
          <Button
            onClick={() => {
              setMessages(activeHistoryEntry);
              setActiveHistoryEntry(undefined);
              setShowHistory(false);
            }}
            style={{ alignSelf: "flex-end" }}
          >
            Restore
          </Button>
          {activeHistoryEntry.map((message, index) => (
            <Message key={index} {...message} />
          ))}
        </div>
      )}
      {showDeleteConfirmation && (
        <DeleteConfirmationModal
          onConfirm={() => {
            setHistory([]);
            setShowDeleteConfirmation(false);
          }}
          onClose={() => {
            setShowDeleteConfirmation(false);
          }}
        />
      )}
    </>
  );
}
