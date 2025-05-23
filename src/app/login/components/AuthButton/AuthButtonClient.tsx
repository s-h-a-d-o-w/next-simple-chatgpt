"use client";
// Runs on the client so that we can display a spinner while login/logout is being processed

import { IconButton } from "@/components/IconButton";
import { ReactNode, useActionState } from "react";
import { FaGithub } from "react-icons/fa6";
import { Button } from "../../../../components/Button";
import Spinner from "../../../../components/Spinner";
import { signIn, signOut } from "./authActions";

function PendingServerAction({ children }: { children: ReactNode }) {
  const [, , pending] = useActionState(signIn, undefined);

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
  const [, action] = useActionState(isSignedIn ? signOut : signIn, undefined);

  return (
    <form action={action} style={isSignedIn ? { lineHeight: 0 } : {}}>
      <PendingServerAction>
        {isSignedIn ? (
          <IconButton name="logout" iconSize="md" label="Sign out" />
        ) : (
          <Button>
            <SignInButton />
          </Button>
        )}
      </PendingServerAction>
    </form>
  );
}
