import { reasoningEfforts, type ReasoningEffort } from "@/lib/models";
import { styled } from "@/styled-system/jsx";
import { useModelSelection } from "@/app/(protected)/hooks/useModelSelection";
import { useReasoningEffort } from "@/app/(protected)/hooks/useReasoningEffort";

const StyledSelect = styled("select", {
  base: {
    fontSize: "14rem",
    maxWidth: "70rem",
    padding: "4rem 8rem",
    border: "2rem solid token(colors.accent)",
    backgroundColor: "surface.field",
    cursor: "pointer",
    textOverflow: "ellipsis",

    _disabled: {
      cursor: "default",
      opacity: "0.5",
    },
  },
});

export function ReasoningEffortSelector() {
  const { modelConfig } = useModelSelection();
  const { reasoningEffort, setReasoningEffort } = useReasoningEffort();

  return (
    <StyledSelect
      aria-label="Reasoning effort"
      title="Reasoning effort"
      disabled={!modelConfig.supportsReasoning}
      value={reasoningEffort}
      onChange={(e) => setReasoningEffort(e.target.value as ReasoningEffort)}
    >
      {reasoningEfforts.map((effort) => (
        <option key={effort} value={effort}>
          {effort}
        </option>
      ))}
    </StyledSelect>
  );
}
