import { auth } from "@/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { isTest } from "@/lib/utils/consts";

const whitelist = process.env["WHITELIST"]?.split(",");

export async function authGuard(doRedirect?: boolean) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  const isUserWhitelisted = session && whitelist?.includes(session.user.email);

  if ((session && isUserWhitelisted) || isTest) {
    return;
  }

  if (doRedirect) {
    redirect(session ? "/accessDenied" : "/login");
  } else {
    throw new Error(
      `Unauthorized${session && !isUserWhitelisted ? " (user not whitelisted)" : ""}`,
    );
  }
}
