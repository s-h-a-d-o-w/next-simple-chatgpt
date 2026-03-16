"use client";

// See https://tanstack.com/query/latest/docs/framework/react/guides/advanced-ssr#server-components--nextjs-app-router
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { isServer } from "@/lib/utils/consts";
import { Provider as JotaiProvider } from "jotai";

type Props = {
  children: ReactNode;
};

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // "With SSR, we usually want to set some default staleTime
        // above 0 to avoid refetching immediately on the client" < We ignore that because we only refetch on an interval anyway.
        refetchOnWindowFocus: false,
        refetchOnMount: false,
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined;

function getQueryClient() {
  if (isServer) {
    // Server: always make a new query client
    return makeQueryClient();
  }

  // Browser: make a new query client if we don't already have one
  // This is very important, so we don't re-make a new client if React
  // suspends during the initial render. This may not be needed if we
  // have a suspense boundary BELOW the creation of the query client
  return (browserQueryClient ??= makeQueryClient());
}

export function Providers({ children }: Props) {
  return (
    <QueryClientProvider client={getQueryClient()}>
      {/* JotaiProvider needed to avoid multiple instances of the store, which happens after hot refresh and reloading the page. */}
      <JotaiProvider>{children}</JotaiProvider>
    </QueryClientProvider>
  );
}
