import { styled } from "../../styled-system/jsx";

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

    transitionDuration: "0.15s",
    transitionTimingFunction: "ease-out",
    transitionProperty: "background-color,opacity",

    _hover: {
      backgroundColor: "amber.700",
      _dark: {
        backgroundColor: "brand.100",
      },
    },

    _disabled: {
      backgroundColor: "stone.200",
      color: "stone.500",
      cursor: "default",
      _dark: {
        backgroundColor: "gray.200",
        color: "gray.500",
      },

      _hover: {
        backgroundColor: "stone.200",
        _dark: {
          backgroundColor: "gray.200",
        },
      },
    },
  },

  variants: {
    variant: {
      ghost: {
        true: {
          opacity: "0.5",
          _hover: {
            opacity: "1",
          },
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
