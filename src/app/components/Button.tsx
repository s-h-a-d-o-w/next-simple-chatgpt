import { styled } from "../../../styled-system/jsx";
import { SystemStyleObject } from "../../../styled-system/types";

const transition: SystemStyleObject = {
  transitionDuration: "0.15s",
  transitionTimingFunction: "ease-out",
};

export const Button = styled("button", {
  base: {
    backgroundColor: "amber.800",
    color: "white",
    padding: "2rem 8rem",
    cursor: "pointer",

    ...transition,
    transitionProperty: "background-color",

    _hover: {
      backgroundColor: "amber.700",
    },

    _disabled: {
      backgroundColor: "gray.200",
      color: "gray.500",
      cursor: "default",
    },
  },
});
