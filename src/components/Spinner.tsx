import { HTMLAttributes } from "react";
import { styled } from "../../styled-system/jsx";

const SpinnerContainer = styled("div", {
  base: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    width: "24rem",
    height: "24rem",
    flexShrink: 0,
  },
});

const SpinnerImplementation = styled("div", {
  base: {
    borderRadius: "50% !important",
    width: "100%",
    height: "100%",
    animation: "spin 1s linear infinite",

    border: "medium solid token(colors.amber.300)",
    borderTop: "medium solid token(colors.amber.800)",
    _dark: {
      border: "medium solid token(colors.brand.100)",
      borderTop: "medium solid white",
    },
  },
});

function Spinner(props: HTMLAttributes<HTMLDivElement>) {
  return (
    <SpinnerContainer {...props} role="status" aria-label="Loading...">
      <SpinnerImplementation />
    </SpinnerContainer>
  );
}

export default Spinner;
