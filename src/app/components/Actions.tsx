import { isDev } from "@/utils/consts";
import { css } from "../../../styled-system/css";
import { styled } from "../../../styled-system/jsx";
import { Button } from "../../components/Button";
import HmrTimestamp from "./HmrTimestamp";
import { AuthButtonClient } from "../login/components/AuthButton/AuthButtonClient";

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
      {isDev && (
        <div
          className={css({
            fontSize: "sm",
          })}
        >
          Last update: <HmrTimestamp />
        </div>
      )}
      <Button onClick={onReset}>Reset</Button>
      <Button disabled={disabledHistoryActions} onClick={onShowHistory}>
        History
      </Button>
      <Button disabled={disabledHistoryActions} onClick={onDeleteHistory}>
        Delete History
      </Button>
      <Button onClick={onLoad}>Load</Button>
      <Button onClick={onSave}>Save</Button>
      <AuthButtonClient isSignedIn />
    </StyledActions>
  );
}
