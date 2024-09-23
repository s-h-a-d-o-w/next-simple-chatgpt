import { css } from "../../../styled-system/css";
import { Button } from "../../components/Button";
import HmrTimestamp from "./HmrTimestamp";

type Props = {
  disabledHistoryActions: boolean;
  onDeleteHistory: () => void;
  onShowHistory: () => void;
  onLoad: () => void;
  onReset: () => void;
  onSave: () => void;
};

const isDev = process.env.NODE_ENV !== "production";

export function Actions({
  disabledHistoryActions,
  onDeleteHistory,
  onShowHistory,
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
      <Button disabled={disabledHistoryActions} onClick={onShowHistory}>
        History
      </Button>
      <Button disabled={disabledHistoryActions} onClick={onDeleteHistory}>
        Delete History
      </Button>
      <Button onClick={onLoad}>Load</Button>
      <Button onClick={onSave}>Save</Button>
    </nav>
  );
}
