import { IconButton } from "@/components/IconButton";
import { ModelSelector } from "./ModelSelector";
import { ReasoningEffortSelector } from "./ReasoningEffortSelector";
import { ThemeToggle } from "./ThemeToggle";
import { memo, useCallback } from "react";
import { v4 as uuidv4 } from "uuid";
import {
  promptFilesAtom,
  chatStartTimeAtom,
  isHistoryOpenAtom,
  sessionIdAtom,
} from "@/app/(protected)/atoms";
import { useSetAtom } from "jotai";
import { styled } from "@/styled-system/jsx";
import { AuthButtonClient } from "@/components/AuthButton/AuthButtonClient";

type Props = {
  disabledHistoryActions: boolean;
  hasFilesInChat: boolean;
};

const StyledActions = styled("div", {
  base: {
    padding: "12rem",

    display: "flex",
    flexWrap: "wrap",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: "8rem",
  },
});

const StyledButtonGroup = styled("div", {
  base: {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "flex-end",
    gap: "8rem",
  },
});

export const TopBar = memo(function TopBar({
  disabledHistoryActions,
  hasFilesInChat,
}: Props) {
  const setSessionId = useSetAtom(sessionIdAtom);
  const setFiles = useSetAtom(promptFilesAtom);
  const setIsHistoryOpen = useSetAtom(isHistoryOpenAtom);
  const setStartTime = useSetAtom(chatStartTimeAtom);

  const handleShowHistory = useCallback(() => {
    setIsHistoryOpen(true);
  }, [setIsHistoryOpen]);

  const handleReset = useCallback(() => {
    setSessionId(uuidv4());
    setFiles([]);
    setStartTime(undefined);
  }, [setSessionId, setFiles, setStartTime]);

  return (
    <StyledActions>
      <ReasoningEffortSelector />
      <ModelSelector showAttachmentModelsOnly={hasFilesInChat} />
      <StyledButtonGroup>
        <IconButton
          name="reset"
          iconSize="md"
          onClick={handleReset}
          label="Reset"
        />
        <IconButton
          name="history"
          iconSize="md"
          disabled={disabledHistoryActions}
          onClick={handleShowHistory}
          label="History"
        />
        <AuthButtonClient isSignedIn />
        <ThemeToggle />
      </StyledButtonGroup>
    </StyledActions>
  );
});
