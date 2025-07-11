import { useIsDarkMode } from "@/hooks/useDarkMode";
import { fonts } from "@/utils/fonts";
import { ClassAttributes, HTMLAttributes, memo } from "react";
import { ExtraProps } from "react-markdown";
import {
  createElement,
  Prism,
  SyntaxHighlighterProps,
} from "react-syntax-highlighter";
import {
  oneDark,
  oneLight,
} from "react-syntax-highlighter/dist/esm/styles/prism";
import { css } from "../../../../styled-system/css";
import { token } from "../../../../styled-system/tokens";
import { CopyButton } from "./CopyButton";
import { styled } from "../../../../styled-system/jsx";

const Row = memo(
  function Row({
    node,
    stylesheet,
    useInlineStyles,
    _key,
  }: Omit<Parameters<typeof createElement>[0], "key"> & {
    _key: string | number;
  }) {
    return createElement({ node, stylesheet, useInlineStyles, key: _key });
  },
  (previous, next) => {
    return (
      previous.node.children === next.node.children ||
      JSON.stringify(previous.node.children) ===
        JSON.stringify(next.node.children)
    );
  },
);

function Renderer({
  rows,
  stylesheet,
  useInlineStyles,
}: Parameters<NonNullable<SyntaxHighlighterProps["renderer"]>>[0]) {
  return rows.map((node, i) => (
    <Row
      key={`code-segement${i}`}
      _key={`code-segement${i}`}
      node={node}
      stylesheet={stylesheet}
      useInlineStyles={useInlineStyles}
    />
  ));
}

const StyledCopyButton = styled(CopyButton, {
  base: {
    position: "absolute",
    top: 0,
    right: 0,
  },
});

const codeTagClassname = css({
  overflowWrap: "anywhere",
  fontSize: "md",
  fontWeight: 500,
  textShadow: "none",
});

export function Code(
  props: ClassAttributes<HTMLElement> &
    HTMLAttributes<HTMLElement> &
    ExtraProps,
) {
  const { children, className } = props;
  const text = children ? String(children) : "";
  const [isDarkMode] = useIsDarkMode();

  // Inline code
  if (!text.includes("\n")) {
    return <code className={className}>{text}</code>;
  }

  return (
    <div style={{ position: "relative" }}>
      <Prism
        style={isDarkMode ? oneDark : oneLight}
        customStyle={{
          background: isDarkMode ? token("colors.gray.800") : "white",
        }}
        language={/language-(\w+)/.exec(className || "")?.[1] || ""}
        wrapLongLines
        codeTagProps={{
          className: codeTagClassname,
          style: fonts.robotoMono.style,
        }}
        renderer={Renderer}
      >
        {text}
      </Prism>
      <StyledCopyButton content={text} />
    </div>
  );
}
