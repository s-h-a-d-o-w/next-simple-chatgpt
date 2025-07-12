import { Message } from "@/app/components/Message";
import { Button } from "@/components/Button";
import { Message as MessageType } from "ai";
import { styled } from "../../../styled-system/jsx";
import { memo } from "react";

type Props = {
  messages: MessageType[];

  hasError?: boolean;
  isLoading?: boolean;
  onDelete?: (id: string) => void;
  onRetry?: () => void;
  showCopyAll?: boolean;
};

const MessageContainer = styled("div", {
  base: {
    width: "95%",
    sm: {
      width: "80%",
    },
  },
  variants: {
    isUser: {
      true: {
        alignSelf: "flex-start",
      },
      false: {
        alignSelf: "flex-end",
      },
    },
  },
});

export const Messages = memo(function Messages({
  hasError,
  messages,
  onDelete,
  onRetry,
  showCopyAll,
  isLoading = false,
}: Props) {
  return (
    <>
      {messages
        .filter((message) => message.role !== "system")
        .map((message, idx) => (
          <MessageContainer
            data-testid={`message-${idx}-${message.role}`}
            key={message.id}
            isUser={message.role === "user"}
          >
            <Message
              isLoading={
                isLoading &&
                message.role !== "user" &&
                idx === messages.length - 2
              }
              onDelete={onDelete}
              showCopyAll={showCopyAll}
              {...message}
            />
          </MessageContainer>
        ))}
      {isLoading && messages[messages.length - 1]?.role === "user" && (
        <MessageContainer
          data-testid={`message-loading`}
          key={`message-loading`}
          isUser={false}
        >
          <Message content="" id="message-loading" isLoading role="assistant" />
        </MessageContainer>
      )}
      {hasError && (
        <div style={{ alignSelf: "flex-end" }}>
          An error occurred. If it keeps happening, please try refreshing the
          page.{" "}
          <Button type="button" onClick={onRetry}>
            Retry
          </Button>
        </div>
      )}
    </>
  );
});
