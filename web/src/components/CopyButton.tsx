import { useEffect, useState } from "react";

/** Copies `text` and says "Copied" for a moment. */
export function CopyButton({ text, label = "Copy", className }: { text: string; label?: string; className?: string }) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 1600);
    return () => clearTimeout(timer);
  }, [copied]);

  return (
    <button
      type="button"
      className={className}
      onClick={() => navigator.clipboard.writeText(text).then(() => setCopied(true))}
    >
      <span aria-live="polite">{copied ? "Copied" : label}</span>
    </button>
  );
}
