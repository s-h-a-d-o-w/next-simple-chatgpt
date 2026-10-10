import { IconButton } from "@/components/IconButton";
import Spinner from "@/components/Spinner";
import { withProfiler } from "@/components/withProfiler";
import type { UIMessage } from "ai";
import { memo, useMemo } from "react";
import { styled } from "@/styled-system/jsx";
import { FilesPreview } from "@/components/FilesPreview";
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

const StyledMessage = styled("div", {
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
        backgroundColor: "surface.secondary",
        borderRightWidth: "4rem",

        borderColor: "surface.secondary.border",
      },
      user: {
        backgroundColor: "surface.raised",
        borderLeftWidth: "4rem",

        borderColor: "accent",
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
      .filter((part) => part.type === "text")
      .map((part) => part.text)
      .join("\n");
    const lastPart = parts.at(-1);

    const files = useMemo(
      () => parts.filter((part) => part.type === "file"),
      [parts],
    );

    return role === "system" ? undefined : (
      <StyledMessage
        variant={isUser ? "user" : "default"}
        key={id}
        data-testid={`message-${role}`}
        className={className}
        onClick={onClick}
        shortened={shortened}
      >
        {files.length > 0 && <FilesPreview files={files} />}

        <div style={{ width: "100%" }}>
          {parts
            .filter(
              (part) =>
                part.type === "text" ||
                (part.type === "reasoning" && part.text !== ""),
            )
            .map((part) => (
              // @ts-expect-error Strange tool type error
              <Part key={`${id}-${part.type}-${part.text}`} part={part} />
            ))}
        </div>

        {!isLoading &&
          lastPart?.type === "reasoning" &&
          lastPart.state === "streaming" && (
            <div>Request timed out during model reasoning</div>
          )}

        {(isLoading || showCopyAll || onDelete) && (
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
  (prev, next) =>
    prev.parts === next.parts && prev.isLoading === next.isLoading,
);
Message.displayName = "Message";
