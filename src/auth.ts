import { betterAuth, type BetterAuthOptions } from "better-auth";
import { isTest } from "@/lib/utils/consts";

const authConfig = (
  isTest
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
        // See https://better-auth.com/docs/concepts/session-management#basic-stateless-setup
        session: {
          cookieCache: {
            enabled: true,
            maxAge: 7 * 24 * 60 * 60, // 1 year
            strategy: "jwe",
            refreshCache: true, // Enable stateless refresh
          },
        },
        account: {
          storeStateStrategy: "cookie",
          storeAccountCookie: true,
        },
      }
) satisfies BetterAuthOptions;

export const auth = betterAuth(authConfig);
