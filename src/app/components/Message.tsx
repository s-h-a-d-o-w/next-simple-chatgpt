import { type Message as MessageType } from "ai/react";
import { Button } from "../../components/Button";
import { styled } from "../../../styled-system/jsx";
import ReactMarkdown, { ExtraProps, type Options } from "react-markdown";
import { ClassAttributes, HTMLAttributes, memo, useState } from "react";
import { css } from "../../../styled-system/css";
import { fonts } from "@/utils/fonts";
import { PrismAsyncLight as Prism } from "react-syntax-highlighter";
import prismStyle from "react-syntax-highlighter/dist/esm/styles/prism/prism";

type Props = MessageType & {
  className?: string;
  fullHeight?: boolean;
  onClick?: () => void;
  onDelete?: (id: string) => void;
  shortened?: boolean;
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

function Code(
  props: ClassAttributes<HTMLElement> &
    HTMLAttributes<HTMLElement> &
    ExtraProps,
) {
  const { children, className } = props;
  const text = String(children);

  const [hasCopied, setHasCopied] = useState(false);

  // Inline code
  if (!text.includes("\n")) {
    return <code className={className}>{children}</code>;
  }

  const match = /language-(\w+)/.exec(className || "");
  const type = "text/plain";
  const blob = new Blob([text], { type });

  // Only works with HTTPS and on localhost.
  const clipboardItem = [new ClipboardItem({ [type]: blob })];
  return (
    <div style={{ position: "relative" }}>
      <Prism
        style={prismStyle}
        language={match?.[1] || ""}
        wrapLongLines
        codeTagProps={{
          className: css({
            overflowWrap: "anywhere",

            fontSize: "md",
            fontWeight: 500,
            textShadow: "none",
          }),
          style: fonts.robotoMono.style,
        }}
      >
        {text}
      </Prism>
      <Button
        disabled={hasCopied}
        onClick={() => {
          navigator.clipboard.write(clipboardItem);
          setHasCopied(true);
          setTimeout(() => {
            setHasCopied(false);
          }, 1000);
        }}
        style={{
          position: "absolute",
          top: 0,
          right: 0,
        }}
      >
        {hasCopied ? "Done" : "Copy"}
      </Button>
    </div>
  );
}

const components: Options["components"] = {
  code: Code,
  li: ({ children }) => (
    <li
      style={{
        listStyleType: "disc",
        listStylePosition: "outside",
        marginLeft: "16rem",
      }}
    >
      {children}
    </li>
  ),
  p: ({ children }) => (
    <p
      style={{
        display: "inline",
      }}
    >
      {children}
    </p>
  ),
};

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
  content,
  className,
  onDelete,
  onClick,
}: Props) {
  const isUser = role === "user";
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
        <MemoizedReactMarkdown components={components}>
          {content}
        </MemoizedReactMarkdown>
      </div>
      {onDelete && (
        <Button
          onClick={() => onDelete(id)}
          style={{ alignSelf: isUser ? undefined : "flex-end" }}
        >
          Delete
        </Button>
      )}
    </StyledMessage>
  );
}
