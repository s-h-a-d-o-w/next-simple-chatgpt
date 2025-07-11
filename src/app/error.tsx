"use client";

import { CenteredMain } from "@/components/CenteredMain";
import { styled } from "../../styled-system/jsx";

const StyledMessage = styled("div", {
  base: {
    width: "80%",
    maxWidth: "400rem",
    textAlign: "center",
  },
});

export default function GlobalError() {
  // In a commercial project, we would obviously send error details to some error tracking service.

  const history = localStorage.getItem("history");
  if (history) {
    try {
      JSON.parse(history);
    } catch (_) {
      // This has happened to me once but I've not been able to reproduce it.
      console.error("History might be corrupted:");
      console.error(history);
    }
  }

  return (
    <CenteredMain>
      <StyledMessage>
        If this was a commercial project, I&apos;d say something like: &quot;We
        have encountered an unexpected error. It has been reported automatically
        but if you keep experiencing this please reach out to support.&quot;
      </StyledMessage>
    </CenteredMain>
  );
}
