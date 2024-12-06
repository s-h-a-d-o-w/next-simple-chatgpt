import { ReactNode, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { styled } from "../../styled-system/jsx";
import { SystemStyleObject } from "../../styled-system/types";

type Props = {
  children: ReactNode;
  isOpen: boolean;
  onClose: () => void;

  className?: string;
  /**
   * Modals are wrapped in a form and can't be closed by clicking on the backdrop.
   **/
  isModal?: boolean;
  /**
   * Only applies to non-modal dialogs.
   **/
  showBackdrop?: boolean;
  /**
   * Prevents the native behavior of autofocusing the first input when opened.
   **/
  suppressNativeFocus?: boolean;
};

const dialogClosed: SystemStyleObject = {
  opacity: 0,
  transform: "translateY(10rem)",
  height: "calc(100% - 10rem)",
};
const dialogOpened: SystemStyleObject = {
  opacity: 1,
  transform: "translateY(0)",
  height: "100%",
};

const modalClosed: SystemStyleObject = {
  opacity: 0,
  transform: "translateY(10rem)",
};
const modalOpened: SystemStyleObject = {
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
    transitionProperty: "height,opacity,transform,display,overlay",
    ...transition,

    _backdrop: {
      ...backdropClosed,
      transitionProperty: "background-color,display,overlay",
      ...transition,
    },

    _open: {
      _backdrop: {
        ...backdropOpened,
      },
    },

    _starting: {
      _open: {
        _backdrop: {
          ...backdropClosed,
        },
      },
    },
  },

  variants: {
    isModal: {
      true: {
        margin: "auto",
        overflow: "visible",

        // Modals get more opinionated styling because unlike non-modal content, they will always look the same.
        backgroundColor: "amber.50",
        boxShadow: "lg",

        ...modalClosed,
        _open: {
          ...modalOpened,
        },
        _starting: {
          _open: {
            ...modalClosed,
          },
        },
      },
      false: {
        margin: 0,
        top: 0,
        width: "100%",
        backgroundColor: "transparent",

        ...dialogClosed,
        _open: {
          ...dialogOpened,
        },
        _starting: {
          _open: {
            ...dialogClosed,
          },
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

    ...backdropOpened,
  },
});

export function Dialog({
  children,
  className,
  isModal = true,
  isOpen,
  onClose,
  showBackdrop = true,
  suppressNativeFocus = false,
}: Props) {
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
      if (isModal) {
        dialogElement.showModal();
      } else {
        dialogElement.show();
      }

      if (suppressNativeFocus) {
        dialogElement.setAttribute("tabindex", "-1");
        dialogElement.focus();
      }
    } else {
      dialogElement.close();
    }
  }, [isModal, isOpen, suppressNativeFocus]);

  return portalRoot
    ? createPortal(
        <StyledDialog
          ref={dialogRef}
          onClose={onClose}
          className={className}
          isModal={isModal}
        >
          {!isModal && showBackdrop && <StyledBackdrop onClick={onClose} />}
          {isModal ? <form method="dialog">{children}</form> : children}
        </StyledDialog>,
        portalRoot,
      )
    : null;
}
