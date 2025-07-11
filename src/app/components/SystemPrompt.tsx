import { ChangeEventHandler } from "react";
import { Textarea } from "../../components/Textarea";
import { styled } from "../../../styled-system/jsx";

type Props = {
  onChange: ChangeEventHandler<HTMLTextAreaElement>;
  value: string;
};

const StyledForm = styled("form", {
  base: {
    display: "flex",
    flexDirection: "column",
  },
});

const StyledTextArea = styled(Textarea, {
  base: {
    borderLeftWidth: "2rem",

    border: "2rem solid token(colors.amber.800)",
    backgroundColor: "white",
    _dark: {
      border: "none",
      backgroundColor: "gray.700",
    },
  },
});

export function SystemPrompt({ onChange, value }: Props) {
  return (
    <StyledForm>
      <div>System prompt</div>
      <StyledTextArea name="prompt" value={value} onChange={onChange} />
    </StyledForm>
  );
}
