import { config } from "@/config";
import type { ModelKey, Models } from "@/lib/server/models";
import useLocalStorageState from "use-local-storage-state";
import { useMemo, useEffect } from "react";

export function useModelSelection(models: Models) {
  const [storedModel, setStoredModel] = useLocalStorageState<ModelKey>(
    "model",
    {
      defaultValue: config.models.default,
    },
  );
  const model = useMemo<ModelKey>(() => {
    return !(storedModel in models) ? config.models.default : storedModel;
  }, [storedModel, models]);

  // Replace possibly invalid model with default.
  useEffect(() => {
    if (!(storedModel in models)) {
      setStoredModel(config.models.default);
    }
  }, [storedModel, setStoredModel, models]);

  return [model, setStoredModel] as const;
}
