import { formatDistance } from "date-fns/formatDistance";
import { type Message as MessageType } from "ai/react";
import { Button } from "@/components/Button";
import { Dialog } from "@/components/Dialog";
import { IconButton } from "@/components/IconButton";
import { Message } from "@/components/Message";
import { styled } from "../../../styled-system/jsx";
import { css } from "../../../styled-system/css";

type Props = {
  conversationHistory: MessageType[][];
  isOpen: boolean;
  onClose: () => void;
  onDeleteHistoryEntry: (index: number) => void;
  onRestoreHistoryEntry: () => void;
  onSetActiveHistoryEntry: (messages?: MessageType[]) => void;

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

  variants: {
    align: {
      left: {
        width: "58%",
        height: "93%",

        top: "24rem",
        left: "16rem",
      },
      right: {
        width: "38%",
        maxHeight: "80%",

        top: "64rem",
        right: "16rem",
      },
    },
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
    <>
      <Dialog isModal={false} isOpen={isOpen} onClose={onClose}>
        <StyledContainer align="right">
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
                    fullHeight={false}
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
                    type="button"
                    iconSize="md"
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
          <StyledContainer align="left">
            <Button
              onClick={onRestoreHistoryEntry}
              style={{ alignSelf: "flex-end" }}
            >
              Restore
            </Button>
            {activeHistoryEntry?.map((message, index) => (
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
      </Dialog>
    </>
  );
}
