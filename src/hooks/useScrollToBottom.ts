import { useCallback, useEffect, useMemo, useRef } from "react";
import { UIMessage } from "ai";

export function useScrollToBottom(doScroll: boolean, messages: UIMessage[]) {
  const hasUserScrolledUp = useRef(false);

  // Makes it possible to scroll to bottom whenever last non-user message changes
  const scrollKey = useMemo(() => {
    const last = messages.at(-1);
    if (!last || last.role === "user") return 0;
    const text = last.parts.filter((p) => p.type === "text").at(-1)?.text;
    return text?.length;
  }, [messages]);

  // Detect whether user scrolled up
  const handleUserScroll = useCallback(() => {
    hasUserScrolledUp.current =
      window.scrollY < document.body.scrollHeight - window.innerHeight - 10;
  }, []);
  useEffect(() => {
    window.addEventListener("scroll", handleUserScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleUserScroll);
  }, [handleUserScroll]);

  // Behavior only at start and end of scrolling
  useEffect(() => {
    // End of scrolling
    if (!doScroll && !hasUserScrolledUp.current) {
      window.scrollTo({
        top: document.body.scrollHeight,
        behavior: "instant",
      });
    }

    hasUserScrolledUp.current = false;
  }, [doScroll]);

  // Throughout scrolling
  useEffect(() => {
    if (!doScroll || hasUserScrolledUp.current) {
      return;
    }

    window.scrollTo({
      top: document.body.scrollHeight,
      behavior: "instant",
    });
  }, [doScroll, scrollKey]);
}
