import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { z } from "zod";
import { isTest } from "@/lib/utils/consts";
import { NextResponse, type NextRequest } from "next/server";

const GITHUB_AUTHORIZE_URL = "https://github.com/login/oauth/authorize";
const GITHUB_TOKEN_URL = "https://github.com/login/oauth/access_token";
const GITHUB_USER_URL = "https://api.github.com/user";
const SESSION_COOKIE = "auth-session";
const STATE_COOKIE = "auth-state";
const SESSION_MAX_AGE_SECONDS = 365 * 24 * 60 * 60; // 1 year
const STATE_MAX_AGE_SECONDS = 10 * 60;

const sessionSchema = z.object({
  expiresAt: z.number(),
  user: z.object({
    email: z.email(),
    githubId: z.number(),
    image: z.string().nullable(),
    login: z.string(),
    name: z.string().nullable(),
  }),
});

const stateSchema = z.object({
  callbackPath: z.string(),
  state: z.string(),
});

const tokenResponseSchema = z.object({
  access_token: z.string(),
});

const githubUserSchema = z.object({
  avatar_url: z.string().nullable(),
  email: z.email().nullable(),
  id: z.number(),
  login: z.string(),
  name: z.string().nullable(),
});

type Session = z.infer<typeof sessionSchema>;

const getRequiredEnv = (name: string) => {
  if (isTest) {
    return `test-${name}`;
  }

  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }

  return value;
};

const encode = (value: string) => Buffer.from(value).toString("base64url");

const decode = (value: string) => Buffer.from(value, "base64url").toString("utf8");

const sign = (value: string) =>
  createHmac("sha256", getRequiredEnv("AUTH_SECRET")).update(value).digest("base64url");

const createSignedValue = (value: unknown) => {
  const payload = encode(JSON.stringify(value));

  return `${payload}.${sign(payload)}`;
};

const verifySignedValue = <Schema extends z.ZodType>(value: string, schema: Schema) => {
  const [payload, signature] = value.split(".");

  if (!payload || !signature) {
    return undefined;
  }

  const expectedSignature = sign(payload);
  const signatureBuffer = Buffer.from(signature);
  const expectedSignatureBuffer = Buffer.from(expectedSignature);

  if (
    signatureBuffer.length !== expectedSignatureBuffer.length ||
    !timingSafeEqual(signatureBuffer, expectedSignatureBuffer)
  ) {
    return undefined;
  }

  try {
    const parsedValue = schema.safeParse(JSON.parse(decode(payload)));

    return parsedValue.success ? parsedValue.data : undefined;
  } catch {
    return undefined;
  }
};

const getCookie = (headers: Headers, name: string) =>
  headers
    .get("cookie")
    ?.split(";")
    .map((cookie) => cookie.trim())
    .find((cookie) => cookie.startsWith(`${name}=`))
    ?.slice(name.length + 1) ?? undefined;

const isSecureCookie = () => process.env["NODE_ENV"] === "production";

const getBaseUrl = (request: NextRequest) =>
  process.env["AUTH_URL"] ? new URL(process.env["AUTH_URL"]).origin : request.url;

const getAuthUrl = (request: NextRequest) =>
  process.env["AUTH_URL"] ??
  new URL("/api/auth", getBaseUrl(request)).toString().replace(/\/$/u, "");

const setSessionCookie = (response: NextResponse, session: Session) => {
  response.cookies.set(SESSION_COOKIE, createSignedValue(session), {
    httpOnly: true,
    maxAge: SESSION_MAX_AGE_SECONDS,
    path: "/",
    sameSite: "lax",
    secure: isSecureCookie(),
  });
};

export const getSession = ({ headers }: { headers: Headers }) => {
  const cookie = getCookie(headers, SESSION_COOKIE);

  if (!cookie) {
    return undefined;
  }

  const session = verifySignedValue(cookie, sessionSchema);

  if (!session || session.expiresAt < Date.now()) {
    return undefined;
  }

  return session satisfies Session;
};

export const refreshSession = ({
  headers,
  response,
}: {
  headers: Headers;
  response: NextResponse;
}) => {
  const session = getSession({ headers });

  if (!session) {
    return undefined;
  }

  const refreshedSession = {
    ...session,
    expiresAt: Date.now() + SESSION_MAX_AGE_SECONDS * 1000,
  } satisfies Session;

  setSessionCookie(response, refreshedSession);

  return refreshedSession;
};

const getGitHubAccessToken = async (request: NextRequest, code: string) => {
  const response = await fetch(GITHUB_TOKEN_URL, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      client_id: getRequiredEnv("AUTH_GITHUB_ID"),
      client_secret: getRequiredEnv("AUTH_GITHUB_SECRET"),
      code,
      redirect_uri: `${getAuthUrl(request)}/callback/github`,
    }),
  });

  const parsedResponse = tokenResponseSchema.safeParse(await response.json());

  if (!response.ok || !parsedResponse.success) {
    throw new Error("Failed to exchange GitHub OAuth code");
  }

  return parsedResponse.data.access_token;
};

const getGitHubUser = async (accessToken: string) => {
  const response = await fetch(GITHUB_USER_URL, {
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${accessToken}`,
    },
  });

  const parsedResponse = githubUserSchema.safeParse(await response.json());

  if (!response.ok || !parsedResponse.success) {
    throw new Error("Failed to fetch GitHub user");
  }

  return parsedResponse.data;
};

const redirectToLogin = (request: NextRequest) =>
  NextResponse.redirect(new URL("/login", getBaseUrl(request)));

const clearCookie = (response: NextResponse, name: string, path: string) => {
  response.cookies.set(name, "", {
    httpOnly: true,
    maxAge: 0,
    path,
    sameSite: "lax",
    secure: isSecureCookie(),
  });
};

const deleteAuthCookies = (response: NextResponse) => {
  clearCookie(response, SESSION_COOKIE, "/");
  clearCookie(response, STATE_COOKIE, "/api/auth");
};

export const startGitHubSignIn = (request: NextRequest) => {
  const state = randomBytes(32).toString("base64url");
  const authBaseUrl = getAuthUrl(request);
  const url = new URL(GITHUB_AUTHORIZE_URL);

  url.searchParams.set("client_id", getRequiredEnv("AUTH_GITHUB_ID"));
  url.searchParams.set("redirect_uri", `${authBaseUrl}/callback/github`);
  url.searchParams.set("scope", "read:user user:email");
  url.searchParams.set("state", state);

  const response = NextResponse.redirect(url);

  response.cookies.set(
    STATE_COOKIE,
    createSignedValue({
      callbackPath: request.nextUrl.searchParams.get("callbackURL"),
      state,
    }),
    {
      httpOnly: true,
      maxAge: STATE_MAX_AGE_SECONDS,
      path: "/api/auth",
      sameSite: "lax",
      secure: isSecureCookie(),
    },
  );

  return response;
};

export const finishGitHubSignIn = async (request: NextRequest) => {
  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");
  const stateCookie = getCookie(request.headers, STATE_COOKIE);
  const storedState = stateCookie ? verifySignedValue(stateCookie, stateSchema) : undefined;

  if (!code || !state || !storedState || storedState.state !== state) {
    return redirectToLogin(request);
  }

  try {
    const accessToken = await getGitHubAccessToken(request, code);
    const githubUser = await getGitHubUser(accessToken);
    const { email } = githubUser;

    if (!email) {
      return redirectToLogin(request);
    }

    const response = NextResponse.redirect(new URL(storedState.callbackPath, getBaseUrl(request)));

    clearCookie(response, STATE_COOKIE, "/api/auth");
    setSessionCookie(response, {
      expiresAt: Date.now() + SESSION_MAX_AGE_SECONDS * 1000,
      user: {
        email,
        githubId: githubUser.id,
        image: githubUser.avatar_url,
        login: githubUser.login,
        name: githubUser.name,
      },
    });

    return response;
  } catch (error) {
    console.error(error);

    return redirectToLogin(request);
  }
};

export const signOut = (request: NextRequest) => {
  const response = NextResponse.redirect(new URL("/login", getBaseUrl(request)));

  deleteAuthCookies(response);

  return response;
};
