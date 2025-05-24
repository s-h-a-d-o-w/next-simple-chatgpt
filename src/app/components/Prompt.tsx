import { useChat } from "ai/react";
import { FormEvent, useCallback, useRef } from "react";
import { IconButton } from "../../components/IconButton";
import { Textarea } from "../../components/Textarea";
import { styled } from "../../../styled-system/jsx";
import { css } from "../../../styled-system/css";
import Image from "next/image";

type Props = {
  attachments: File[];
  disabledReplay: boolean;
  input: string;
  isFirstPrompt: boolean;
  isLoading: boolean;
  onChange: ReturnType<typeof useChat>["handleInputChange"];
  onClickStop: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;

  onAddAttachments?: (files: File[]) => void;
  onRemoveAttachment?: (index: number) => void;
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

const StyledAttachmentsContainer = styled("div", {
  base: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8rem",
  },
});

const StyledImagePreview = styled("div", {
  base: {
    position: "relative",
    width: "80rem",
    height: "80rem",
    borderRadius: "8rem",
    overflow: "hidden",
    border: "1px solid token(colors.stone.300)",
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
  attachments,
  onAddAttachments,
  onRemoveAttachment,
}: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(event.target.files || []);
      const imageFiles = files.filter((file) => file.type.startsWith("image/"));

      onAddAttachments?.(imageFiles);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    },
    [onAddAttachments, fileInputRef],
  );

  const removeAttachment = useCallback(
    (index: number) => {
      console.log("removeAttachment", index);
      onRemoveAttachment?.(index);
    },
    [onRemoveAttachment],
  );

  return (
    <StyledPrompt>
      <StyledForm onSubmit={onSubmit}>
        {attachments.length > 0 && (
          <StyledAttachmentsContainer>
            {attachments.map((file, index) => (
              <StyledImagePreview key={index}>
                <Image
                  src={URL.createObjectURL(file)}
                  alt={file.name}
                  width={80}
                  height={80}
                />
                <IconButton
                  name="delete"
                  iconSize="sm"
                  type="button"
                  onClick={() => removeAttachment(index)}
                  className={css({
                    position: "absolute",
                    top: "4rem",
                    right: "4rem",
                    backgroundColor: "rgba(0, 0, 0, 0.7)",
                    color: "white",
                    minWidth: "24rem",
                    minHeight: "24rem",
                    padding: "2rem",
                  })}
                />
              </StyledImagePreview>
            ))}
          </StyledAttachmentsContainer>
        )}

        <StyledInputContainer>
          <Textarea
            autoFocus
            name="prompt"
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
            accept="image/*"
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
          ) : input || attachments.length > 0 ? (
            <IconButton name="up" type="submit" />
          ) : (
            <IconButton name="replay" type="submit" disabled={disabledReplay} />
          )}
        </StyledInputContainer>
      </StyledForm>
    </StyledPrompt>
  );
}
