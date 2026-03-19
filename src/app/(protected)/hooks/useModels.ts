"use client";

import type { Models } from "@/lib/server/models";
import { useSuspenseQuery } from "@tanstack/react-query";
import { MODELS_QUERY_KEY } from "@/lib/utils/queryKeys";

const MODELS_REFRESH_INTERVAL_MS = 60 * 60 * 1000; // 60 minutes

async function fetchModels() {
  const response = await fetch("/api/models");

  if (!response.ok) {
    throw new Error(`Failed to fetch models: ${response.status}`);
  }

  return response.json() as Promise<Models>;
}

export function useModels() {
  return useSuspenseQuery({
    queryKey: MODELS_QUERY_KEY,
    queryFn: fetchModels,
    refetchInterval: MODELS_REFRESH_INTERVAL_MS,
  }).data;
}
