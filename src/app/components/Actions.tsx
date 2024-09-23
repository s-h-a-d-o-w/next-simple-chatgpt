import { css } from "../../../styled-system/css";
import { styled } from "../../../styled-system/jsx";
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

const StyledActions = styled("div", {
  base: {
    padding: "12rem",
    marginRight: "12rem",

    display: "flex",
    flexWrap: "wrap",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: "12rem",
  },
});

function BuildInfo() {
  return (
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
      {process.env.NODE_ENV !== "production" && (
        <>
          Last update: <HmrTimestamp /> |
        </>
      )}
    </div>
  );
}

export function Actions({
  disabledHistoryActions,
  onDeleteHistory,
  onShowHistory,
  onLoad,
  onReset,
  onSave,
}: Props) {
  return (
    <StyledActions>
      <BuildInfo />
      <Button onClick={onReset}>Reset</Button>
      <Button disabled={disabledHistoryActions} onClick={onShowHistory}>
        History
      </Button>
      <Button disabled={disabledHistoryActions} onClick={onDeleteHistory}>
        Delete History
      </Button>
      <Button onClick={onLoad}>Load</Button>
      <Button onClick={onSave}>Save</Button>
    </StyledActions>
  );
}
