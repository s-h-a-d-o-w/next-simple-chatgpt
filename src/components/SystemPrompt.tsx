import { ChangeEventHandler } from "react";
import { StyledTextarea } from "./StyledTextarea";

type Props = {
  onChange: ChangeEventHandler<HTMLTextAreaElement>;
  value: string;
};

export function SystemPrompt({ onChange, value }: Props) {
  return (
    <form style={{ display: "flex", flexDirection: "column" }}>
      <div>System</div>
      <StyledTextarea
        name="prompt"
        value={value}
        onChange={onChange}
        style={{ flexGrow: 1 }}
      />
    </form>
  );
}
