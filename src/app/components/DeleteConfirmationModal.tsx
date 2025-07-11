import { Dialog } from "@/components/Dialog";
import { Button } from "@/components/Button";
import { styled } from "../../../styled-system/jsx";

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

export function DeleteConfirmationModal({
  isOpen,
  onConfirm,
  onClose,
}: {
  isOpen: boolean;
  onConfirm: () => void;
  onClose: () => void;
}) {
  return (
    <Dialog isOpen={isOpen} onClose={onClose}>
      <StyledDeleteConfirmationModal>
        Do you really want to delete your history?
        <StyledButtonContainer>
          <Button onClick={onConfirm}>Yes</Button>
          <Button
            ref={(element) => {
              // Override browser defaulting to first focusable element
              setTimeout(() => element?.focus(), 0);
            }}
            onClick={onClose}
          >
            No
          </Button>
        </StyledButtonContainer>
      </StyledDeleteConfirmationModal>
    </Dialog>
  );
}
