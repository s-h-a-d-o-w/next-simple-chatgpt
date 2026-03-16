import { betterAuth, type BetterAuthOptions } from "better-auth";
import { isTest } from "@/lib/utils/consts";

const authConfig: BetterAuthOptions = {
  baseURL: isTest ? "http://localhost:3000" : process.env["AUTH_URL"]!,
  secret: isTest
    ? "something long so that better-auth doesn't complain."
    : process.env["AUTH_SECRET"]!,
  socialProviders: {
    github: {
      clientId: process.env["AUTH_GITHUB_ID"]!,
      clientSecret: process.env["AUTH_GITHUB_SECRET"]!,
    },
  },
};

export const auth = betterAuth(authConfig);
