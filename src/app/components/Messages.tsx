import { Message } from "@/app/components/Message";
import { Button } from "@/components/Button";
import { Message as MessageType } from "ai";
import { styled } from "../../../styled-system/jsx";

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

type Props = {
  isLoading: boolean;
  messages: MessageType[];

  hasError?: boolean;
  onDelete?: (id: string) => void;
  onRetry?: () => void;
  showCopyAll?: boolean;
};

export function Messages({
  hasError,
  isLoading,
  messages,
  onDelete,
  onRetry,
  showCopyAll,
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
          <Message content="" id="message-loading" role="assistant" />
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
}
