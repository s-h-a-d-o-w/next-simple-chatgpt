import { betterAuth, type BetterAuthOptions } from "better-auth";

const authConfig: BetterAuthOptions = {
  baseURL: process.env["AUTH_URL"]!,
  secret: process.env["AUTH_SECRET"]!,
  socialProviders: {
    github: {
      clientId: process.env["AUTH_GITHUB_ID"]!,
      clientSecret: process.env["AUTH_GITHUB_SECRET"]!,
    },
  },
};

export const auth = betterAuth(authConfig);
