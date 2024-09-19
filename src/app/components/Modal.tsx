import { createPortal } from "react-dom";
import { ReactNode, useEffect, useRef, useState } from "react";
import { styled } from "../../../styled-system/jsx";
import { SystemStyleObject } from "../../../styled-system/types";

type Props = {
  children: ReactNode;
  isOpen: boolean;
  onClose: () => void;
};

const dialogClosed: SystemStyleObject = {
  opacity: 0,
  transform: "translateY(10rem)",
};
const dialogOpened: SystemStyleObject = {
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
    margin: "auto", // revert reset

    overflow: "visible",
    boxShadow: "rgb(38, 57, 77) 0px 20px 30px -10px",

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
        <StyledDialog ref={dialogRef} onClose={onClose}>
          <form method="dialog">{children}</form>
        </StyledDialog>,
        portalRoot,
      )
    : null;
}
