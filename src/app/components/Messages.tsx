import { Message as MessageType } from "ai";
import { styled } from "../../../styled-system/jsx";
import { Message } from "@/app/components/Message";
import { Button } from "@/components/Button";

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
  messages: MessageType[];

  hasError?: boolean;
  onDelete?: (id: string) => void;
  onRetry?: () => void;
  showCopyAll?: boolean;
};

export function Messages({
  hasError,
  messages,
  onDelete,
  onRetry,
  showCopyAll,
}: Props) {
  return (
    <>
      {messages.map((message) => (
        <MessageContainer key={message.id} isUser={message.role === "user"}>
          <Message onDelete={onDelete} showCopyAll={showCopyAll} {...message} />
        </MessageContainer>
      ))}
      {hasError && (
        <div style={{ alignSelf: "flex-end" }}>
          An error occurred. If it keeps happening, please try refreshing the page.{" "}
          <Button type="button" onClick={onRetry}>
            Retry
          </Button>
        </div>
      )}
    </>
  );
}
