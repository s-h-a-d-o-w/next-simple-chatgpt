import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";

const whitelist = process.env.WHITELIST?.split(",");

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [GitHub],
  callbacks: {
    signIn({ user }) {
      return Boolean(user?.email && whitelist?.includes(user.email));
    },
  },
  pages: {
    error: "/accessDenied",
  },
});
