import { ChangeEventHandler, useCallback, useEffect } from "react";
import { useAtom } from "jotai";
import { Textarea } from "@/components/Textarea";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { styled } from "@/styled-system/jsx";
import { systemPromptAtom } from "../atoms";
import { config } from "@/config";
import type { SetMessages } from "@/types";

type Props = {
  setMessages: SetMessages;
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

export function SystemPrompt({ setMessages }: Props) {
  const [systemPrompt, setSystemPrompt] = useAtom(systemPromptAtom);
  const debouncedSystemPrompt = useDebouncedValue(
    systemPrompt,
    config.ui.systemMessageDebounce,
  );

  const syncSystemMessage = useCallback(
    (content: string) => {
      setMessages((innerMessages) => {
        const nextMessages = structuredClone(innerMessages);
        const systemIndex = nextMessages.findIndex(
          (message) => message.role === "system",
        );
        if (systemIndex !== -1 && nextMessages[systemIndex]) {
          nextMessages[systemIndex].parts = [{ type: "text", text: content }];
        } else {
          nextMessages.unshift({
            parts: [{ type: "text", text: content }],
            role: "system",
            id: "system",
          });
        }
        return nextMessages;
      });
    },
    [setMessages],
  );

  useEffect(() => {
    syncSystemMessage(debouncedSystemPrompt);
  }, [debouncedSystemPrompt, syncSystemMessage]);

  const handleChangeSystemInput: ChangeEventHandler<HTMLTextAreaElement> =
    useCallback(
      (event) => {
        setSystemPrompt(event.target.value);
      },
      [setSystemPrompt],
    );

  return (
    <StyledForm>
      <div>System prompt</div>
      <StyledTextArea
        name="prompt"
        value={systemPrompt}
        onChange={handleChangeSystemInput}
      />
    </StyledForm>
  );
}
