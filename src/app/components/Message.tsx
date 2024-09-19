import { type Message as MessageType } from "ai/react";
import { Button } from "./Button";
import { styled } from "../../../styled-system/jsx";
import ReactMarkdown, { type Options } from "react-markdown";
import { memo } from "react";
import { Prism } from "react-syntax-highlighter";
import { css } from "../../../styled-system/css";

const StyledMessage = styled("div", {
  base: {
    display: "flex",
    flexDirection: "column",
    gap: "4rem",
    padding: "8rem",
    alignItems: "flex-start",

    width: "80%",
  },

  variants: {
    variant: {
      user: {
        alignSelf: "flex-start",
        backgroundColor: "amber.100",
      },
      default: {
        alignSelf: "flex-end",
        backgroundColor: "white",
      },
    },
  },

  defaultVariants: {
    variant: "default",
  },
});

type Props = MessageType & {
  handleDelete?: (id: string) => void;
};

const components: Options["components"] = {
  //   h1: ({ className, ...props }: ComponentProps<"h1">) => <h1 {...props} />,
  // more components + custom components

  // pre() {

  // },
  code(props) {
    const { children, className } = props;
    const text = String(children);

    // Inline code
    if (!text.includes("\n")) {
      return <code className={className}>{children}</code>;
    }

    const match = /language-(\w+)/.exec(className || "");
    const type = "text/plain";
    const blob = new Blob([text], { type });
    const clipboardItem = [new ClipboardItem({ [type]: blob })];
    return (
      <div style={{ position: "relative" }}>
        {match ? (
          <Prism
            language={match[1]}
            showLineNumbers={true}
            wrapLines={true}
            // Superior to `wrapLongLines` because line numbers stay correct this way.
            // PROBLEM: makes it impossible to copy just a selection of the code. But we need it for the code not to render off screen.
            lineProps={() => ({
              style: {
                display: "flex",
                flexWrap: "wrap",
                textWrap: "wrap",
              },
            })}
            codeTagProps={{
              className: css({
                fontSize: "sm",
                md: {
                  fontSize: "md",
                },
              }),
            }}
          >
            {text}
          </Prism>
        ) : (
          <code className={className}>{children}</code>
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

const RoleTag = styled("div", {
  base: {
    borderRadius: "4rem",
    padding: "0 8rem",

    fontSize: "xs",
    md: {
      fontSize: "sm",
    },
  },

  variants: {
    isUser: {
      true: {
        backgroundColor: "green.300",
      },
      false: {
        backgroundColor: "red.300",
      },
    },
  },
});

export function Message({ role, id, content, handleDelete }: Props) {
  return role === "system" ? null : (
    <StyledMessage variant={role === "user" ? "user" : undefined} key={id}>
      <RoleTag isUser={role === "user"}>
        {role === "user" ? "User " : "AI "}
      </RoleTag>
      <div style={{ flexGrow: 1 }}>
        <MemoizedReactMarkdown components={components}>
          {/* Markdown obviously swallows \n */}
          {content.replace(/\n/g, "  \n")}
        </MemoizedReactMarkdown>
      </div>
      {handleDelete && <Button onClick={() => handleDelete(id)}>Delete</Button>}
    </StyledMessage>
  );
}
