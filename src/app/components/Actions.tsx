import { isDev } from "@/utils/consts";
import { css } from "../../../styled-system/css";
import { styled } from "../../../styled-system/jsx";
import HmrTimestamp from "./HmrTimestamp";
import { AuthButtonClient } from "../login/components/AuthButton/AuthButtonClient";
import { IconButton } from "@/components/IconButton";

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
      <IconButton name="reset" iconSize="md" onClick={onReset} />
      <IconButton
        name="history"
        iconSize="md"
        disabled={disabledHistoryActions}
        onClick={onShowHistory}
      />
      <IconButton
        name="delete"
        iconSize="md"
        disabled={disabledHistoryActions}
        onClick={onDeleteHistory}
      />
      <IconButton name="load" iconSize="md" onClick={onLoad} />
      <IconButton name="save" iconSize="md" onClick={onSave} />
      <AuthButtonClient isSignedIn />
    </StyledActions>
  );
}
