import {
  useEffect,
  useState,
  type ClassAttributes,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import type { ExtraProps } from "react-markdown";
import { CopyButton } from "../CopyButton";
import { styled } from "../../../../../styled-system/jsx";
import { toJsxRuntime } from "hast-util-to-jsx-runtime";
import { Fragment, jsxs, jsx } from "react/jsx-runtime";
import { refractor } from "refractor/core";
import { isSupportedLanguage, languageLoaders } from "./refractorLanguages";

const StyledCopyButton = styled(CopyButton, {
  base: {
    position: "absolute",
    top: 0,
    right: 0,
  },
});

const StyledPre = styled("pre", {
  base: {
    position: "relative",
    whiteSpace: "pre-wrap",
    padding: "16rem 12rem",
    margin: "8rem 0",

    backgroundColor: "white",
    _dark: {
      backgroundColor: "gray.800",
    },
  },
});

const alreadyLoaded = new Set<string>();

async function renderCode(
  isInline: boolean,
  text: string,
  language: string | undefined,
) {
  if (isInline || !language || !isSupportedLanguage(language)) {
    return text;
  }

  if (!alreadyLoaded.has(language)) {
    // Race condition (multiple calls before the language is loaded once) is negligible because refractor only registers once, so all that will happen is that we possibly import the same language multiple times. Which is the only thing that we generally avoid with this check here.
    refractor.register((await languageLoaders[language]()).default);
    alreadyLoaded.add(language);
  }

  const tree = refractor.highlight(text, language);
  return toJsxRuntime(tree, { Fragment, jsxs, jsx });
}

export function Code(
  props: ClassAttributes<HTMLElement> &
    HTMLAttributes<HTMLElement> &
    ExtraProps,
) {
  const { children, className } = props;
  const text = children ? String(children) : "";
  const language = /language-(\w+)/.exec(className || "")?.[1] || "";
  const isInline = !text.includes("\n");

  const [highlightedCode, setHighlightedCode] = useState<ReactNode>();

  useEffect(() => {
    renderCode(isInline, text, language).then((code) => {
      setHighlightedCode(code);
    });
  }, [isInline, text, language, className]);

  // Inline code
  if (isInline) {
    return <code className={className}>{text}</code>;
  }

  return (
    <StyledPre>
      <code>{highlightedCode || text}</code>
      <StyledCopyButton>{text}</StyledCopyButton>
    </StyledPre>
  );
}
