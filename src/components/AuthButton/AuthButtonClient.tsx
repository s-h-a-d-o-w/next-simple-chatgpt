"use client";
// Runs on the client so that we can display a spinner while login/logout is being processed

import { IconButton } from "@/components/IconButton";
import { useState } from "react";
import Spinner from "@/components/Spinner";
import { authClient } from "@/lib/utils/authClient";
import { flushSync } from "react-dom";
import { css } from "@/styled-system/css";

export function AuthButtonClient({
  isSignedIn = false,
}: {
  isSignedIn?: boolean;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [errorText, setErrorText] = useState<string>();

  const handleSignIn = async () => {
    flushSync(() => {
      setIsLoading(true);
    });

    const { error } = await authClient.signIn.social({
      provider: "github",
      callbackURL: "/",
    });
    if (error) {
      console.error(error);
      setErrorText(
        "An error occurred while signing in. Please try again later.",
      );
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    // Is done locally => instant, no need to set isLoading
    await authClient.signOut();
    window.location.reload();
  };

  return isLoading ? (
    <Spinner />
  ) : errorText ? (
    <div className={css({ color: "red.500" })}>{errorText}</div>
  ) : isSignedIn ? (
    <IconButton
      name="logout"
      iconSize="md"
      label="Sign out"
      onClick={handleSignOut}
    />
  ) : (
    <IconButton
      name="github"
      iconSize="md"
      label="Sign in with GitHub"
      onClick={handleSignIn}
    />
  );
}
