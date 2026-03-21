import { ChangeEventHandler, useCallback } from "react";
import { useAtom } from "jotai";
import { Textarea } from "@/components/Textarea";
import { styled } from "@/styled-system/jsx";
import { cloneDeep, debounce } from "lodash-es";
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

  const syncSystemMessage = useCallback(
    (content: string) => {
      setMessages((innerMessages) => {
        const nextMessages = cloneDeep(innerMessages);
        const systemIndex = nextMessages.findIndex(
          (message) => message.role === "system",
        );
        if (systemIndex >= 0 && nextMessages[systemIndex]) {
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

  // Syncs the system prompt into the array of messages when it changes.
  // oxlint-disable-next-line eslint-plugin-react-hooks/exhaustive-deps
  const debouncedSyncSystemMessage = useCallback(
    debounce((content: string) => {
      syncSystemMessage(content);
    }, config.ui.systemMessageDebounce),
    [syncSystemMessage],
  );

  const handleChangeSystemInput: ChangeEventHandler<HTMLTextAreaElement> =
    useCallback(
      (event) => {
        setSystemPrompt(event.target.value);
        debouncedSyncSystemMessage(event.target.value);
      },
      [debouncedSyncSystemMessage, setSystemPrompt],
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
