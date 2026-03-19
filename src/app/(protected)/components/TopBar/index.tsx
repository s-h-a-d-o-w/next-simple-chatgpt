import { IconButton } from "@/components/IconButton";
import { isDev } from "@/lib/utils/consts";
import { ModelSelector } from "./ModelSelector";
import { ThemeToggle } from "./ThemeToggle";
import { memo, useCallback } from "react";
import { HmrTimestamp } from "./HmrTimestamp";
import {
  promptFilesAtom,
  chatIdAtom,
  chatStartTimeAtom,
  isHistoryOpenAtom,
} from "@/app/(protected)/atoms";
import { useSetAtom } from "jotai";
import { styled } from "@/styled-system/jsx";
import { css } from "@/styled-system/css";
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

export const TopBar = memo(function TopBar({
  disabledHistoryActions,
  hasFilesInChat,
}: Props) {
  const setChatId = useSetAtom(chatIdAtom);
  const setFiles = useSetAtom(promptFilesAtom);
  const setIsHistoryOpen = useSetAtom(isHistoryOpenAtom);
  const setStartTime = useSetAtom(chatStartTimeAtom);

  const handleShowHistory = useCallback(() => {
    setIsHistoryOpen(true);
  }, [setIsHistoryOpen]);

  const handleReset = useCallback(() => {
    setChatId((currentChatId) => currentChatId + 1);
    setFiles([]);
    setStartTime(undefined);
  }, [setChatId, setFiles, setStartTime]);

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
