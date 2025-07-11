"use client";
// Runs on the client so that we can display a spinner while login/logout is being processed

import { IconButton } from "@/components/IconButton";
import { type ReactNode, useActionState } from "react";
import Spinner from "@/components/Spinner";
import { signIn, signOut } from "./authActions";

function PendingServerAction({ children }: { children: ReactNode }) {
  const [, , pending] = useActionState(signIn, undefined);

  return pending ? <Spinner /> : children;
}

export function AuthButtonClient({
  isSignedIn = false,
}: {
  isSignedIn?: boolean;
}) {
  const [, action] = useActionState(isSignedIn ? signOut : signIn, undefined);

  return (
    <form action={action}>
      <PendingServerAction>
        {isSignedIn ? (
          <IconButton name="logout" iconSize="md" label="Sign out" />
        ) : (
          <IconButton name="github" iconSize="md" label="Sign in with GitHub" />
        )}
      </PendingServerAction>
    </form>
  );
}
