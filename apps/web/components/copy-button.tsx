"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { CheckIcon, CopyIcon } from "@/components/icons";

export function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.button
      type="button"
      onClick={handleCopy}
      whileTap={prefersReducedMotion ? undefined : { scale: 0.85 }}
      transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
      className="shrink-0 rounded-md p-2 text-neutral-500 transition-colors hover:bg-neutral-800 hover:text-neutral-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-500"
      aria-label={copied ? "Copied" : "Copy to clipboard"}
    >
      <span className="relative block h-[18px] w-[18px]">
        <AnimatePresence initial={false} mode="popLayout">
          <motion.span
            key={copied ? "check" : "copy"}
            initial={prefersReducedMotion ? false : { scale: 0.4, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={prefersReducedMotion ? undefined : { scale: 0.4, opacity: 0 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className={`absolute inset-0 ${copied ? "text-emerald-400" : ""}`}
          >
            {copied ? <CheckIcon size={18} /> : <CopyIcon size={18} />}
          </motion.span>
        </AnimatePresence>
      </span>
    </motion.button>
  );
}
