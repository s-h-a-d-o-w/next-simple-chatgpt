import Image from "next/image";
import type { FileUIPart } from "ai";
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

export function FilesPreview({ files }: { files: FileUIPart[] }) {
  return (
    <StyledAttachmentsContainer>
      {files.map(({ mediaType, url, filename }, index) => (
        <StyledImagePreview key={index}>
          {mediaType === "image" ? (
            <Image
              src={url}
              alt={filename ?? `Image ${index + 1}`}
              fill
              style={{
                objectFit: "contain",
              }}
            />
          ) : (
            <div>
              <p>Preview not supported</p>
              <p>{filename}</p>
              <p>{mediaType}</p>
            </div>
          )}
        </StyledImagePreview>
      ))}
    </StyledAttachmentsContainer>
  );
}
