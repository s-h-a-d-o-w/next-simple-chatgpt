import { Button } from "./Button";
import { Modal } from "./Modal";

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
    <Modal isOpen={isOpen} onClose={onClose}>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          gap: "8rem",

          padding: "32rem",
        }}
      >
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
      </div>
    </Modal>
  );
}
