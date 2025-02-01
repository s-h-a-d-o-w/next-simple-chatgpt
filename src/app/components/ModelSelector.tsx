import { styled } from "../../../styled-system/jsx";

const StyledSelect = styled("select", {
  base: {
    padding: "4rem 8rem",
    border: "1px solid black",
    backgroundColor: "white",
    cursor: "pointer",
  },
});

type Props = {
  value: string;
  onChange: (value: string) => void;
};

export function ModelSelector({ value, onChange }: Props) {
  return (
    <StyledSelect value={value} onChange={(e) => onChange(e.target.value)}>
      <option value="gpt-4-turbo">GPT-4 Turbo (1C/1K tokens)</option>
      <option value="o3-mini">o3 mini (0.4C/1K tokens)</option>
    </StyledSelect>
  );
}
