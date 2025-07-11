import Image from "next/image";
import type { Attachment } from "ai";
import { styled } from "../../../../styled-system/jsx";

const StyledAttachmentsContainer = styled("div", {
  base: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8rem",
    marginBottom: "8rem",
  },
});

const StyledImagePreview = styled("div", {
  base: {
    position: "relative",
    width: "240rem",
    height: "240rem",
  },
});

export function AttachmentPreviews({
  attachments,
}: {
  attachments: Attachment[];
}) {
  return (
    <StyledAttachmentsContainer>
      {attachments.map(({ url, name }, index) => (
        <StyledImagePreview key={index}>
          <Image
            src={url}
            alt={name ?? `Image ${index + 1}`}
            fill
            style={{
              objectFit: "contain",
            }}
          />
        </StyledImagePreview>
      ))}
    </StyledAttachmentsContainer>
  );
}
