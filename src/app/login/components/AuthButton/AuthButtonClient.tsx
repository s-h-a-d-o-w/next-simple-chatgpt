"use client";
// Runs on the client so that we can display a spinner while login/logout is being processed

import { useFormState, useFormStatus } from "react-dom";
import { Button } from "../../../../components/Button";
import Spinner from "../../../../components/Spinner";
import { ReactNode } from "react";
import { signIn, signOut } from "./authActions";
import { FaGithub } from "react-icons/fa6";
import { IoLogOut } from "react-icons/io5";

function PendingServerAction({ children }: { children: ReactNode }) {
  const { pending } = useFormStatus();

  return pending ? <Spinner /> : children;
}

function SignInButton() {
  return (
    <div
      style={{
        display: "flex",
        gap: "5rem",
      }}
    >
      <FaGithub style={{ marginTop: "2rem" }} />
      Sign in with GitHub
    </div>
  );
}

export function AuthButtonClient({
  isSignedIn = false,
}: {
  isSignedIn?: boolean;
}) {
  const [, action] = useFormState(isSignedIn ? signOut : signIn, undefined);

  return (
    <form action={action} style={isSignedIn ? { lineHeight: 0 } : {}}>
      <PendingServerAction>
        <Button>
          {isSignedIn ? (
            <IoLogOut style={{ height: "21rem" }} />
          ) : (
            <SignInButton />
          )}
        </Button>
      </PendingServerAction>
    </form>
  );
}
