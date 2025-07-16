import {
  useDeferredValue,
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
import {
  isSupportedLanguage,
  languageLoaders,
  type SupportedLanguage,
} from "./refractorLanguages";

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
async function loadLanguage(language: SupportedLanguage) {
  // Race condition (multiple calls before the language is loaded once) is negligible because refractor only registers once, so all that will happen is that we possibly import the same language multiple times. Which is the only thing that we generally avoid by using the alreadyLoaded Set.
  refractor.register((await languageLoaders[language]()).default);
  alreadyLoaded.add(language);
}

function renderCode(text: string, language: SupportedLanguage) {
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
  const isLanguageLoaded = alreadyLoaded.has(language);

  const [highlightedCode, setHighlightedCode] = useState<ReactNode>(
    isLanguageLoaded && isSupportedLanguage(language)
      ? renderCode(text, language)
      : "",
  );
  const deferredHighlightedCode = useDeferredValue(highlightedCode);

  useEffect(() => {
    if (!isInline && !isLanguageLoaded && isSupportedLanguage(language)) {
      loadLanguage(language).then(() => {
        setHighlightedCode(renderCode(text, language));
      });
    }
  }, [isInline, text, language, isLanguageLoaded]);

  // Inline code
  if (isInline) {
    return <code className={className}>{text}</code>;
  }

  return (
    <StyledPre>
      <code>{deferredHighlightedCode || text}</code>
      <StyledCopyButton>{text}</StyledCopyButton>
    </StyledPre>
  );
}
