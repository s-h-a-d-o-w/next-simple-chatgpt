import { memo } from "react";
import remarkGfm from "remark-gfm";
import { Code } from "./Code";
import { padNewlines } from "./padNewlines";
import { HeaderCell, Cell, Row } from "./TableElements";
import ReactMarkdown from "react-markdown";
import { UIMessage } from "ai";

const remarkPlugins = [remarkGfm];

const MemoizedReactMarkdown = memo(
  ReactMarkdown,
  (prevProps, nextProps) => prevProps.children === nextProps.children,
);

export function Part({
  part,
}: {
  part: NonNullable<UIMessage["parts"]>[number];
}) {
  return part.type === "text" ? (
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
}
