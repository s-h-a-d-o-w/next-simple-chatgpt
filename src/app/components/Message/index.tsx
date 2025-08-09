import { IconButton } from "@/components/IconButton";
import Spinner from "@/components/Spinner";
import { withProfiler } from "@/components/withProfiler";
import { type UIMessage } from "ai";
import { memo } from "react";
import { styled } from "../../../../styled-system/jsx";
import { FilesPreview } from "./FilesPreview";
import { CopyButton } from "./CopyButton";
import { Part } from "./Part";

type Props = UIMessage & {
  className?: string;
  isExpandable?: boolean;
  isLoading?: boolean;
  onClick?: () => void;
  onDelete?: (id: string) => void;
  shortened?: boolean;
  showCopyAll?: boolean;
};

export const StyledMessage = styled("div", {
  base: {
    display: "flex",
    position: "relative",
    flexDirection: "column",
    gap: "8rem",
    padding: "12rem",
    alignItems: "flex-start",

    overflowX: "auto",
  },

  variants: {
    variant: {
      default: {
        backgroundColor: "stone.100",
        borderRightWidth: "4rem",

        borderColor: "stone.400",
        _dark: {
          backgroundColor: "gray.700",
          borderColor: "gray.100",
        },
      },
      user: {
        backgroundColor: "amber.100",
        borderLeftWidth: "4rem",

        borderColor: "amber.800",
        _dark: {
          backgroundColor: "gray.700",
          borderColor: "brand.500",
        },
      },
    },
    shortened: {
      true: {
        cursor: "pointer",
        maxHeight: "115rem",
        overflowY: "hidden",
      },
    },
  },
});

export const Message = memo(
  withProfiler(function Message({
    role,
    id,
    isLoading = false,
    shortened = false,
    showCopyAll = false,
    className,
    onDelete,
    onClick,
    parts,
  }: Props) {
    const isUser = role === "user";
    const content = parts
      ?.filter((part) => part.type === "text")
      .map((part) => part.text)
      .join("\n");

    const files = parts.filter((part) => part.type === "file");

    return role === "system" ? null : (
      <StyledMessage
        variant={isUser ? "user" : "default"}
        key={id}
        data-testid={`message-${role}`}
        className={className}
        onClick={onClick}
        shortened={shortened}
      >
        {files.length > 0 && <FilesPreview files={files} />}

        {/* When there's only narrow code, the container wouldn't expand by itself. */}
        {content && (
          <div style={{ width: "100%" }}>
            {parts
              .filter((part) => part.type !== "file")
              .map((part, index) => (
                <Part key={index} part={part} />
              ))}
          </div>
        )}

        {(isLoading || onDelete || showCopyAll) && (
          <div
            style={{
              alignSelf: isUser ? undefined : "flex-end",
              display: "flex",
              gap: "12rem",
              alignItems: "center",
            }}
          >
            {isLoading && content === "" && <Spinner />}
            {!isLoading && onDelete && (
              <IconButton
                name="delete"
                iconSize="md"
                onClick={() => onDelete(id)}
              />
            )}
            {!isLoading && showCopyAll && <CopyButton>{content}</CopyButton>}
          </div>
        )}
      </StyledMessage>
    );
  }, true),
  (prev, next) => {
    // might have to use stringify(parts) if this doesn't work with all message types
    return prev.parts === next.parts && prev.isLoading === next.isLoading;
  },
);
