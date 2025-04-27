import { styled } from "../../../styled-system/jsx";

const StyledSelect = styled("select", {
  base: {
    padding: "4rem 8rem",
    border: "1px solid black",
    backgroundColor: "white",
    cursor: "pointer",
  },
});

const models = {
  "gpt-4.1": {
    name: "GPT-4.1",
    input: 2,
    output: 8,
  },
  "gpt-4-turbo": {
    name: "GPT-4 Turbo",
    input: 10,
    output: 30,
  },
  "o4-mini": {
    name: "o4 mini",
    input: 1.1,
    output: 4.4,
  },
  "o3-mini": {
    name: "o3 mini",
    input: 1.1,
    output: 4.4,
  },
} as const;

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
