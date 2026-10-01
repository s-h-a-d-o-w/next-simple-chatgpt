import { styled } from "@/styled-system/jsx";

export const Button = styled("button", {
  base: {
    padding: "4rem 8rem 2rem 8rem",
    cursor: "pointer",
    fontSize: "md",

    transitionDuration: "0.15s",
    transitionTimingFunction: "ease-out",
    transitionProperty: "background-color,opacity",

    backgroundColor: "accent",
    color: "accent.fg",
    _hover: {
      backgroundColor: "accent.hover",
    },

    _disabled: {
      cursor: "default",

      backgroundColor: "accent.disabled",
      color: "text.disabled",
      _hover: {
        backgroundColor: "accent.disabled",
        color: "text.disabled",
      },
    },
  },

  variants: {
    variant: {
      ghost: {
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
