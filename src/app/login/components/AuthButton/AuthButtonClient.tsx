"use client";
// Runs on the client so that we can display a spinner while login/logout is being processed

import { IconButton } from "@/components/IconButton";
import { useCallback, useRef, useState } from "react";
import type { SubmitEvent } from "react";
import Spinner from "@/components/Spinner";
import { signIn, signOut } from "./authActions";

export function AuthButtonClient({
  isSignedIn = false,
}: {
  isSignedIn?: boolean;
}) {
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const hasSubmittedRef = useRef(false);
  const action = isSignedIn ? signOut : signIn;

  const handleSubmit = useCallback((event: SubmitEvent) => {
    if (hasSubmittedRef.current) {
      event.preventDefault();
      return;
    }

    hasSubmittedRef.current = true;
    setHasSubmitted(true);
  }, []);

  return (
    <form action={action} onSubmit={handleSubmit}>
      {hasSubmitted ? (
        <Spinner />
      ) : isSignedIn ? (
        <IconButton name="logout" iconSize="md" label="Sign out" />
      ) : (
        <IconButton name="github" iconSize="md" label="Sign in with GitHub" />
      )}
    </form>
  );
}
