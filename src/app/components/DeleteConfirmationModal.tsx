import { createPortal } from "react-dom";
import { Button } from "./Button";
import { useEffect, useRef, useState } from "react";

export function DeleteConfirmationModal({
  isOpen,
  onConfirm,
  onClose,
}: {
  isOpen: boolean;
  onConfirm: () => void;
  onClose: () => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [portalRoot, setPortalRoot] = useState<HTMLElement>();

  useEffect(() => {
    if (document) {
      setPortalRoot(document.body);
    }
  }, []);

  useEffect(() => {
    const dialogElement = dialogRef.current;
    if (!dialogElement) {
      return;
    }

    if (isOpen) {
      dialogElement.showModal();
    } else {
      dialogElement.close();
    }
  }, [isOpen]);

  return portalRoot
    ? createPortal(
        <dialog ref={dialogRef} onClose={onClose} style={{ margin: "auto" }}>
          <form method="dialog">
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
          </form>
        </dialog>,
        portalRoot,
      )
    : null;
}
