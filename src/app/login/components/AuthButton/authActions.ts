"use server";

import { signIn as authSignIn, signOut as authSignOut } from "@/auth";

export async function signIn() {
  await authSignIn("github", { redirectTo: "/" });
}

export async function signOut() {
  await authSignOut();
}
