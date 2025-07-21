import { IconButton } from "@/components/IconButton";
import Spinner from "@/components/Spinner";
import { config } from "@/config";
import { useThrottledValue } from "@/hooks/useThrottledValue";
import { type Message as MessageType } from "ai/react";
import { memo, useDeferredValue } from "react";
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
  parts,
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
});

export function Message({ isLoading = false, ...props }: Props) {
  return isLoading ? (
    <MessageWithThrottling isLoading={isLoading} {...props} />
  ) : (
    <MessageWithoutThrottling isLoading={isLoading} {...props} />
  );
}
