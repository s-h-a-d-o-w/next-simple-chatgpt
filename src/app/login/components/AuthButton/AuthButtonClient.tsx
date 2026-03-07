"use client";

import { useFormStatus } from "react-dom";
import { signIn, signOut } from "./authActions";

type ButtonProps = {
  isSignedIn?: boolean;
};

function SubmitButton({ isSignedIn }: Required<ButtonProps>) {
  const { pending } = useFormStatus();
  console.log(new Date().toISOString(), "pending", pending);
  return (
    <button
      type="submit"
      disabled={pending}
      className={`bg-${isSignedIn ? "red" : "blue"}-500 text-white px-4 py-2 rounded-md`}
    >
      {pending ? "Loading..." : isSignedIn ? "Sign out" : "Sign in"}
    </button>
  );
}

export function AuthButtonClient({ isSignedIn = false }: ButtonProps) {
  return (
    <form action={isSignedIn ? signOut : signIn}>
      <SubmitButton isSignedIn={isSignedIn} />
    </form>
  );
}
