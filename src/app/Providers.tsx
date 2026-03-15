"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { authClient } from "@/lib/utils/authClient";
import type { ReactNode } from "react";
import { useState } from "react";

type Props = {
  children: ReactNode;
};

export function Providers({ children }: Props) {
  // Possibly refresh session on the client. (Usage in RSC and API can't do that.)
  authClient.useSession();

  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
