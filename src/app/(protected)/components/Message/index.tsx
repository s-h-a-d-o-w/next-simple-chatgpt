import { IconButton } from "@/components/IconButton";
import { withProfiler } from "@/components/withProfiler";
import type { ReasoningUIPart, TextUIPart, UIMessage } from "ai";
import { memo, useMemo } from "react";
import { styled } from "@/styled-system/jsx";
import { FilesPreview } from "@/components/FilesPreview";
import { CopyButton } from "./CopyButton";
import { Part } from "./Part";
import DelayedStatusText from "@/components/DelayedStatusText";
import { Metadata } from "@/types";

type Props = UIMessage<Metadata> & {
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

function extractResponse(parts: UIMessage["parts"]) {
  let result = "";

  for (const part of parts) {
    if (part.type === "text") {
      if (result !== "" && part.text !== "") {
        result += "\n\n";
      }

      result += part.text;
    }
  }

  return result;
}

export const Message = memo(
  withProfiler(function Message({
    className,
    id,
    isLoading = false,
    metadata,
    onClick,
    onDelete,
    parts,
    role,
    shortened = false,
    showCopyAll = false,
  }: Props) {
    const isUser = role === "user";
    const content = extractResponse(parts);
    const lastPart = parts.at(-1);
    const isReasoning = lastPart?.type === "reasoning";
    const hasAbortedReasoning =
      !isLoading &&
      lastPart?.type === "reasoning" &&
      lastPart.state === "streaming";

    const files = useMemo(
      () => parts.filter((part) => part.type === "file"),
      [parts],
    );
    // File parts are rendered separately by FilesPreview.
    const renderableParts = useMemo(
      () =>
        parts.filter(
          (part) =>
            part.type === "text" ||
            (part.type === "reasoning" && part.text !== ""),
        ) as (TextUIPart | ReasoningUIPart)[],
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

        {renderableParts.length > 0 && (
          <div style={{ width: "100%" }}>
            {renderableParts.map((part) => (
              <div
                key={`${id}-${part.type}-${part.text}`}
                data-testid={`message-${role}-part`}
              >
                <Part part={part} />
              </div>
            ))}
          </div>
        )}

        {metadata?.triggeredContentFilter && (
          <div>The model refused to respond due to content restrictions.</div>
        )}

        {hasAbortedReasoning && <div>Reasoning was aborted.</div>}

        {(isLoading || showCopyAll || onDelete) && !hasAbortedReasoning && (
          <div
            style={{
              alignSelf: isUser ? undefined : "flex-end",
              display: "flex",
              gap: "12rem",
              alignItems: "center",
            }}
          >
            {isLoading && content === "" && (
              <div>
                {isReasoning ? (
                  <DelayedStatusText>Reasoning...</DelayedStatusText>
                ) : (
                  "Waiting for response..."
                )}
              </div>
            )}
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
