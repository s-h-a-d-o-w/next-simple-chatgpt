import { css } from "../../styled-system/css";
import { Button } from "./Button";
import HmrTimestamp from "./HmrTimestamp";
import { type Message as MessageType } from "ai/react";

type Props = {
  conversationHistory: MessageType[][];
  onDeleteHistory: () => void;
  onHistory: () => void;
  onLoad: () => void;
  onReset: () => void;
  onSave: () => void;
};

const isDev = process.env.NODE_ENV !== "production";

export function Navigation({
  conversationHistory,
  onDeleteHistory,
  onHistory,
  onLoad,
  onReset,
  onSave,
}: Props) {
  return (
    <nav
      className={css({
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "flex-end",
        alignItems: "center",
        gap: "12rem",
        marginRight: "12rem",
        padding: "12rem",
      })}
    >
      <div
        className={css({
          fontSize: "sm",
        })}
      >
        | Built:{" "}
        {process.env.BUILD_TIMESTAMP
          ? new Date(parseInt(process.env.BUILD_TIMESTAMP, 10)).toLocaleString()
          : "unknown build time"}{" "}
        |{" "}
        {isDev && (
          <>
            Last update: <HmrTimestamp /> |
          </>
        )}
      </div>
      <Button onClick={onReset}>Reset</Button>
      <Button
        disabled={Object.keys(conversationHistory).length === 0}
        onClick={onHistory}
      >
        History
      </Button>
      <Button
        disabled={Object.keys(conversationHistory).length === 0}
        onClick={onDeleteHistory}
      >
        Delete History
      </Button>
      <Button onClick={onLoad}>Load</Button>
      <Button onClick={onSave}>Save</Button>
    </nav>
  );
}
