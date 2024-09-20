import { ReactNode, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { styled } from "../../../styled-system/jsx";
import { SystemStyleObject } from "../../../styled-system/types";

type Props = {
  children: ReactNode;
  isOpen: boolean;
  onClose: () => void;

  /**
   * Modals are wrapped in a form and can't be closed by clicking on the backdrop.
   **/
  isModal?: boolean;
};

const dialogClosed: SystemStyleObject = {
  // display: "none",
  opacity: 0,
  transform: "translateY(10rem)",
};
const dialogOpened: SystemStyleObject = {
  // display: "flex",
  opacity: 1,
  transform: "translateY(0)",
};

const backdropClosed: SystemStyleObject = {
  backgroundColor: "rgb(255 255 255 / 0%)",
};
const backdropOpened: SystemStyleObject = {
  backgroundColor: "rgb(255 255 255 / 70%)",
};

const transition: SystemStyleObject = {
  transitionDuration: "0.1s",
  transitionTimingFunction: "cubic-bezier(.79,0,.41,1.35)",
  transitionBehavior: "allow-discrete",
};

const StyledDialog = styled("dialog", {
  base: {
    // margin: "auto", // Can't be used because then free positioning via "fixed" within this container wouldn't work

    // These styles make it possible to freely position containers using fixed within the dialog.
    position: "fixed",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    width: "100%",
    height: "100%",
    maxWidth: "none",
    maxHeight: "none",
    backgroundColor: "transparent",

    ...dialogClosed,
    transitionProperty: "opacity,transform,display,overlay",
    ...transition,

    _backdrop: {
      ...backdropClosed,
      transitionProperty: "background-color,display,overlay",
      ...transition,
    },

    _open: {
      ...dialogOpened,

      _backdrop: {
        ...backdropOpened,
      },
    },

    _starting: {
      _open: {
        ...dialogClosed,

        _backdrop: {
          ...backdropClosed,
        },
      },
    },
  },
});

const StyledBackdrop = styled("div", {
  base: {
    position: "fixed",
    width: "100%",
    height: "100%",
    backgroundColor: "transparent",
  },
});

const StyledCentered = styled("div", {
  base: {
    height: "100%",

    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
});

const StyledForm = styled("form", {
  base: {
    backgroundColor: "amber.50",
    boxShadow: "lg",
  },
});

export function Modal({ children, isModal = true, isOpen, onClose }: Props) {
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
        <StyledDialog ref={dialogRef} onClose={onClose}>
          {/* Used instead of the native backdrop so that we don't have to use `stopPropagation` in all click handlers. Hence also a more transparent strategy. */}
          {!isModal && <StyledBackdrop onClick={onClose} />}
          <StyledCentered>
            {isModal ? (
              <StyledForm method="dialog">{children}</StyledForm>
            ) : (
              children
            )}
          </StyledCentered>
        </StyledDialog>,
        portalRoot,
      )
    : null;
}
