import { auth } from "@/auth";
import { AuthButtonClient } from "./AuthButtonClient";

export async function AuthButton() {
  const session = await auth();

  // auth return type is wrong, see https://github.com/nextauthjs/next-auth/issues/11934
  if (session !== null && "message" in session) {
    throw new Error(session.message as string);
  }

  return <AuthButtonClient isSignedIn={Boolean(session?.user)} />;
}
