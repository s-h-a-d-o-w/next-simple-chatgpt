import { memo, useState } from "react";
import remarkGfm from "remark-gfm";
import { Code } from "./Code";
import { padNewlines } from "./padNewlines";
import { HeaderCell, Cell, Row } from "./TableElements";
import ReactMarkdown from "react-markdown";
import { styled } from "../../../../styled-system/jsx";
import { IconButton } from "@/components/IconButton";
import { CopyButton } from "./CopyButton";
import Spinner from "@/components/Spinner";
import { UIMessage, ToolUIPart, DynamicToolUIPart } from "ai";

// TODO: Should probably extract this and also use it for system messages at some point
export const Expandable = styled("div", {
  base: {
    display: "flex",
    alignItems: "center",
    gap: "4rem",
    position: "relative",
    marginY: "6rem",
    padding: "6rem",
    wordBreak: "break-all",

    border: "1px solid",
    borderColor: "gray.200",
    _dark: {
      backgroundColor: "gray.800",
      borderColor: "gray.500",
    },
  },
  variants: {
    isExpanded: {
      false: {
        cursor: "pointer",
        maxHeight: "50rem",
        overflowY: "hidden",
      },
    },
  },
});

const MemoizedReactMarkdown = memo(
  ReactMarkdown,
  (prevProps, nextProps) => prevProps.children === nextProps.children,
);

export function ToolInvocation({
  toolInvocation,
}: {
  toolInvocation: ToolUIPart | DynamicToolUIPart;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const toolName =
    toolInvocation.type === "dynamic-tool"
      ? toolInvocation.toolName
      : toolInvocation.type.split("-")[1];
  const output =
    toolInvocation.state === "output-available"
      ? toolInvocation.output
      : toolInvocation.state === "output-error"
        ? toolInvocation.errorText
        : undefined;

  return toolInvocation.state === "input-streaming" ? null : (
    <Expandable isExpanded={isExpanded}>
      {toolName} (
      {Object.entries(toolInvocation.input as Record<string, unknown>)
        .map(([key, value]) => `${key}: ${value}`)
        .join(", ")}
      ):{" "}
      {output ? (
        isExpanded ? (
          JSON.stringify(output)
        ) : (
          "..."
        )
      ) : (
        <Spinner
          style={{ display: "inline-block", width: "16rem", height: "16rem" }}
        />
      )}
      {Boolean(output) && (
        <div
          style={{
            position: "absolute",
            top: "4rem",
            right: "4rem",
            display: "flex",
            gap: "6rem",
          }}
        >
          {<CopyButton>{JSON.stringify(output)}</CopyButton>}
          <IconButton
            name={isExpanded ? "collapse" : "expand"}
            iconSize="sm"
            onClick={() => setIsExpanded(!isExpanded)}
          />
        </div>
      )}
    </Expandable>
  );
}

export function Part({
  part,
}: {
  part: NonNullable<UIMessage["parts"]>[number];
}) {
  return part.type === "text" ? (
    <MemoizedReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        code: Code,
        pre: ({ children }) => children,
        th: HeaderCell,
        td: Cell,
        tr: Row,
      }}
    >
      {padNewlines(part.text)}
    </MemoizedReactMarkdown>
  ) : part.type === "dynamic-tool" ? (
    <ToolInvocation toolInvocation={part} />
  ) : part.type.startsWith("tool-") ? (
    <ToolInvocation toolInvocation={part as ToolUIPart} />
  ) : part.type === "reasoning" && part.text !== "" ? (
    <p>Reasoning: {part.text}</p>
  ) : part.type === "file" ? (
    <p>
      File ({part.mediaType}): {part.url}
    </p>
  ) : null;
}
