import { Dialog } from "@/components/Dialog";
import { Button } from "@/components/Button";
import { styled } from "@/styled-system/jsx";
import { useCallback } from "react";
import { isDeleteConfirmationOpenAtom } from "./atoms";
import { useAtom, useSetAtom } from "jotai";
import { activeHistoryEntryAtom } from "../../atoms";
import { useHistory } from "@/app/(protected)/hooks/useHistory";

const StyledButtonContainer = styled("div", {
  base: {
    display: "flex",
    gap: "16rem",
  },
});

const StyledDeleteConfirmationModal = styled("div", {
  base: {
    padding: "32rem",

    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    gap: "8rem",

    boxShadow: "token(colors.amber.900) 1px 1px 0px 0px",
    border: "1px solid token(colors.amber.900)",
    _dark: {
      boxShadow: "none",
      border: "none",
    },
  },
});

export function DeleteConfirmationModal() {
  const [isDeleteConfirmationOpen, setIsDeleteConfirmationOpen] = useAtom(
    isDeleteConfirmationOpenAtom,
  );
  const setActiveHistoryEntry = useSetAtom(activeHistoryEntryAtom);

  const [, setConversationHistory] = useHistory();

  const handleClose = useCallback(() => {
    setIsDeleteConfirmationOpen(false);
  }, [setIsDeleteConfirmationOpen]);

  const handleConfirm = useCallback(() => {
    setConversationHistory([]);
    setActiveHistoryEntry(undefined);
    setIsDeleteConfirmationOpen(false);
  }, [
    setConversationHistory,
    setActiveHistoryEntry,
    setIsDeleteConfirmationOpen,
  ]);

  return (
    <Dialog isOpen={isDeleteConfirmationOpen} onClose={handleClose}>
      <StyledDeleteConfirmationModal>
        Do you really want to delete your history?
        <StyledButtonContainer>
          <Button onClick={handleConfirm}>Yes</Button>
          <Button
            ref={(element) => {
              // Override browser defaulting to first focusable element
              setTimeout(() => element?.focus(), 0);
            }}
            onClick={handleClose}
          >
            No
          </Button>
        </StyledButtonContainer>
      </StyledDeleteConfirmationModal>
    </Dialog>
  );
}
