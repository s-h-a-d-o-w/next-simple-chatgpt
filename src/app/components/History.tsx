import { formatDistance } from "date-fns/formatDistance";
import { Button } from "./Button";
import { type Message as MessageType } from "ai/react";
import { css } from "../../../styled-system/css";
import { Message } from "./Message";
import { createPortal } from "react-dom";

type Props = {
  conversationHistory: MessageType[][];
  onClose: () => void;
  onDeleteHistoryEntry: (index: number) => void;
  onRestoreHistoryEntry: () => void;
  onSetActiveHistoryEntry: (messages: MessageType[]) => void;

  activeHistoryEntry?: MessageType[];
};

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
        style={{
          position: "fixed",
          width: "100%",
          height: "100%",
          top: 0,
          backgroundColor: "white",
          opacity: "0.5",
        }}
        onClick={onClose}
      />
      <div
        style={{
          position: "fixed",
          top: "10%",
          bottom: "10%",
          right: "8rem",
          overflow: "auto",

          width: "40%",

          backgroundColor: "white",
          border: "1px solid black",
          padding: "12rem",
        }}
      >
        {conversationHistory
          .slice(0)
          .reverse()
          .map((messages, index) => (
            <div
              key={index}
              onClick={() => {
                onSetActiveHistoryEntry(messages);
              }}
              className={css({
                backgroundColor: "orange.100",
                padding: "4rem",
                marginBottom: "8rem",
                cursor: "pointer",
                maxHeight: "115rem",
                overflowY: "hidden",
                textOverflow: "ellipsis",
              })}
            >
              <div>
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
              {messages[1].content}
            </div>
          ))}
      </div>

      {activeHistoryEntry && (
        <div
          style={{
            position: "fixed",
            top: "8rem",
            left: "8rem",
            bottom: "8rem",
            width: "58%",
            backgroundColor: "white",
            border: "1px solid black",
            padding: "12rem",
            overflow: "auto",

            display: "flex",
            flexDirection: "column",
            gap: "8rem",
          }}
        >
          <Button
            onClick={onRestoreHistoryEntry}
            style={{ alignSelf: "flex-end" }}
          >
            Restore
          </Button>
          {activeHistoryEntry.map((message, index) => (
            <Message key={index} {...message} />
          ))}
        </div>
      )}
    </>,
    document.body,
  );
}
