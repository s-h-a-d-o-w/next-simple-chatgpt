import { useCallback, useEffect, useMemo, useRef } from "react";
import { UIMessage } from "ai";

export function useScrollToBottom(doScroll: boolean, messages: UIMessage[]) {
  const hasUserScrolledUp = useRef(false);
  const scrollKey = useMemo(() => {
    const last = messages.at(-1);
    if (!last || last.role === "user") return 0;
    const text = last.parts.filter((p) => p.type === "text").at(-1)?.text;
    return text?.length;
  }, [messages]);

  const handleScroll = useCallback(() => {
    hasUserScrolledUp.current =
      window.scrollY < document.body.scrollHeight - window.innerHeight - 10;
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  useEffect(() => {
    if (!doScroll || hasUserScrolledUp.current) return;

    window.scrollTo({
      top: document.body.scrollHeight,
      behavior: "instant",
    });
  }, [doScroll, scrollKey]);
}
