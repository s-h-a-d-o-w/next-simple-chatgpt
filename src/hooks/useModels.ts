"use client";

import type { Models } from "@/lib/server/models";
import { useQuery } from "@tanstack/react-query";

const MODELS_QUERY_KEY = ["models"] as const;
const MODELS_REFRESH_INTERVAL_MS = 60 * 60 * 1000; // 60 minutes

async function fetchModels() {
  const response = await fetch("/api/models");

  if (!response.ok) {
    throw new Error(`Failed to fetch models: ${response.status}`);
  }

  return response.json() as Promise<Models>;
}

export function useModels(initialModels: Models) {
  return useQuery({
    queryKey: MODELS_QUERY_KEY,
    queryFn: fetchModels,
    initialData: initialModels,
    refetchInterval: MODELS_REFRESH_INTERVAL_MS,
  }).data;
}
