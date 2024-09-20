import { formatDistance } from "date-fns/formatDistance";
import { Button } from "./Button";
import { type Message as MessageType } from "ai/react";
import { css } from "../../../styled-system/css";
import { Message } from "./Message";
import { styled } from "../../../styled-system/jsx";
import { IconButton } from "./IconButton";
import { Modal } from "./Modal";

type Props = {
  conversationHistory: MessageType[][];
  isOpen: boolean;
  onClose: () => void;
  onDeleteHistoryEntry: (index: number) => void;
  onRestoreHistoryEntry: () => void;
  onSetActiveHistoryEntry: (messages: MessageType[]) => void;

  activeHistoryEntry?: MessageType[];
};

const StyledContainer = styled("div", {
  base: {
    position: "fixed",
    overflow: "auto",
    backgroundColor: "amber.50",
    padding: "12rem",
    boxShadow: "lg",

    display: "flex",
    flexDirection: "column",
    gap: "8rem",
  },
});

export function History({
  activeHistoryEntry,
  conversationHistory,
  isOpen,
  onClose,
  onDeleteHistoryEntry,
  onRestoreHistoryEntry,
  onSetActiveHistoryEntry,
}: Props) {
  return (
    <Modal isModal={false} isOpen={isOpen} onClose={onClose}>
      <StyledContainer
        className={css({
          top: "10%",
          bottom: "10%",
          right: "8rem",

          width: "40%",
        })}
      >
        {conversationHistory
          .slice(0)
          .reverse()
          .map((messages, index) => (
            <div key={index}>
              <div
                className={css({
                  fontSize: "sm",
                })}
              >
                {messages[1].createdAt
                  ? formatDistance(messages[1].createdAt, new Date(), {
                      addSuffix: true,
                    })
                  : ""}
              </div>
              <div style={{ position: "relative" }}>
                <Message
                  {...messages[1]}
                  className={css({
                    cursor: "pointer",
                    maxHeight: "115rem",
                    overflowY: "hidden",
                    textOverflow: "ellipsis",
                  })}
                  onClick={() => {
                    onSetActiveHistoryEntry(messages);
                  }}
                />
                <IconButton
                  name="delete"
                  type="submit"
                  size="md"
                  ghost
                  onClick={(event) => {
                    event.stopPropagation();
                    const index = conversationHistory.findIndex(
                      (_messages) => _messages === messages,
                    );
                    onDeleteHistoryEntry(index);
                  }}
                  className={css({
                    position: "absolute",
                    top: "8rem",
                    right: "8rem",
                  })}
                />
              </div>
            </div>
          ))}
      </StyledContainer>

      {activeHistoryEntry && (
        <StyledContainer
          className={css({
            top: "26rem",
            left: "8rem",
            bottom: "16rem",

            width: "57%",
          })}
        >
          <Button
            onClick={onRestoreHistoryEntry}
            style={{ alignSelf: "flex-end" }}
          >
            Restore
          </Button>
          {activeHistoryEntry.map((message, index) => (
            <Message
              key={index}
              {...message}
              className={
                message.role === "user"
                  ? css({ width: "80%", alignSelf: "flex-start" })
                  : css({ width: "80%", alignSelf: "flex-end" })
              }
            />
          ))}
        </StyledContainer>
      )}
    </Modal>
  );
}
