import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import { isTest } from "@/utils/consts";

const whitelist = process.env["WHITELIST"]?.split(",");

const trustHost = isTest ? { trustHost: true } : {};

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...trustHost,
  secret: process.env["AUTH_SECRET"],
  providers: !isTest
    ? [GitHub]
    : [
        {
          id: "test",
          name: "Test",
          type: "credentials",
          credentials: {},
          authorize() {
            return {
              id: "test-user",
              email: "test@example.com",
              name: "Test User",
            };
          },
        },
      ],
  callbacks: {
    signIn({ user }) {
      return isTest || Boolean(user?.email && whitelist?.includes(user.email));
    },
  },
  pages: {
    error: "/accessDenied",
  },
});
