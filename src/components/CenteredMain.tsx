import { styled } from "../../styled-system/jsx";

export const CenteredMain = styled("main", {
  base: {
    position: "absolute",
    width: "100%",
    height: "100%",

    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
});
