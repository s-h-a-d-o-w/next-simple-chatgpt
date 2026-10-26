import { config } from "@/config";
import {
  getAvailableReasoningEfforts,
  isReasoningEffort,
  reasoningEfforts,
  type ModelKey,
  type ReasoningEffort,
} from "@/lib/models";
import useLocalStorageState from "use-local-storage-state";
import { useCallback, useMemo } from "react";
import { useModelSelection } from "./useModelSelection";

type ReasoningEffortByModel = Partial<Record<ModelKey, ReasoningEffort>>;

function getClosestEffort(
  target: ReasoningEffort,
  available: readonly ReasoningEffort[],
) {
  const targetIndex = reasoningEfforts.indexOf(target);

  return available.reduce((closest, effort) =>
    Math.abs(reasoningEfforts.indexOf(effort) - targetIndex) <
    Math.abs(reasoningEfforts.indexOf(closest) - targetIndex)
      ? effort
      : closest,
  );
}

export function useReasoningEffort() {
  const { model, modelConfig } = useModelSelection();
  const [storedReasoningEfforts, setStoredReasoningEfforts] =
    useLocalStorageState<ReasoningEffortByModel>("reasoningEffortByModel", {
      defaultValue: {},
    });

  const availableReasoningEfforts = useMemo(
    () => getAvailableReasoningEfforts(modelConfig),
    [modelConfig],
  );

  const reasoningEffort = useMemo<ReasoningEffort>(() => {
    const storedReasoningEffort = storedReasoningEfforts[model];
    const preferredReasoningEffort = isReasoningEffort(storedReasoningEffort)
      ? storedReasoningEffort
      : config.models.defaultReasoningEffort;

    return availableReasoningEfforts.length > 0
      ? getClosestEffort(preferredReasoningEffort, availableReasoningEfforts)
      : preferredReasoningEffort;
  }, [storedReasoningEfforts, model, availableReasoningEfforts]);

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
