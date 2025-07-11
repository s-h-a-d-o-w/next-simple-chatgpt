import type { Message } from "@ai-sdk/react";
import { styled } from "../../../../styled-system/jsx";
import { isDev, isClientDebug } from "@/utils/consts";
import { StorageUsageWheel } from "./StorageUsageWheel";
import { IconButton } from "@/components/IconButton";

type Props = {
  conversationHistory: Message[][];
  onDeleteHistory: () => void;
  onLoad: () => void;
  onSave: () => void;
};

const StyledHistoryActions = styled("div", {
  base: {
    display: "flex",
    gap: "8rem",
  },
});

const StyledHistoryHeader = styled("div", {
  base: {
    display: "flex",
    justifyContent: isDev || isClientDebug ? "space-between" : "flex-end",
    alignItems: "center",
    marginBottom: "8rem",
  },
});

export function HistoryHeader({
  conversationHistory,
  onDeleteHistory,
  onLoad,
  onSave,
}: Props) {
  return (
    <StyledHistoryHeader>
      {/* We prune storage automatically, so this is just for debugging. */}
      {(isDev || isClientDebug) && <StorageUsageWheel />}
      <StyledHistoryActions>
        <IconButton
          name="delete"
          iconSize="md"
          disabled={conversationHistory.length === 0}
          onClick={onDeleteHistory}
          label="Delete all"
        />
        <IconButton name="load" iconSize="md" onClick={onLoad} label="Load" />
        <IconButton name="save" iconSize="md" onClick={onSave} label="Save" />
      </StyledHistoryActions>
    </StyledHistoryHeader>
  );
}
