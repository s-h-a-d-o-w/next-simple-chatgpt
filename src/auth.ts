import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";

const whitelist = process.env["WHITELIST"]?.split(",");

export const isTest = Boolean(process.env["CI"]);
const trustHost = isTest ? { trustHost: true } : {};

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...trustHost,
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
