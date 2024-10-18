import { type Message as MessageType } from "ai/react";
import { memo, useState } from "react";
import ReactMarkdown from "react-markdown";
import { styled } from "../../../../styled-system/jsx";
import { Button } from "../../../components/Button";
import { padNewlines } from "./padNewlines";
import { Code } from "./Code";

type Props = MessageType & {
  className?: string;
  fullHeight?: boolean;
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
        border: "1px solid token(colors.amber.700)",
      },
      default: {
        backgroundColor: "white",
        border: "1px solid token(colors.stone.400)",
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
  (prevProps, nextProps) =>
    prevProps.children === nextProps.children &&
    prevProps.className === nextProps.className,
);

export function Message({
  role,
  id,
  fullHeight = true,
  shortened = false,
  showCopyAll = false,
  content,
  className,
  onDelete,
  onClick,
}: Props) {
  const isUser = role === "user";

  const [hasCopied, setHasCopied] = useState(false);
  const type = "text/plain";
  const blob = new Blob([content], { type });

  // Only works with HTTPS and on localhost.
  const clipboardItem = showCopyAll && [new ClipboardItem({ [type]: blob })];

  return role === "system" ? null : (
    <StyledMessage
      variant={isUser ? "user" : undefined}
      key={id}
      className={className}
      onClick={onClick}
      fullHeight={fullHeight}
      shortened={shortened}
    >
      <div style={{ flexGrow: 1 }}>
        <MemoizedReactMarkdown
          components={{
            code: Code,
          }}
        >
          {padNewlines(content)}
        </MemoizedReactMarkdown>
      </div>
      <div
        style={{
          alignSelf: isUser ? undefined : "flex-end",
          display: "flex",
          gap: "12rem",
        }}
      >
        {onDelete && <Button onClick={() => onDelete(id)}>Delete</Button>}
        {showCopyAll && clipboardItem && (
          <Button
            disabled={hasCopied}
            onClick={() => {
              navigator.clipboard.write(clipboardItem);
              setHasCopied(true);
              setTimeout(() => {
                setHasCopied(false);
              }, 1000);
            }}
          >
            {hasCopied ? "Done" : "Copy"}
          </Button>
        )}
      </div>
    </StyledMessage>
  );
}