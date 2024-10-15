import { formatDistance } from "date-fns/formatDistance";
import { type Message as MessageType } from "ai/react";
import { Button } from "@/components/Button";
import { Dialog } from "@/components/Dialog";
import { IconButton } from "@/components/IconButton";
import { Message } from "@/app/components/Message";
import { styled } from "../../../styled-system/jsx";
import { css } from "../../../styled-system/css";
import { Messages } from "./Messages";

type Props = {
  conversationHistory: MessageType[][];
  isOpen: boolean;
  onClose: () => void;
  onDeleteHistoryEntry: (index: number) => void;
  onRestoreHistoryEntry: () => void;
  onSetActiveHistoryEntry: (messages?: MessageType[]) => void;

  activeHistoryEntry?: MessageType[];
};

const StyledHistory = styled("div", {
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
    <Dialog isModal={false} isOpen={isOpen} onClose={onClose}>
      <StyledHistory align="right">
        {conversationHistory
          .slice(0)
          .reverse()
          .map((messages, index) =>
            !messages[1] ? null : (
              <div key={index}>
                <div
                  className={css({
                    fontSize: "sm",
                  })}
                >
                  {messages[1]?.createdAt
                    ? formatDistance(messages[1].createdAt, new Date(), {
                        addSuffix: true,
                      })
                    : ""}
                </div>
                <div style={{ position: "relative" }}>
                  <Message
                    {...messages[1]}
                    fullHeight={false}
                    shortened
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
            ),
          )}
      </StyledHistory>

      {activeHistoryEntry && (
        <StyledHistory align="left">
          <Button
            onClick={onRestoreHistoryEntry}
            style={{ alignSelf: "flex-end" }}
          >
            Restore
          </Button>
          <Messages messages={activeHistoryEntry} />
        </StyledHistory>
      )}
    </Dialog>
  );
}
