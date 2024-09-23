import { Dialog } from "@/components/Dialog";
import { Button } from "@/components/Button";
import { styled } from "../../../styled-system/jsx";

const StyledDeleteConfirmationModal = styled("div", {
  base: {
    padding: "32rem",

    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    gap: "8rem",
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
        <div>Do you really want to delete your history?</div>
        <div style={{ display: "flex", gap: "16rem" }}>
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
        </div>
      </StyledDeleteConfirmationModal>
    </Dialog>
  );
}
