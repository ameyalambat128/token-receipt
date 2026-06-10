"use client";

import { useState } from "react";
import { CheckIcon, CopyIcon } from "@/components/icons";
import { cn } from "@/lib/utils";

type CommandItem = {
  label: string;
  command: string;
};

type InstallCommandPanelProps = {
  items: CommandItem[];
};

export function InstallCommandPanel({ items }: InstallCommandPanelProps) {
  const [activeLabel, setActiveLabel] = useState(items[0]?.label ?? "");
  const [copied, setCopied] = useState(false);

  const activeItem =
    items.find((item) => item.label === activeLabel) ?? items[0] ?? null;

  const handleCopy = async () => {
    if (!activeItem) return;

    try {
      await navigator.clipboard.writeText(activeItem.command);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const textArea = document.createElement("textarea");
      textArea.value = activeItem.command;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!activeItem) return null;

  return (
    <div className="overflow-hidden rounded-[1.75rem] border border-neutral-800 bg-neutral-900/90 shadow-[0_20px_50px_rgba(0,0,0,0.16)] ring-1 ring-neutral-800/80">
      <div className="flex items-center gap-3 border-b border-neutral-800 px-4 py-4 sm:px-5">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-neutral-300 font-mono text-sm text-neutral-950">
          &gt;_
        </div>

        <div className="flex flex-1 flex-wrap gap-2">
          {items.map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={() => setActiveLabel(item.label)}
              className={cn(
                "rounded-full border px-3 py-1.5 font-sans text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-500",
                item.label === activeLabel
                  ? "border-neutral-700 bg-black text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)]"
                  : "border-transparent bg-transparent text-neutral-500 hover:text-neutral-200",
              )}
              aria-pressed={item.label === activeLabel}
            >
              {item.label}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={handleCopy}
          className="rounded-md p-2 text-neutral-500 transition-colors hover:bg-neutral-800 hover:text-neutral-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-500"
          aria-label="Copy command"
        >
          {copied ? <CheckIcon size={18} /> : <CopyIcon size={18} />}
        </button>
      </div>

      <div className="px-4 py-6 sm:px-5">
        <div className="overflow-x-auto font-mono text-[1.02rem] leading-8 text-neutral-400">
          <span className="select-none text-neutral-600">$ </span>
          {activeItem.command}
        </div>
      </div>
    </div>
  );
}
