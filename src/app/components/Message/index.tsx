import { IconButton } from "@/components/IconButton";
import { useThrottledValue } from "@/hooks/useThrottledValue";
import { type Message as MessageType } from "ai/react";
import { memo, useDeferredValue } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { styled } from "../../../../styled-system/jsx";
import { AttachmentPreviews } from "./AttachmentPreviews";
import { Code } from "./Code";
import { CopyButton } from "./CopyButton";
import { padNewlines } from "./padNewlines";
import { Cell, HeaderCell, Row } from "./TableElements";
import { config } from "@/config";

type Props = MessageType & {
  className?: string;
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
    shortened: {
      true: {
        cursor: "pointer",
        maxHeight: "115rem",
        overflowY: "hidden",
      },
    },
  },
});

const MemoizedReactMarkdown = memo(
  ReactMarkdown,
  (prevProps, nextProps) => prevProps.children === nextProps.children,
);

function MessageWithThrottling({ content, ...props }: Props) {
  // Throttle to be economical (mobile device batteries)
  const throttledContent = useThrottledValue(
    content,
    config.ui.messageStreamThrottle,
  );
  // Defer in case a low power device is unable to fully render within that window.
  // Otherwise, e.g. aborting while streaming wouldn't be possible.
  const displayText = useDeferredValue(throttledContent);

  return <MessageWithoutThrottling content={displayText} {...props} />;
}

const MessageWithoutThrottling = memo(function MessageWithoutThrottling({
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
}: Props) {
  const isUser = role === "user";

  return role === "system" ? null : (
    <StyledMessage
      variant={isUser ? "user" : "default"}
      key={id}
      className={className}
      onClick={onClick}
      shortened={shortened}
    >
      {experimental_attachments && experimental_attachments.length > 0 && (
        <AttachmentPreviews attachments={experimental_attachments} />
      )}

      <div style={{ width: "100%" }}>
        <MemoizedReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            code: Code,
            pre: ({ children }) => children,
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            th: HeaderCell,
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            td: Cell,
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            tr: Row,
          }}
        >
          {padNewlines(content)}
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
});

export function Message({ isLoading = false, ...props }: Props) {
  return isLoading ? (
    <MessageWithThrottling isLoading={isLoading} {...props} />
  ) : (
    <MessageWithoutThrottling isLoading={isLoading} {...props} />
  );
}
