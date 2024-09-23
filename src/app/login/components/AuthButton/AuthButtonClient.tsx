"use client";

import { useFormState, useFormStatus } from "react-dom";
import { Button } from "../../../../components/Button";
import Spinner from "../../../../components/Spinner";
import { ReactNode } from "react";
import { signIn, signOut } from "./authActions";

function PendingServerAction({ children }: { children: ReactNode }) {
  const { pending } = useFormStatus();

  return pending ? <Spinner /> : children;
}

export function AuthButtonClient({
  isSignedIn = false,
}: {
  isSignedIn?: boolean;
}) {
  const [, action] = useFormState(isSignedIn ? signOut : signIn, undefined);

  return (
    <form action={action}>
      <PendingServerAction>
        <Button>{isSignedIn ? "Sign out" : "Sign in"}</Button>
      </PendingServerAction>
    </form>
  );
}
