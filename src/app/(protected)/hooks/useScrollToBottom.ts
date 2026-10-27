import { useCallback, useEffect, useRef } from "react";

// Scroll to bottom while the document grows (e.g. a response streaming in)
export function useScrollToBottom(doScroll: boolean) {
  const hasUserScrolledUp = useRef(false);
  const lastScrollY = useRef(0);

  // Detect whether user scrolled up.
  // Only upward movement counts - content growing between our scrollTo() and the
  // (async) scroll event must not be mistaken for the user scrolling up.
  const handleUserScroll = useCallback(() => {
    const { innerHeight, scrollY } = window;
    const isAtBottom = scrollY >= document.body.scrollHeight - innerHeight - 10;

    if (isAtBottom) {
      hasUserScrolledUp.current = false;
    } else if (scrollY < lastScrollY.current) {
      hasUserScrolledUp.current = true;
    }

    lastScrollY.current = scrollY;
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
