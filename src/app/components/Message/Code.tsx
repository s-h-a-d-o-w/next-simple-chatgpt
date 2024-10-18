import { fonts } from "@/utils/fonts";
import { ClassAttributes, HTMLAttributes } from "react";
import { ExtraProps } from "react-markdown";
import { Prism } from "react-syntax-highlighter";
import prismStyle from "react-syntax-highlighter/dist/esm/styles/prism/prism";
import { css } from "../../../../styled-system/css";
import { CopyButton } from "./CopyButton";

export function Code(
  props: ClassAttributes<HTMLElement> &
    HTMLAttributes<HTMLElement> &
    ExtraProps,
) {
  const { children, className } = props;
  const text = String(children);

  // Inline code
  if (!text.includes("\n")) {
    return <code className={className}>{children}</code>;
  }

  return (
    <div style={{ position: "relative" }}>
      <Prism
        style={prismStyle}
        language={/language-(\w+)/.exec(className || "")?.[1] || ""}
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
      <CopyButton
        content={text}
        className={css({
          position: "absolute",
          top: 0,
          right: 0,
        })}
      />
    </div>
  );
}
