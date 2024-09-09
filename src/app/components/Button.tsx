import { styled } from "../../../styled-system/jsx";

export const Button = styled("button", {
  base: {
    backgroundColor: "blue.100",
    borderRadius: "4rem",
    padding: "2rem 4rem",
    cursor: "pointer",

    _disabled: {
      backgroundColor: "gray.200",
      color: "gray.500",
    },
  },
});
