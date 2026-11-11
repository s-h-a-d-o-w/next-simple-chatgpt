import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { memo } from "react";
import { padNewlines } from "./padNewlines";
import { Code } from "./Code";
import { HeaderCell, Cell, Row } from "./TableElements";

const remarkPlugins = [remarkGfm];

const MemoizedReactMarkdown = memo(
  ReactMarkdown,
  (prevProps, nextProps) => prevProps.children === nextProps.children,
);

export function Markdown({ children }: { children: React.ReactNode }) {
  return typeof children === "string" ? (
    <MemoizedReactMarkdown
      remarkPlugins={remarkPlugins}
      components={{
        code: Code,
        // Prevent redundant `pre`
        pre: ({ children: c }) => c,
        th: HeaderCell,
        td: Cell,
        tr: Row,
      }}
    >
      {padNewlines(children)}
    </MemoizedReactMarkdown>
  ) : (
    children
  );
}
