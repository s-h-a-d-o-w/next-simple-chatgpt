import { ChangeEventHandler } from "react";
import { Textarea } from "../../components/Textarea";

type Props = {
  onChange: ChangeEventHandler<HTMLTextAreaElement>;
  value: string;
};

export function SystemPrompt({ onChange, value }: Props) {
  return (
    <form style={{ display: "flex", flexDirection: "column" }}>
      <div>System prompt</div>
      <Textarea
        name="prompt"
        value={value}
        onChange={onChange}
        style={{ background: "white" }}
      />
    </form>
  );
}
