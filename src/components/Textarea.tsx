import { styled } from "../../styled-system/jsx";

export const Textarea = styled("textarea", {
  base: {
    border: "1px solid black",
    padding: "4rem 8rem",

    _dark: {
      borderColor: "gray.50",
    },
  },
});
