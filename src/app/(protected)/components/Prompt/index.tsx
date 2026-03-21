import { memo, useCallback, useRef, useState } from "react";
import type { KeyboardEvent, SubmitEvent } from "react";
import { styled } from "@/styled-system/jsx";
import { IconButton } from "@/components/IconButton";
import { Textarea } from "@/components/Textarea";
import { FilesPreview } from "./FilesPreview";
import { filesToAttachments } from "./filesToAttachments";
import type { FileUIPart } from "ai";
import { objectEntries } from "@/lib/utils/objectEntries";
import { promptFilesAtom, chatStartTimeAtom } from "../../atoms";
import { useAtom, useSetAtom } from "jotai";
import { useModelSelection } from "@/app/(protected)/hooks/useModelSelection";
import { useModels } from "@/app/(protected)/hooks/useModels";

type Props = {
  disabledReplay: boolean;
  isFirstPrompt: boolean;
  isLoading: boolean;
  onStop: () => void;
  onReplay: () => void;
  onSend: ({ files, input }: { files: FileUIPart[]; input: string }) => void;
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

export const Prompt = memo(function Prompt({
  disabledReplay,
  isFirstPrompt,
  isLoading,
  onReplay,
  onSend,
  onStop,
}: Props) {
  const [files, setFiles] = useAtom(promptFilesAtom);
  const setStartTime = useSetAtom(chatStartTimeAtom);

  const [value, setValue] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const models = useModels();
  const { modelConfig, setModel } = useModelSelection();

  const handleFileInputChange = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      // TODO: If processing takes longer than ~500ms, render a spinner.
      const newAttachments = await filesToAttachments(
        Array.from(event.target.files ?? []),
      );
      setFiles((previousAttachments) => [
        ...previousAttachments,
        ...newAttachments,
      ]);

      if (!modelConfig.supportsAttachments) {
        // fall back to any model that supports attachments
        setModel(
          objectEntries(models).find(
            ([_, model]) => model.supportsAttachments,
          )![0],
        );
      }

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    },
    [modelConfig.supportsAttachments, models, setModel, setFiles],
  );

  const handleRemoveAttachment = useCallback(
    (index: number) => {
      setFiles((previousAttachments) =>
        previousAttachments.filter((_, i) => i !== index),
      );
    },
    [setFiles],
  );

  const handleSubmit = useCallback(
    (
      event: KeyboardEvent<HTMLTextAreaElement> | SubmitEvent<HTMLFormElement>,
    ) => {
      event.preventDefault();

      if (value === "" && files.length === 0) {
        onReplay();
        return;
      }

      onSend({
        files,
        input: value,
      });
      setValue("");
      setFiles([]);

      // We only need to set start time at the start of the conversation.
      if (isFirstPrompt) {
        setStartTime(Date.now());
      }
    },
    [
      files,
      isFirstPrompt,
      value,
      onReplay,
      onSend,
      setStartTime,
      setValue,
      setFiles,
    ],
  );

  return (
    <StyledPrompt>
      <StyledForm onSubmit={handleSubmit}>
        {files.length > 0 && (
          <FilesPreview
            files={files}
            onRemoveAttachment={handleRemoveAttachment}
          />
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
            value={value}
            onChange={(event) => setValue(event.target.value)}
            onKeyDown={(event) => {
              if (event.ctrlKey && event.key === "Enter") {
                handleSubmit(event);
              }
            }}
            disabled={isLoading}
            style={{ flexGrow: 1 }}
          />

          {modelConfig.supportsAttachments && (
            <>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,application/pdf"
                multiple
                onChange={handleFileInputChange}
                style={{ display: "none" }}
              />
              <IconButton
                name="image"
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading}
                aria-label="Add image"
              />
            </>
          )}

          {isLoading ? (
            <IconButton
              name="stop"
              type="button"
              onClick={(event) => {
                event.preventDefault();
                onStop();
              }}
            />
          ) : value || files.length > 0 ? (
            <IconButton name="up" type="submit" />
          ) : (
            <IconButton name="replay" type="submit" disabled={disabledReplay} />
          )}
        </StyledInputContainer>
      </StyledForm>
    </StyledPrompt>
  );
});
