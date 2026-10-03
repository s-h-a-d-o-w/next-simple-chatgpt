import { config } from "@/config";
import { isReasoningEffort, type ReasoningEffort } from "@/lib/models";
import useLocalStorageState from "use-local-storage-state";
import { useEffect, useMemo } from "react";

export function useReasoningEffort() {
  const [storedReasoningEffort, setStoredReasoningEffort] =
    useLocalStorageState<ReasoningEffort>("reasoningEffort", {
      defaultValue: config.models.defaultReasoningEffort,
    });
  const reasoningEffort = useMemo<ReasoningEffort>(
    () =>
      isReasoningEffort(storedReasoningEffort)
        ? storedReasoningEffort
        : config.models.defaultReasoningEffort,
    [storedReasoningEffort],
  );

  // Replace possibly invalid effort with default.
  useEffect(() => {
    if (!isReasoningEffort(storedReasoningEffort)) {
      setStoredReasoningEffort(config.models.defaultReasoningEffort);
    }
  }, [storedReasoningEffort, setStoredReasoningEffort]);

  return {
    reasoningEffort,
    setReasoningEffort: setStoredReasoningEffort,
  } as const;
}
