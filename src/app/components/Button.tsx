import { styled } from "../../../styled-system/jsx";
import { SystemStyleObject } from "../../../styled-system/types";

const transition: SystemStyleObject = {
  transitionDuration: "0.15s",
  transitionTimingFunction: "ease-out",
};

export const Button = styled("button", {
  base: {
    backgroundColor: "blue.100",
    padding: "2rem 8rem",
    cursor: "pointer",
    border: "1px solid token(colors.blue.200)",

    ...transition,
    transitionProperty: "background-color",

    _hover: {
      backgroundColor: "blue.200",
    },

    _disabled: {
      backgroundColor: "gray.200",
      color: "gray.500",
      cursor: "default",
    },
  },
});
