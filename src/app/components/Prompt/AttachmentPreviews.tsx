import { IconButton } from "@/components/IconButton";
import type { Attachment } from "ai";
import Image from "next/image";
import { styled } from "../../../../styled-system/jsx";

type Props = {
  attachments: Attachment[];
  onRemoveAttachment: (index: number) => void;
};

const StyledAttachmentsContainer = styled("div", {
  base: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8rem",
  },
});

const StyledImageContainer = styled("div", {
  base: {
    position: "relative",
    width: "120rem",
    height: "120rem",
  },
});

const StyledRemoveIcon = styled(IconButton, {
  base: {
    position: "absolute",
    top: "4rem",
    right: "4rem",
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    color: "white",
    minWidth: "24rem",
    minHeight: "24rem",
    padding: "2rem",
  },
});

export function AttachmentPreviews({ attachments, onRemoveAttachment }: Props) {
  return (
    <StyledAttachmentsContainer>
      {attachments.map((file, index) => (
        <StyledImageContainer key={index}>
          <Image
            src={file.url}
            alt={file.name ?? `Image ${index + 1}`}
            fill
            style={{
              objectFit: "contain",
            }}
          />
          <StyledRemoveIcon
            name="delete"
            iconSize="sm"
            type="button"
            onClick={() => onRemoveAttachment(index)}
          />
        </StyledImageContainer>
      ))}
    </StyledAttachmentsContainer>
  );
}
