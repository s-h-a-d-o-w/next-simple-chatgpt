import { formatDistance } from "date-fns/formatDistance";
import { css } from "../../../../styled-system/css";
import { IconButton } from "@/components/IconButton";
import type { Message as MessageType } from "@ai-sdk/react";
import { Message } from "../Message";
import { styled } from "../../../../styled-system/jsx";

type Props = {
  message: MessageType;
  onDeleteHistoryEntry: () => void;
  onSetActiveHistoryEntry: () => void;
};

const StyledDeleteButton = styled(IconButton, {
  base: {
    position: "absolute",
    top: "8rem",
    right: "8rem",
  },
});

export function ShortenedEntry({
  message,
  onDeleteHistoryEntry,
  onSetActiveHistoryEntry,
}: Props) {
  return (
    <div>
      <div
        className={css({
          fontSize: "sm",
        })}
      >
        {message.createdAt
          ? formatDistance(message.createdAt, new Date(), {
              addSuffix: true,
            })
          : ""}
      </div>
      <div style={{ position: "relative" }}>
        <Message {...message} shortened onClick={onSetActiveHistoryEntry} />
        <StyledDeleteButton
          name="delete"
          type="button"
          iconSize="md"
          ghost
          onClick={onDeleteHistoryEntry}
        />
      </div>
    </div>
  );
}
