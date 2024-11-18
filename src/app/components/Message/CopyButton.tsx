import { IconButton } from "@/components/IconButton";
import { useState } from "react";

type Props = {
  content: string;

  className?: string;
};

export function CopyButton({ className, content }: Props) {
  const [hasCopied, setHasCopied] = useState(false);
  const type = "text/plain";
  const blob = new Blob([content], { type });

  // Only works with HTTPS.
  const clipboardItem = typeof window !== "undefined" && [
    new ClipboardItem({ [type]: blob }),
  ];

  return !clipboardItem ? null : (
    <IconButton
      name={hasCopied ? "check" : "copy"}
      iconSize="md"
      className={className}
      disabled={hasCopied}
      onClick={() => {
        navigator.clipboard.write(clipboardItem);
        setHasCopied(true);
        setTimeout(() => {
          setHasCopied(false);
        }, 1000);
      }}
    />
  );
}
