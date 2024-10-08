import { styled } from "../../styled-system/jsx";
import { SystemStyleObject } from "../../styled-system/types";

const transition: SystemStyleObject = {
  transitionDuration: "0.15s",
  transitionTimingFunction: "ease-out",
};

export const Button = styled("button", {
  base: {
    backgroundColor: "amber.800",
    color: "white",
    padding: "4rem 8rem 2rem 8rem",
    cursor: "pointer",
    fontSize: "md",

    ...transition,
    transitionProperty: "background-color,opacity",

    _hover: {
      backgroundColor: "amber.700",
    },

    _disabled: {
      backgroundColor: "gray.200",
      color: "gray.500",
      cursor: "default",

      _hover: {
        backgroundColor: "gray.200",
      },
    },
  },

  variants: {
    ghost: {
      true: {
        opacity: "0.5",
        _hover: {
          opacity: "1",
        },
      },
    },
    iconSize: {
      sm: {
        width: "sm",
        height: "sm",
        padding: "4rem",
      },
      md: {
        width: "md",
        height: "md",
        padding: "4rem",
      },
      xl: {
        width: "xl",
        height: "xl",
        padding: "8rem",
      },
    },
  },
});
