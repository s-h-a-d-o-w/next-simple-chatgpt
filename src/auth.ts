import { betterAuth, type BetterAuthOptions } from "better-auth";
import { isTest } from "@/lib/utils/consts";

const authConfig: BetterAuthOptions = isTest
  ? {
      baseURL: "http://localhost:3000",
      secret: "something long so that better-auth doesn't complain.",
      socialProviders: {
        github: {
          clientId: "testId",
          clientSecret: "testSecret",
        },
      },
    }
  : {
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
