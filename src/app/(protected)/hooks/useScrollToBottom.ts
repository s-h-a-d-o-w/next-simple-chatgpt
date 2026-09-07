import { useCallback, useEffect, useRef } from "react";

// Scroll to bottom while the document grows (e.g. a response streaming in)
export function useScrollToBottom(doScroll: boolean) {
  const hasUserScrolledUp = useRef(false);

  // Detect whether user scrolled up
  const handleUserScroll = useCallback(() => {
    hasUserScrolledUp.current =
      window.scrollY < document.body.scrollHeight - window.innerHeight - 10;
  }, []);
  useEffect(() => {
    window.addEventListener("scroll", handleUserScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleUserScroll);
  }, [handleUserScroll]);

  // At start and end of scrolling
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
    if (!doScroll) {
      return;
    }

    const scrollToBottom = () => {
      if (hasUserScrolledUp.current) {
        return;
      }

      console.log("scrolling to bottom");
      window.scrollTo({
        top: document.body.scrollHeight,
        behavior: "instant",
      });
    };
    scrollToBottom();

    const observer = new ResizeObserver(scrollToBottom);
    observer.observe(document.body);

    return () => observer.disconnect();
  }, [doScroll]);
}
