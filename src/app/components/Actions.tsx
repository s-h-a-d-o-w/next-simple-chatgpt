import { IconButton } from "@/components/IconButton";
import { isDev } from "@/utils/consts";
import { type ModelKey } from "@/config";
import { css } from "../../../styled-system/css";
import { styled } from "../../../styled-system/jsx";
import { AuthButtonClient } from "../login/components/AuthButton/AuthButtonClient";
import HmrTimestamp from "./HmrTimestamp";
import { ModelSelector } from "./ModelSelector";
import { ThemeToggle } from "./ThemeToggle";
import { memo } from "react";

type Props = {
  disabledHistoryActions: boolean;
  model: ModelKey;
  onModelChange: (model: ModelKey) => void;
  onShowHistory: () => void;
  onReset: () => void;
  showAttachmentModelsOnly: boolean;
};

const StyledActions = styled("div", {
  base: {
    padding: "12rem",

    display: "flex",
    flexWrap: "wrap",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: "12rem",
  },
});

const StyledButtonGroup = styled("div", {
  base: {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "flex-end",
    gap: "12rem",
  },
});

export const Actions = memo(function Actions({
  disabledHistoryActions,
  model,
  onModelChange,
  onShowHistory,
  onReset,
  showAttachmentModelsOnly,
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
      <ModelSelector
        value={model}
        onChange={(value) => {
          onModelChange(value as ModelKey);
        }}
        showAttachmentModelsOnly={showAttachmentModelsOnly}
      />
      <StyledButtonGroup>
        <IconButton
          name="reset"
          iconSize="md"
          onClick={onReset}
          label="Reset"
        />
        <IconButton
          name="history"
          iconSize="md"
          disabled={disabledHistoryActions}
          onClick={onShowHistory}
          label="History"
        />
        <AuthButtonClient isSignedIn />
        <ThemeToggle />
      </StyledButtonGroup>
    </StyledActions>
  );
});
