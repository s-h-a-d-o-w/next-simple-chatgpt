import { formatDistance } from "date-fns/formatDistance";
import { Button } from "./Button";
import { type Message as MessageType } from "ai/react";
import { css } from "../../../styled-system/css";
import { Message } from "./Message";
import { createPortal } from "react-dom";
import { styled } from "../../../styled-system/jsx";

type Props = {
  conversationHistory: MessageType[][];
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

    // position: "fixed",

    display: "flex",
    flexDirection: "column",
    gap: "8rem",
  },
});

export function History({
  activeHistoryEntry,
  conversationHistory,
  onClose,
  onDeleteHistoryEntry,
  onRestoreHistoryEntry,
  onSetActiveHistoryEntry,
}: Props) {
  return createPortal(
    <>
      <div
        className={css({
          position: "fixed",
          width: "100%",
          height: "100%",
          top: 0,
          backgroundColor: "white",
          opacity: "0.5",
        })}
        onClick={onClose}
      />
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
                <span
                  onClick={(event) => {
                    event.stopPropagation();
                    const index = conversationHistory.findIndex(
                      (_messages) => _messages === messages,
                    );
                    onDeleteHistoryEntry(index);
                  }}
                >
                  🚮
                </span>
              </div>
              <Message
                {...messages[1]}
                className={css({
                  // marginBottom: "16rem",
                  cursor: "pointer",
                  maxHeight: "115rem",
                  overflowY: "hidden",
                  textOverflow: "ellipsis",
                })}
                onClick={() => {
                  onSetActiveHistoryEntry(messages);
                }}
              />
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
    </>,
    document.body,
  );
}
