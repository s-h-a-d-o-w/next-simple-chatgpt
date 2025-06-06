import { IconButton } from "@/components/IconButton";
import Spinner from "@/components/Spinner";
import { type Message as MessageType } from "ai/react";
import { memo, useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { styled } from "../../../../styled-system/jsx";
import { Code } from "./Code";
import { CopyButton } from "./CopyButton";
import { padNewlines } from "./padNewlines";
import { Cell, HeaderCell, Row } from "./TableElements";
import Image from "next/image";
import { throttle } from "lodash";

const MESSAGE_STREAM_THROTTLE_DURATION = 500;

type Props = MessageType & {
  className?: string;
  fullHeight?: boolean;
  isLoading?: boolean;
  onClick?: () => void;
  onDelete?: (id: string) => void;
  shortened?: boolean;
  showCopyAll?: boolean;
};

export const StyledMessage = styled("div", {
  base: {
    display: "flex",
    flexDirection: "column",
    gap: "8rem",
    padding: "12rem",
    alignItems: "flex-start",

    overflowX: "auto",
  },

  variants: {
    variant: {
      user: {
        backgroundColor: "amber.100",
        borderLeftWidth: "4rem",

        borderColor: "amber.800",
        _dark: {
          backgroundColor: "gray.700",
          borderColor: "brand.500",
        },
      },
      default: {
        backgroundColor: "stone.100",
        borderRightWidth: "4rem",

        borderColor: "stone.400",
        _dark: {
          backgroundColor: "gray.700",
          borderColor: "gray.100",
        },
      },
    },
    fullHeight: {
      true: {
        minHeight: "fit-content",
      },
    },
    shortened: {
      true: {
        // Not going to obsess over the fact that `cursor` should probably be in its own variant. Instead, might avoid Panda CSS in the future.
        cursor: "pointer",
        maxHeight: "115rem",
        overflowY: "hidden",
      },
    },
  },

  defaultVariants: {
    variant: "default",
  },
});

const MemoizedReactMarkdown = memo(
  ReactMarkdown,
  (prevProps, nextProps) => prevProps.children === nextProps.children,
);

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

export const Message = memo(function Message({
  role,
  id,
  isLoading = false,
  fullHeight = true,
  shortened = false,
  showCopyAll = false,
  content,
  className,
  onDelete,
  onClick,
  experimental_attachments,
}: Props) {
  const isUser = role === "user";
  const [displayText, setDisplayText] = useState(content);

  const throttledRef = useRef(
    throttle((next: string) => {
      setDisplayText(next);
    }, MESSAGE_STREAM_THROTTLE_DURATION),
  );

  useEffect(() => {
    throttledRef.current(content);
  }, [content]);

  useEffect(() => {
    return () => {
      // eslint-disable-next-line react-hooks/exhaustive-deps
      throttledRef.current.cancel();
    };
  }, []);

  return role === "system" ? null : (
    <StyledMessage
      variant={isUser ? "user" : undefined}
      key={id}
      className={className}
      onClick={onClick}
      fullHeight={fullHeight}
      shortened={shortened}
    >
      {experimental_attachments && experimental_attachments.length > 0 && (
        <StyledAttachmentsContainer>
          {experimental_attachments.map(({ url, name }, index) => (
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
      )}

      <div style={{ width: "100%" }}>
        <MemoizedReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            code: Code,
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            th: HeaderCell,
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            td: Cell,
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            tr: Row,
          }}
        >
          {padNewlines(displayText)}
        </MemoizedReactMarkdown>
      </div>

      {(isLoading || onDelete || showCopyAll) && (
        <div
          style={{
            alignSelf: isUser ? undefined : "flex-end",
            display: "flex",
            gap: "12rem",
          }}
        >
          {isLoading && <Spinner />}
          {onDelete && !isLoading && (
            <IconButton
              name="delete"
              iconSize="md"
              onClick={() => onDelete(id)}
            />
          )}
          {showCopyAll && !isLoading && <CopyButton content={displayText} />}
        </div>
      )}
    </StyledMessage>
  );
});
