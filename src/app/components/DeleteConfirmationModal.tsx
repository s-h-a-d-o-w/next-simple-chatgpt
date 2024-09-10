import { createPortal } from "react-dom";
import { Button } from "./Button";

export function DeleteConfirmationModal({
  onConfirm,
  onClose,
}: {
  onConfirm: () => void;
  onClose: () => void;
}) {
  return createPortal(
    <>
      <div
        style={{
          position: "fixed",
          top: 0,
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: "white",
          opacity: "0.5",
        }}
      />
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          top: 0,
          bottom: 0,
          left: 0,
          right: 0,

          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <div
          style={{
            padding: "16rem",
            border: "1px solid black",

            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            gap: "8rem",
          }}
        >
          <div>Are you sure?</div>
          <div style={{ display: "flex", gap: "8rem" }}>
            <Button
              onClick={(event) => {
                event.stopPropagation();
                onConfirm();
              }}
            >
              Yes
            </Button>
            <Button onClick={onClose}>No</Button>
          </div>
        </div>
      </div>
    </>,
    document.body,
  );
}
