import { Button } from "@/components/Button";
import { fonts } from "@/utils/fonts";
import { ClassAttributes, HTMLAttributes, useState } from "react";
import { ExtraProps } from "react-markdown";
import { Prism } from "react-syntax-highlighter";
import prismStyle from "react-syntax-highlighter/dist/esm/styles/prism/prism";
import { css } from "../../../../styled-system/css";

export function Code(
  props: ClassAttributes<HTMLElement> &
    HTMLAttributes<HTMLElement> &
    ExtraProps,
) {
  const { children, className } = props;
  const text = String(children);

  const [hasCopied, setHasCopied] = useState(false);

  // Inline code
  if (!text.includes("\n")) {
    return <code className={className}>{children}</code>;
  }

  const match = /language-(\w+)/.exec(className || "");
  const type = "text/plain";
  const blob = new Blob([text], { type });

  // Only works with HTTPS and on localhost.
  const clipboardItem = [new ClipboardItem({ [type]: blob })];
  return (
    <div style={{ position: "relative" }}>
      <Prism
        style={prismStyle}
        language={match?.[1] || ""}
        wrapLongLines
        codeTagProps={{
          className: css({
            overflowWrap: "anywhere",

            fontSize: "md",
            fontWeight: 500,
            textShadow: "none",
          }),
          style: fonts.robotoMono.style,
        }}
      >
        {text}
      </Prism>
      <Button
        disabled={hasCopied}
        onClick={() => {
          navigator.clipboard.write(clipboardItem);
          setHasCopied(true);
          setTimeout(() => {
            setHasCopied(false);
          }, 1000);
        }}
        style={{
          position: "absolute",
          top: 0,
          right: 0,
        }}
      >
        {hasCopied ? "Done" : "Copy"}
      </Button>
    </div>
  );
}
