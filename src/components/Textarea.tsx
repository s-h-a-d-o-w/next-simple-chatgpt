import { styled } from "../../styled-system/jsx";

export const Textarea = styled("textarea", {
  base: {
    // border: "1px solid black",
    // border: "2rem solid token(colors.amber.800)",
    borderLeftWidth: "4rem",
    borderColor: "amber.800",
    padding: "4rem 8rem",
    backgroundColor: "amber.100",

    _dark: {
      backgroundColor: "gray.700",
      borderColor: "brand.500",
    },
  },
});
