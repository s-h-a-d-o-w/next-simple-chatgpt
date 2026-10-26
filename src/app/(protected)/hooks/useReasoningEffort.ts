import { config } from "@/config";
import {
  isReasoningEffort,
  reasoningEfforts,
  type ModelKey,
  type ReasoningEffort,
} from "@/lib/models";
import useLocalStorageState from "use-local-storage-state";
import { useCallback, useMemo } from "react";
import { useModelSelection } from "./useModelSelection";

type ReasoningEffortByModel = Partial<Record<ModelKey, ReasoningEffort>>;

export function useReasoningEffort() {
  const { model, modelConfig } = useModelSelection();
  const [storedReasoningEfforts, setStoredReasoningEfforts] =
    useLocalStorageState<ReasoningEffortByModel>("reasoningEffortByModel", {
      defaultValue: {},
    });

  const availableReasoningEfforts = useMemo(
    () => modelConfig.supportedReasoningEfforts ?? reasoningEfforts,
    [modelConfig],
  );

  const reasoningEffort = useMemo<ReasoningEffort>(() => {
    const storedReasoningEffort = storedReasoningEfforts[model];

    return isReasoningEffort(storedReasoningEffort)
      ? storedReasoningEffort
      : config.models.defaultReasoningEffort;
  }, [storedReasoningEfforts, model]);

  const setReasoningEffort = useCallback(
    (effort: ReasoningEffort) => {
      setStoredReasoningEfforts((previous) => ({
        ...previous,
        [model]: effort,
      }));
    },
    [model, setStoredReasoningEfforts],
  );

  return {
    availableReasoningEfforts,
    reasoningEffort,
    setReasoningEffort,
  } as const;
}
