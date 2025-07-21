import { memo, useState } from "react";
import remarkGfm from "remark-gfm";
import { Code } from "./Code";
import { padNewlines } from "./padNewlines";
import { HeaderCell, Cell, Row } from "./TableElements";
import ReactMarkdown from "react-markdown";
import { Message as MessageType } from "ai/react";
import type { ToolInvocation as ToolInvocationType } from "@ai-sdk/ui-utils";
import { styled } from "../../../../styled-system/jsx";
import { IconButton } from "@/components/IconButton";
import { CopyButton } from "./CopyButton";
import Spinner from "@/components/Spinner";

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
  toolInvocation: ToolInvocationType;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  return (
    <Expandable isExpanded={isExpanded}>
      {toolInvocation.toolName} (
      {Object.entries(toolInvocation.args)
        .map(([key, value]) => `${key}: ${value}`)
        .join(", ")}
      ):{" "}
      {toolInvocation.state === "result" ? (
        isExpanded ? (
          JSON.stringify(toolInvocation.result)
        ) : (
          "..."
        )
      ) : (
        <Spinner
          style={{ display: "inline-block", width: "16rem", height: "16rem" }}
        />
      )}
      {toolInvocation.state === "result" && (
        <div
          style={{
            position: "absolute",
            top: "4rem",
            right: "4rem",
            display: "flex",
            gap: "6rem",
          }}
        >
          {<CopyButton>{JSON.stringify(toolInvocation.result)}</CopyButton>}
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
  part: NonNullable<MessageType["parts"]>[number];
}) {
  return part.type === "text" ? (
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
      {padNewlines(part.text)}
    </MemoizedReactMarkdown>
  ) : part.type === "tool-invocation" ? (
    <ToolInvocation toolInvocation={part.toolInvocation} />
  ) : part.type === "reasoning" ? (
    <p>Reasoning: {part.reasoning}</p>
  ) : part.type === "source" ? (
    <p>
      Source ({part.source.title}): {part.source.url}
    </p>
  ) : part.type === "file" ? (
    <p>
      File ({part.mimeType}): {part.data}
    </p>
  ) : null;
}
