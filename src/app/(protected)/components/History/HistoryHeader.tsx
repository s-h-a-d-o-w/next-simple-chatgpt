import { styled } from "@/styled-system/jsx";
import { isDev, isClientDebug } from "@/lib/utils/consts";
import { StorageUsageWheel } from "./StorageUsageWheel";
import { IconButton } from "@/components/IconButton";
import {
  CURRENT_HISTORY_VERSION,
  historySerializer,
  useHistory,
} from "@/app/(protected)/hooks/useHistory";
import { saveJsonFile } from "./utils/saveJsonFile";
import { useCallback } from "react";
import { loadJsonFile } from "./utils/loadJsonFile";
import { isDeleteConfirmationOpenAtom } from "./atoms";
import { useSetAtom } from "jotai";

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

export function HistoryHeader() {
  const [conversationHistory, setConversationHistory] = useHistory();
  const setIsDeleteConfirmationOpen = useSetAtom(isDeleteConfirmationOpenAtom);

  const handleDeleteHistory = useCallback(() => {
    setIsDeleteConfirmationOpen(true);
  }, [setIsDeleteConfirmationOpen]);

  const handleLoadHistory = useCallback(async () => {
    try {
      setConversationHistory(historySerializer.parse(await loadJsonFile()));
    } catch {
      // TODO: user cancelled or picked nonsense. should probably show error.
    }
  }, [setConversationHistory]);

  const handleSaveHistory = useCallback(() => {
    saveJsonFile(
      {
        version: CURRENT_HISTORY_VERSION,
        history: conversationHistory,
      },
      `history-${new Date().toISOString().replaceAll(/[:.]/g, "-")}`,
    );
  }, [conversationHistory]);

  return (
    <StyledHistoryHeader>
      {/* We prune storage automatically, so this is just for debugging. */}
      {(isDev || isClientDebug) && <StorageUsageWheel />}
      <StyledHistoryActions>
        <IconButton
          name="delete"
          iconSize="md"
          disabled={conversationHistory.length === 0}
          onClick={handleDeleteHistory}
          label="Delete all"
        />
        <IconButton
          name="load"
          iconSize="md"
          onClick={handleLoadHistory}
          label="Load"
        />
        <IconButton
          name="save"
          iconSize="md"
          onClick={handleSaveHistory}
          label="Save"
        />
      </StyledHistoryActions>
    </StyledHistoryHeader>
  );
}
