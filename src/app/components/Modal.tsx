import { createPortal } from "react-dom";
import { ReactNode, useEffect, useRef, useState } from "react";

type Props = {
  children: ReactNode;
  isOpen: boolean;
  onClose: () => void;
};

export function Modal({ children, isOpen, onClose }: Props) {
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
          <form method="dialog">{children}</form>
        </dialog>,
        portalRoot,
      )
    : null;
}
