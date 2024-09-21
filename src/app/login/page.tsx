import { styled } from "../../../styled-system/jsx";
import { AuthButton } from "../components/AuthButton";

const StyledCenter = styled("main", {
  base: {
    position: "absolute",
    width: "100%",
    height: "100%",

    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
});

export default function Login() {
  return (
    <StyledCenter>
      <AuthButton />
    </StyledCenter>
  );
}
