import { fonts } from "@/utils/fonts";
import { ClassAttributes, HTMLAttributes } from "react";
import { ExtraProps } from "react-markdown";
import { Prism } from "react-syntax-highlighter";
// import prismStyle from "react-syntax-highlighter/dist/esm/styles/prism/prism";
import {
  oneLight,
  oneDark,
} from "react-syntax-highlighter/dist/esm/styles/prism";
import { css } from "../../../../styled-system/css";
import { token } from "../../../../styled-system/tokens";
import { CopyButton } from "./CopyButton";
import { useIsDarkMode } from "@/hooks/useDarkMode";

export function Code(
  props: ClassAttributes<HTMLElement> &
    HTMLAttributes<HTMLElement> &
    ExtraProps,
) {
  const { children, className } = props;
  const text = String(children);
  const [isDarkMode] = useIsDarkMode();

  // Inline code
  if (!text.includes("\n")) {
    return <code className={className}>{children}</code>;
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
