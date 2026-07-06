"use client";

import { useSyncExternalStore } from "react";

export function ClientOnly({ children }: { children: React.ReactNode }) {
  const hasMounted = useSyncExternalStore(
    () => () => {
      /* empty */
    },
    () => true,
    () => false,
  );

  return hasMounted ? children : null;
}
