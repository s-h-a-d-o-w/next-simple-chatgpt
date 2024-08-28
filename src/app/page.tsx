"use client";

import { useChat, type Message as MessageType } from "ai/react";
import { cloneDeep, debounce } from "lodash";
import { ChangeEventHandler, useCallback, useEffect, useState } from "react";
import superjson from "superjson";
import useLocalStorageState from "use-local-storage-state";
import { styled, VStack } from "../../styled-system/jsx";
import { Button } from "./components/Button";
import HmrTimestamp from "./components/HmrTimestamp";
import { Message } from "./components/Message";
import Spinner from "./components/Spinner";

const DEBUG = false;
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
  const [showHistory, setShowHistory] = useState(false);
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
  const [history, setHistory] = useLocalStorageState<
    Record<string, MessageType[]>
  >("history", {
    defaultValue: {},
    serializer: superjson,
  });
  const [lastHistoryUpdate, setLastHistoryUpdate] = useState(0);

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
          nextHistory![firstMessageDate] = messages;
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

  // useEffect(() => {
  //   setMessages([
  //     {
  //       role: "user",
  //       content: "something",
  //       id: "1",
  //     },
  //     {
  //       role: "assistant",
  //       content: "something else \n```ts\nconst bla = 1;\n```",
  //       id: "2",
  //     },
  //   ]);
  // }, [setMessages]);

  return (
    <>
      <nav
        style={{
          display: "flex",
          justifyContent: "flex-end",
          gap: "10rem",
          marginRight: "10rem",
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
          onClick={() => {
            setShowHistory(!showHistory);
          }}
        >
          History Picker
        </Button>
      </nav>
      <main>
        <VStack>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              width: "800px",
              gap: "10rem",
            }}
          >
            <form style={{ display: "flex" }}>
              System:
              <StyledInput
                name="prompt"
                value={systemValue}
                onChange={handleSystemInput}
                style={{ flexGrow: 1 }}
              />
            </form>

            {messages.map((message) => (
              <div key={message.id}>
                <Message
                  key={message.id}
                  handleDelete={handleDelete}
                  {...message}
                />
                {DEBUG && <>raw: {JSON.stringify(message, null, 2)}</>}
              </div>
            ))}

            {error && (
              <>
                <div>An error occurred.</div>
                <Button type="button" onClick={() => reload()}>
                  Retry
                </Button>
              </>
            )}

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
                position: "absolute",
                bottom: "10rem",
                width: "800px",
                alignItems: "center",
                gap: "10rem",
              }}
            >
              <StyledInput
                name="prompt"
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
        </VStack>
      </main>
      {showHistory && (
        <div
          style={{ position: "fixed", width: "100%", height: "100%", top: 0 }}
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
            top: "10%", // TODO: implement click outside to close
            right: 0,
            width: "30%",
            backgroundColor: "white",
            border: "1px solid black",
            padding: "20rem",
          }}
        >
          {Object.keys(history).map((key) => (
            <div
              key={key}
              onClick={() => {
                setActiveHistoryEntry(history[key]);
              }}
            >
              {history[key][1].createdAt?.toLocaleString()}:{" "}
              {history[key][1].content}
            </div>
          ))}
        </div>
      )}
      {activeHistoryEntry && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "60%",
            backgroundColor: "white",
            border: "1px solid black",
            padding: "20rem",
          }}
        >
          <Button
            onClick={() => {
              setMessages(activeHistoryEntry);
              setActiveHistoryEntry(undefined);
              setShowHistory(false);
            }}
          >
            Restore
          </Button>
          {activeHistoryEntry.map((message, index) => (
            <div key={index}>{JSON.stringify(message, null, 2)}</div>
          ))}
        </div>
      )}
    </>
  );
}
