import { auth } from "@/auth";
import { AuthButtonClient } from "./AuthButtonClient";

export async function AuthButton() {
  const session = await auth();
  return <AuthButtonClient isSignedIn={Boolean(session?.user)} />;
}
