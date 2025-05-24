import { FormEvent, useCallback, useRef } from "react";
import { IconButton } from "../../components/IconButton";
import { Textarea } from "../../components/Textarea";
import { styled } from "../../../styled-system/jsx";
import { css } from "../../../styled-system/css";
import Image from "next/image";
import type { useChat, Message } from "@ai-sdk/react";
import { getPdfjsLib } from "../../utils/getPdfjsLib";
import { models } from "@/utils/consts";

type Attachment = NonNullable<Message["experimental_attachments"]>[number];

type Props = {
  attachments: Attachment[];
  currentModel: keyof typeof models;
  disabledReplay: boolean;
  input: string;
  isFirstPrompt: boolean;
  isLoading: boolean;
  onChange: ReturnType<typeof useChat>["handleInputChange"];
  onClickStop: () => void;
  onModelChange: (model: keyof typeof models) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;

  onAddAttachments?: (files: Attachment[]) => void;
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

function convertFileToDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function convertPdfToImage(file: File): Promise<string[]> {
  const pdfjsLib = await getPdfjsLib();

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({
    data: arrayBuffer,
  }).promise;

  return await Promise.all(
    Array.from({ length: pdf.numPages }, async (_, index) => {
      const page = await pdf.getPage(index + 1);
      const viewport = page.getViewport({ scale: 2 });

      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      await page.render({
        canvasContext: context!,
        viewport: viewport,
      }).promise;

      return canvas.toDataURL("image/png");
    }),
  );
}

export function Prompt({
  currentModel,
  disabledReplay,
  input,
  isFirstPrompt,
  isLoading,
  onChange,
  onClickStop,
  onSubmit,
  attachments,
  onAddAttachments,
  onModelChange,
  onRemoveAttachment,
}: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(event.target.files || []);
      const attachments = await Promise.all(
        files.map(async (file) => {
          if (file.type === "application/pdf") {
            try {
              return (await convertPdfToImage(file)).map((dataURL, index) => ({
                name: `${file.name} - Page ${index + 1}`,
                contentType: "image/png",
                url: dataURL,
              }));
            } catch (error) {
              // TODO: render error in ui
              console.error("Error converting PDF to image:", error);
              return [];
            }
          } else {
            return [
              {
                name: file.name,
                contentType: file.type,
                url: await convertFileToDataURL(file),
              },
            ];
          }
        }),
      );

      if (!models[currentModel].supportsAttachments) {
        onModelChange("gpt-4.1");
      }

      onAddAttachments?.(
        attachments.flat().filter((file) => file !== undefined),
      );

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    },
    [currentModel, onAddAttachments, onModelChange],
  );

  const removeAttachment = useCallback(
    (index: number) => {
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
                  src={file.url}
                  alt={file.name ?? `Image ${index + 1}`}
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
