"use client";
// Runs on the client so that we can display a spinner while login/logout is being processed

import { IconButton } from "@/components/IconButton";
import { useState } from "react";
import Spinner from "@/components/Spinner";
import { flushSync } from "react-dom";

const handleSignOut = async () => {
  await fetch("/api/auth/sign-out", { method: "POST" });
  window.location.reload();
};

export function AuthButtonClient({
  isSignedIn = false,
}: {
  isSignedIn?: boolean;
}) {
  const [isLoading, setIsLoading] = useState(false);

  const handleSignIn = () => {
    flushSync(() => {
      setIsLoading(true);
    });

    window.location.href = "/api/auth/sign-in?callbackURL=/";
  };

  return isLoading ? (
    <Spinner />
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
