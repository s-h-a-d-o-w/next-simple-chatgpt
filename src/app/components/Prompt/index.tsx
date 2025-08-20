import { FormEvent, useCallback, useRef } from "react";
import { styled } from "../../../../styled-system/jsx";
import { IconButton } from "@/components/IconButton";
import { Textarea } from "@/components/Textarea";
import { models, type ModelKey } from "@/config";
import { FilesPreview } from "./FilesPreview";
import { filesToAttachments } from "./filesToAttachments";
import type { FileUIPart } from "ai";

type Props = {
  files: FileUIPart[];
  currentModel: ModelKey;
  disabledReplay: boolean;
  input: string;
  isFirstPrompt: boolean;
  isLoading: boolean;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onClickStop: () => void;
  onModelChange: (model: ModelKey) => void;
  onRemoveAttachment: (index: number) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;

  onAddAttachments?: (files: FileUIPart[]) => void;
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
    flexDirection: "column",
    gap: "10rem",
  },
});

const StyledInputContainer = styled("div", {
  base: {
    display: "flex",
    alignItems: "center",
    gap: "10rem",
  },
});

export function Prompt({
  currentModel,
  disabledReplay,
  input,
  isFirstPrompt,
  isLoading,
  onChange,
  onClickStop,
  onSubmit,
  files,
  onAddAttachments,
  onModelChange,
  onRemoveAttachment,
}: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      // TODO: If processing takes longer than ~500ms, render a spinner.
      onAddAttachments?.(
        await filesToAttachments(Array.from(event.target.files || [])),
      );

      if (!models[currentModel].supportsAttachments) {
        // fall back to model that supports attachments
        onModelChange(
          Object.entries(models).find(
            ([_, model]) => model.supportsAttachments,
          )?.[0] as ModelKey,
        );
      }

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    },
    [currentModel, onAddAttachments, onModelChange],
  );

  return (
    <StyledPrompt>
      <StyledForm onSubmit={onSubmit}>
        {files.length > 0 && (
          <FilesPreview files={files} onRemoveAttachment={onRemoveAttachment} />
        )}

        <StyledInputContainer>
          <Textarea
            autoFocus
            aria-label="chat prompt"
            placeholder={
              isFirstPrompt
                ? "Enter your prompt here."
                : "Leave empty to re-run."
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

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,application/pdf"
            multiple
            onChange={handleFileSelect}
            style={{ display: "none" }}
          />
          <IconButton
            name="image"
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading}
            aria-label="Add image"
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
          ) : input || files.length > 0 ? (
            <IconButton name="up" type="submit" />
          ) : (
            <IconButton name="replay" type="submit" disabled={disabledReplay} />
          )}
        </StyledInputContainer>
      </StyledForm>
    </StyledPrompt>
  );
}
