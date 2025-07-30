import { IconButton } from "@/components/IconButton";
import Spinner from "@/components/Spinner";
import { withProfiler } from "@/components/withProfiler";
import { type Message as MessageType } from "ai/react";
import { memo } from "react";
import { styled } from "../../../../styled-system/jsx";
import { AttachmentPreviews } from "./AttachmentPreviews";
import { CopyButton } from "./CopyButton";
import { Part } from "./Part";

type Props = MessageType & {
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
    content,
    className,
    onDelete,
    onClick,
    experimental_attachments,
    parts,
  }: Props) {
    const isUser = role === "user";

    return role === "system" ? null : (
      <StyledMessage
        variant={isUser ? "user" : "default"}
        key={id}
        data-testid={`message-${role}`}
        className={className}
        onClick={onClick}
        shortened={shortened}
      >
        {experimental_attachments && experimental_attachments.length > 0 && (
          <AttachmentPreviews attachments={experimental_attachments} />
        )}

        {/* When there's only narrow code, the container wouldn't expand by itself. */}
        <div style={{ width: "100%" }}>
          {parts?.map((part, index) => <Part key={index} part={part} />)}
        </div>

        {(isLoading || onDelete || showCopyAll) && (
          <div
            style={{
              alignSelf: isUser ? undefined : "flex-end",
              display: "flex",
              gap: "12rem",
            }}
          >
            {content === "" && <Spinner />}
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
  }),
  (prev, next) => {
    // might have to use stringify(parts) if this doesn't work with all message types
    return prev.content === next.content;
  },
);
