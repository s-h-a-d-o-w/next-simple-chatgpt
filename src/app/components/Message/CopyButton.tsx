import { IconButton } from "@/components/IconButton";
import { useMemo, useState } from "react";

type Props = {
  content: string;

  className?: string;
};

const COPY_STATUS_TIMEOUT = 1000;

export function CopyButton({ className, content }: Props) {
  const [hasCopied, setHasCopied] = useState(false);

  // Only works with HTTPS.
  const clipboardItem = useMemo(
    () =>
      typeof window !== "undefined"
        ? [
            new ClipboardItem({
              "text/plain": new Blob([content], { type: "text/plain" }),
            }),
          ]
        : undefined,
    [content],
  );

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
        }, COPY_STATUS_TIMEOUT);
      }}
    />
  );
}
