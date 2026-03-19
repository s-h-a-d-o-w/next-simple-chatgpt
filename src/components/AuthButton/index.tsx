import { auth } from "@/auth";
import { AuthButtonClient } from "./AuthButtonClient";
import { headers } from "next/headers";

export async function AuthButton() {
  const session = await auth.api.getSession({ headers: await headers() });

  return <AuthButtonClient isSignedIn={Boolean(session)} />;
}
