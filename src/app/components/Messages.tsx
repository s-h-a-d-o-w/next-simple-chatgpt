import { Message as MessageType } from "ai";
import { styled } from "../../../styled-system/jsx";
import { Message } from "@/app/components/Message";
import { Button } from "@/components/Button";

const StyledMessage = styled("div", {
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
};

export function Messages({ hasError, messages, onDelete, onRetry }: Props) {
  return (
    <>
      {messages.map((message) => (
        <StyledMessage key={message.id} isUser={message.role === "user"}>
          <Message onDelete={onDelete} {...message} />
        </StyledMessage>
      ))}
      {hasError && (
        <div style={{ alignSelf: "flex-end" }}>
          An error occurred.{" "}
          <Button type="button" onClick={onRetry}>
            Retry
          </Button>
        </div>
      )}
    </>
  );
}
