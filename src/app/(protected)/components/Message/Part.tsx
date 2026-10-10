import { memo } from "react";
import remarkGfm from "remark-gfm";
import { Code } from "./Code";
import { padNewlines } from "./padNewlines";
import { HeaderCell, Cell, Row } from "./TableElements";
import ReactMarkdown from "react-markdown";
import { UIMessage } from "ai";
import { styled } from "@/styled-system/jsx";

const remarkPlugins = [remarkGfm];

const MemoizedReactMarkdown = memo(
  ReactMarkdown,
  (prevProps, nextProps) => prevProps.children === nextProps.children,
);

const Reasoning = styled("div", {
  base: {
    fontSize: "md",
    opacity: 0.65,

    marginBottom: "16rem",
    _lastOfType: {
      marginBottom: "32rem",
    },
  },
});

export function Part({
  part,
}: {
  part: NonNullable<UIMessage["parts"]>[number];
}) {
  const markdown =
    part.type === "text" || part.type === "reasoning" ? (
      <MemoizedReactMarkdown
        remarkPlugins={remarkPlugins}
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
    ) : undefined;

  return part.type === "reasoning" ? (
    <Reasoning>{markdown}</Reasoning>
  ) : (
    markdown
  );
}
