import { FormEvent } from "react";
import { css } from "../../styled-system/css";
import { styled } from "../../styled-system/jsx";
import { IconButton } from "./IconButton";
import Spinner from "./Spinner";
import { useChat } from "ai/react";

type Props = {
  disabledReplay: boolean;
  input: string;
  isLoading: boolean;
  onChange: ReturnType<typeof useChat>["handleInputChange"];
  onClickStop: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

const StyledInput = styled("textarea", {
  base: {
    border: "1px solid black",
    padding: "4rem 8rem",
  },
});

export function Prompt({
  disabledReplay,
  input,
  isLoading,
  onChange,
  onClickStop,
  onSubmit,
}: Props) {
  return (
    <div
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,

        display: "flex",
        justifyContent: "center",
      }}
    >
      <form
        onSubmit={onSubmit}
        className={css({
          display: "flex",
          maxWidth: "800px",
          width: "100%",
          padding: "10rem",

          alignItems: "center",
          gap: "10rem",
          backgroundColor: "amber.50",
          boxShadow: "lg",
        })}
      >
        <StyledInput
          name="prompt"
          placeholder="Leave empty to re-run."
          value={input}
          onChange={onChange}
          disabled={isLoading}
          style={{ flexGrow: 1 }}
        />

        {isLoading ? (
          <>
            <Spinner />
            <IconButton name="stop" type="button" onClick={onClickStop} />
          </>
        ) : input ? (
          <IconButton name="up" type="submit" />
        ) : (
          <IconButton name="replay" type="submit" disabled={disabledReplay} />
        )}
      </form>
    </div>
  );
}
