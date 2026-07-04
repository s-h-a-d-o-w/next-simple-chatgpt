import { getSession } from "@/auth";
import { AuthButtonClient } from "./AuthButtonClient";
import { headers } from "next/headers";

export async function AuthButton() {
  const session = getSession({ headers: await headers() });

  return <AuthButtonClient isSignedIn={Boolean(session)} />;
}
