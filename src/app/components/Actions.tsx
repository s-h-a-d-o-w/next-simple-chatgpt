import { isDev, type models } from "@/utils/consts";
import { css } from "../../../styled-system/css";
import { styled } from "../../../styled-system/jsx";
import HmrTimestamp from "./HmrTimestamp";
import { AuthButtonClient } from "../login/components/AuthButton/AuthButtonClient";
import { IconButton } from "@/components/IconButton";
import { ModelSelector } from "./ModelSelector";

type Props = {
  disabledHistoryActions: boolean;
  model: keyof typeof models;
  onModelChange: (model: keyof typeof models) => void;
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
    gap: "12rem",
  },
});

export function Actions({
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
          onModelChange(value as keyof typeof models);
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
      </StyledButtonGroup>
    </StyledActions>
  );
}
