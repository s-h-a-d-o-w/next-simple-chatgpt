import { NextResponse } from "next/server";
import { auth } from "./auth";

export default auth((request) => {
  return request.auth?.user
    ? NextResponse.next()
    : NextResponse.redirect(new URL("/login", request.url));
});

export const config = {
  matcher: "/",
};
