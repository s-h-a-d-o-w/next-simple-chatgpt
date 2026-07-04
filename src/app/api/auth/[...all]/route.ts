import { finishGitHubSignIn, signOut, startGitHubSignIn } from "@/auth";
import { NextResponse, type NextRequest } from "next/server";

export const GET = (request: NextRequest) => {
  const action = request.nextUrl.pathname.replace("/api/auth/", "");

  if (action === "sign-in") {
    return startGitHubSignIn(request);
  }

  if (action === "callback/github") {
    return finishGitHubSignIn(request);
  }

  if (action === "sign-out") {
    return signOut(request);
  }

  return NextResponse.json({ error: "Not found" }, { status: 404 });
};

export const POST = (request: NextRequest) => {
  const action = request.nextUrl.pathname.replace("/api/auth/", "");

  if (action === "sign-out") {
    return signOut(request);
  }

  return NextResponse.json({ error: "Not found" }, { status: 404 });
};
