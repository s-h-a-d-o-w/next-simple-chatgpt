import { config } from "@/config";
import type { ModelKey } from "@/lib/server/models";
import useLocalStorageState from "use-local-storage-state";
import { useMemo, useEffect } from "react";
import { useModels } from "./useModels";

export function useModelSelection() {
  const models = useModels();
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

  return {
    model,
    modelConfig: models[model],
    setModel: setStoredModel,
  } as const;
}
