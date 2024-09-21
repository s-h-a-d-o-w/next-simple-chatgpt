import { styled } from "../../../styled-system/jsx";

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
      Access denied. You are not on our list of permitted users.
    </StyledCenter>
  );
}
