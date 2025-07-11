import Link from "next/link";
import { styled } from "../../../styled-system/jsx";
import { AuthButton } from "./components/AuthButton";
import { CenteredMain } from "@/components/CenteredMain";

const StyledMessage = styled("div", {
  base: {
    width: "80%",
    maxWidth: "400rem",
    display: "flex",
    flexDirection: "column",
    gap: "24rem",
  },
});

export default function Login() {
  return (
    <CenteredMain>
      <StyledMessage>
        <h1>This is a private app.</h1>
        <p>
          If you aren&apos;t on the whitelist, you will not be able to sign in!
          At the moment, I recommend everybody run their own instance of this -
          see{" "}
          <Link href="https://github.com/s-h-a-d-o-w/next-simple-chatgpt">
            README
          </Link>
          .
        </p>
        <AuthButton />
      </StyledMessage>
    </CenteredMain>
  );
}
