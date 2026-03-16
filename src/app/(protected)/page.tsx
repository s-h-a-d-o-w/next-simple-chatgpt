import "@/styles/prism-theme.css";
import { fetchModels } from "@/lib/server/models";
import HomeClient from "./HomeClient";
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import { MODELS_QUERY_KEY } from "@/lib/utils/queryKeys";
import { ClientOnly } from "@/components/ClientOnly";

export default async function Home() {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: MODELS_QUERY_KEY,
    queryFn: fetchModels,
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      {/* Prevents state flickering due to local storage values loading. */}
      <ClientOnly>
        <HomeClient />
      </ClientOnly>
    </HydrationBoundary>
  );
}
