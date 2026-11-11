import type { ReasoningUIPart, TextUIPart } from "ai";
import { styled } from "@/styled-system/jsx";
import { Markdown } from "./Markdown";

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

export function Part({ part }: { part: TextUIPart | ReasoningUIPart }) {
  const markdown = <Markdown>{part.text}</Markdown>;

  return part.type === "reasoning" ? (
    <Reasoning>{markdown}</Reasoning>
  ) : (
    markdown
  );
}
