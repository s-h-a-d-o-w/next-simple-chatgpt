import { styled } from "../../styled-system/jsx";
import { SystemStyleObject } from "../../styled-system/types";

const transition: SystemStyleObject = {
  transitionDuration: "0.15s",
  transitionTimingFunction: "ease-out",
};

export const Button = styled("button", {
  base: {
    padding: "4rem 8rem 2rem 8rem",
    cursor: "pointer",
    fontSize: "md",

    backgroundColor: "amber.800",
    color: "white",
    _dark: {
      backgroundColor: "brand.500",
      color: "white",
    },

    ...transition,
    transitionProperty: "background-color,opacity",

    _hover: {
      backgroundColor: "amber.700",
      _dark: {
        backgroundColor: "brand.100",
      },
    },

    _disabled: {
      backgroundColor: "gray.200",
      color: "gray.500",
      cursor: "default",

      _hover: {
        backgroundColor: "gray.200",
        _dark: {
          backgroundColor: "gray.200",
        },
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
        height: "sm",
        padding: "4rem",
      },
      md: {
        base: {
          height: "lg",
          padding: "8rem",
        },
        xl: {
          height: "md",
          padding: "6rem",
        },
      },
      xl: {
        height: "xl",
        padding: "8rem",
      },
    },
  },
});
