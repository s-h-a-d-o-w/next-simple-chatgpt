import { type Message as MessageType } from "ai/react";
import { Button } from "./Button";
import { styled } from "../../../styled-system/jsx";
import ReactMarkdown, { type Options } from "react-markdown";
import { memo } from "react";
import { Prism } from "react-syntax-highlighter";
// import { relative } from "path";

const StyledMessage = styled("div", {
  base: {
    display: "flex",
    gap: "5rem",

    width: "80%",
  },

  variants: {
    variant: {
      user: {
        alignSelf: "flex-start",
        backgroundColor: "green.100",
      },
      default: {
        alignSelf: "flex-end",
        backgroundColor: "red.100",
      },
    },
  },

  defaultVariants: {
    variant: "default",
  },
});

type Props = MessageType & {
  handleDelete: (id: string) => void;
};

const components: Options["components"] = {
  //   h1: ({ className, ...props }: ComponentProps<"h1">) => <h1 {...props} />,
  // more components + custom components

  code(props) {
    const { children, className, ...rest } = props;
    const text = String(children);

    // Inline code
    if (!text.includes("```")) {
      return (
        <code {...rest} className={className}>
          {children}
        </code>
      );
    }

    const match = /language-(\w+)/.exec(className || "");
    const type = "text/plain";
    const blob = new Blob([text], { type });
    const clipboardItem = [new ClipboardItem({ [type]: blob })];
    return (
      <div style={{ position: "relative" }}>
        {match ? (
          <Prism language={match[1]}>{text.replace(/\n$/, "")}</Prism>
        ) : (
          <code {...rest} className={className}>
            {children}
          </code>
        )}
        <Button
          onClick={() => {
            navigator.clipboard.write(clipboardItem);
          }}
          style={{
            position: "absolute",
            top: 0,
            right: 0,
          }}
        >
          Copy
        </Button>
      </div>
    );
  },
};

const MemoizedReactMarkdown = memo(
  ReactMarkdown,
  (prevProps, nextProps) =>
    prevProps.children === nextProps.children &&
    prevProps.className === nextProps.className,
);

export function Message({ role, id, content, handleDelete }: Props) {
  return role === "system" ? null : (
    <StyledMessage variant={role === "user" ? "user" : undefined} key={id}>
      {role === "user" ? "User: " : "AI: "}
      <div style={{ flexGrow: 1 }}>
        <MemoizedReactMarkdown components={components}>
          {content}
        </MemoizedReactMarkdown>
      </div>
      <Button onClick={() => handleDelete(id)}>Delete</Button>
    </StyledMessage>
  );
}
