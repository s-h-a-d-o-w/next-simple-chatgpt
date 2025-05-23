import { useChat } from "ai/react";
import { FormEvent } from "react";
import { IconButton } from "../../components/IconButton";
import { Textarea } from "../../components/Textarea";
import { styled } from "../../../styled-system/jsx";

type Props = {
  disabledReplay: boolean;
  input: string;
  isFirstPrompt: boolean;
  isLoading: boolean;
  onChange: ReturnType<typeof useChat>["handleInputChange"];
  onClickStop: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

const StyledPrompt = styled("div", {
  base: {
    display: "flex",
    justifyContent: "center",
  },
});

const StyledForm = styled("form", {
  base: {
    width: "100%",
    maxWidth: "800px",

    backgroundColor: "transparent",

    display: "flex",
    alignItems: "center",
    gap: "10rem",
  },
});

export function Prompt({
  disabledReplay,
  input,
  isFirstPrompt,
  isLoading,
  onChange,
  onClickStop,
  onSubmit,
}: Props) {
  return (
    <StyledPrompt>
      <StyledForm onSubmit={onSubmit}>
        <Textarea
          autoFocus
          name="prompt"
          placeholder={
            isFirstPrompt ? "Enter your prompt here." : "Leave empty to re-run."
          }
          value={input}
          onChange={onChange}
          onKeyDown={(event) => {
            if (event.ctrlKey && event.key === "Enter") {
              onSubmit(event as unknown as FormEvent<HTMLFormElement>);
            }
          }}
          disabled={isLoading}
          style={{ flexGrow: 1 }}
        />

        {isLoading ? (
          <IconButton
            name="stop"
            type="button"
            onClick={(event) => {
              event.preventDefault();
              onClickStop();
            }}
          />
        ) : input ? (
          <IconButton name="up" type="submit" />
        ) : (
          <IconButton name="replay" type="submit" disabled={disabledReplay} />
        )}
      </StyledForm>
    </StyledPrompt>
  );
}
