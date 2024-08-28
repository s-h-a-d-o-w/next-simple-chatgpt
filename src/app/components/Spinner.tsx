import { HTMLAttributes } from "react";
import { styled } from "../../../styled-system/jsx";

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
    border: "medium solid #f3f3f3",
    borderTop: "medium solid #3498db",
    borderRadius: "50%",
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
