import { ChangeEventHandler } from "react";
import { Textarea } from "../../components/Textarea";
import { styled } from "../../../styled-system/jsx";

type Props = {
  onChange: ChangeEventHandler<HTMLTextAreaElement>;
  value: string;
};

const StyledTextArea = styled(Textarea, {
  base: {
    background: "white",
    _dark: {
      background: "black",
      borderColor: "gray.50",
    },
  },
});

export function SystemPrompt({ onChange, value }: Props) {
  return (
    <form style={{ display: "flex", flexDirection: "column" }}>
      <div>System prompt</div>
      <StyledTextArea name="prompt" value={value} onChange={onChange} />
    </form>
  );
}
