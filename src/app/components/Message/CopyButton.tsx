import { IconButton } from "@/components/IconButton";
import { config } from "@/config";
import { useMemo, useState } from "react";

type Props = {
  children: string;

  className?: string;
};

export function CopyButton({ className, children }: Props) {
  const [hasCopied, setHasCopied] = useState(false);

  // Only works with HTTPS.
  const clipboardItem = useMemo(
    () =>
      typeof window !== "undefined"
        ? [
            new ClipboardItem({
              "text/plain": new Blob([children], { type: "text/plain" }),
            }),
          ]
        : undefined,
    [children],
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
        }, config.ui.copyStatusTimeout);
      }}
    />
  );
}
