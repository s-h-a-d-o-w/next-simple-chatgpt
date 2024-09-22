"use client";

import { Centered } from "@/components/Centered";

export default function Error() {
  // In a commercial project, we would obviously send error details to some error tracking service.

  return (
    <Centered>
      <div style={{ maxWidth: "200rem", textAlign: "center" }}>
        If this was a commercial project, I&apos;d say something like: &quot;We
        have encountered an unexpected error. It has been reported automatically
        but if you keep experiencing this please reach out to support.&quot;
      </div>
    </Centered>
  );
}
