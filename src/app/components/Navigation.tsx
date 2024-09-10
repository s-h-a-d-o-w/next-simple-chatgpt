import { isDev } from "../utils";
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
      style={{
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "flex-end",
        alignItems: "center",
        gap: "12rem",
        marginRight: "12rem",
        padding: "12rem",
      }}
    >
      | Built:{" "}
      {process.env.buildTimestamp
        ? new Date(
            parseInt(process.env.buildTimestamp, 10),
          ).toLocaleTimeString()
        : "unknown build time"}{" "}
      |{" "}
      {isDev && (
        <>
          Last update: <HmrTimestamp /> |
        </>
      )}
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
