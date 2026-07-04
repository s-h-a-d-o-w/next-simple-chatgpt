import { refreshSession } from "@/auth";
import { NextResponse, type NextRequest } from "next/server";
import { isDev } from "./lib/utils/consts";

export function proxy({ headers }: NextRequest) {
  const response = NextResponse.next();

  if (isDev) {
    console.log("refreshing session");
  }
  refreshSession({ headers, response });

  return response;
}

export const config = {
  matcher: "/",
};
