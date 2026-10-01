import { IconButton } from "@/components/IconButton";
import type { FileUIPart } from "ai";
import Image from "next/image";
import { styled } from "@/styled-system/jsx";

type Props = {
  files: FileUIPart[];
  onRemoveAttachment?: (index: number) => void;
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
    minWidth: "24rem",
    minHeight: "24rem",
    padding: "2rem",
  },
});

export function FilesPreview({ files, onRemoveAttachment }: Props) {
  return (
    <StyledAttachmentsContainer>
      {files.map(({ mediaType, url, filename }, index) => (
        <StyledImageContainer key={filename ?? url}>
          {mediaType.startsWith("image/") ? (
            <>
              <Image
                src={url}
                alt={filename ?? `Image ${index + 1}`}
                fill
                style={{
                  objectFit: "contain",
                }}
              />
              {onRemoveAttachment && (
                <StyledRemoveIcon
                  name="delete"
                  iconSize="sm"
                  type="button"
                  onClick={() => onRemoveAttachment(index)}
                />
              )}
            </>
          ) : (
            <div>
              <p>Preview not supported</p>
              <p>{filename}</p>
              <p>{mediaType}</p>
            </div>
          )}
        </StyledImageContainer>
      ))}
    </StyledAttachmentsContainer>
  );
}
