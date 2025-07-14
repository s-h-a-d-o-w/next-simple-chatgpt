import {
  useEffect,
  useState,
  type ClassAttributes,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import type { ExtraProps } from "react-markdown";
import { CopyButton } from "./CopyButton";
import { styled } from "../../../../styled-system/jsx";
import { createElement } from "react";

const StyledCopyButton = styled(CopyButton, {
  base: {
    position: "absolute",
    top: 0,
    right: 0,
  },
});

const alreadyLoaded = new Set<string>();
const loadingPromises = new Map<string, Promise<void>>();

async function renderCode(
  isInline: boolean,
  text: string,
  language: string | undefined,
  className: string | undefined,
) {
  if (isInline || !language) {
    return text;
  }

  if (!alreadyLoaded.has(language)) {
    if (!loadingPromises.has(language)) {
      const loadPromise = new Promise<void>((resolve, reject) => {
        const script = document.createElement("script");
        script.src = `https://cdn.jsdelivr.net/npm/prismjs@v1.x/components/prism-${language}.min.js`;
        script.onload = () => {
          alreadyLoaded.add(language);
          resolve();
        };
        script.onerror = () =>
          reject(new Error(`Failed to load language: ${language}`));
        document.body.appendChild(script);
      });

      loadingPromises.set(language, loadPromise);
    }

    await loadingPromises.get(language);
  }

  return createElement("code", {
    className,
    dangerouslySetInnerHTML: {
      __html: Prism.highlight(text, Prism.languages[language], language),
    },
  });
}

export function PrismCode(
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
    renderCode(isInline, text, language, className).then((code) => {
      setHighlightedCode(code);
    });
  }, [isInline, text, language, className]);

  // Inline code
  if (isInline) {
    return <code className={className}>{text}</code>;
  }

  return highlightedCode ? (
    <div style={{ position: "relative" }}>
      <pre>{highlightedCode}</pre>
      <StyledCopyButton>{text}</StyledCopyButton>
    </div>
  ) : null;
}
