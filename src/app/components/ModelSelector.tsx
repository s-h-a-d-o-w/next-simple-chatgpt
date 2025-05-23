import { models } from "@/utils/consts";
import { styled } from "../../../styled-system/jsx";

const StyledSelect = styled("select", {
  base: {
    padding: "4rem 8rem",
    border: "1px solid black",
    backgroundColor: "white",
    cursor: "pointer",
    maxWidth: "100%",
    textOverflow: "ellipsis",
  },
});

type Props = {
  value: string;
  onChange: (value: string) => void;
};

export function ModelSelector({ value, onChange }: Props) {
  return (
    <StyledSelect value={value} onChange={(e) => onChange(e.target.value)}>
      {Object.entries(models).map(([id, { name, input, output }]) => (
        <option key={id} value={id}>
          {name} (in: ${input}/out: ${output} per 1Mt)
        </option>
      ))}
    </StyledSelect>
  );
}
