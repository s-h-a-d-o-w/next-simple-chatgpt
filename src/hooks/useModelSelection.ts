import { config, models } from "@/config";
import { type ModelKey } from "@/config";
import useLocalStorageState from "use-local-storage-state";
import { useMemo, useEffect } from "react";

export function useModelSelection() {
  const [storedModel, setStoredModel] = useLocalStorageState<ModelKey>(
    "model",
    {
      defaultValue: config.models.default,
    },
  );
  const model = useMemo<ModelKey>(() => {
    return !(storedModel in models) ? config.models.default : storedModel;
  }, [storedModel]);

  // Sync possibly invalid model back to localStorage
  useEffect(() => {
    if (storedModel && !(storedModel in models)) {
      setStoredModel(config.models.default);
    }
  }, [storedModel, setStoredModel]);

  return [model, setStoredModel] as const;
}
