import { styled } from "../../../styled-system/jsx";

export const Button = styled("button", {
  base: {
    backgroundColor: "blue.100",
    padding: "2rem 8rem",
    cursor: "pointer",

    _disabled: {
      backgroundColor: "gray.200",
      color: "gray.500",
      cursor: "default",
    },
  },
});
