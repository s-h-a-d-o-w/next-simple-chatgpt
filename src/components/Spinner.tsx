import { HTMLAttributes } from "react";
import { styled } from "../../styled-system/jsx";

const SpinnerContainer = styled("div", {
  base: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    width: "24rem",
    height: "24rem",
  },
});

const SpinnerImplementation = styled("div", {
  base: {
    border: "medium solid token(colors.amber.300)",
    borderTop: "medium solid token(colors.amber.800) !important",
    borderRadius: "50% !important",
    width: "100%",
    height: "100%",
    animation: "spin 1s linear infinite",
  },
});

function Spinner(props: HTMLAttributes<HTMLDivElement>) {
  return (
    <SpinnerContainer {...props}>
      <SpinnerImplementation />
    </SpinnerContainer>
  );
}

export default Spinner;
