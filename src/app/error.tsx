"use client";

import { Centered } from "@/components/Centered";

export default function Error() {
  // In a commercial project, we would obviously send error details to some error tracking service.

  console.log("Maybe the history got corrupted?");
  console.log(localStorage.getItem("history"));

  return (
    <Centered>
      <div style={{ width: "75%", maxWidth: "400rem", textAlign: "center" }}>
        If this was a commercial project, I&apos;d say something like: &quot;We
        have encountered an unexpected error. It has been reported automatically
        but if you keep experiencing this please reach out to support.&quot;
      </div>
    </Centered>
  );
}
