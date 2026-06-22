"use client";

import { useState } from "react";
import { CheckIcon, CopyIcon } from "@/components/icons";

type InstallCommandPanelProps = {
  command: string;
};

export function InstallCommandPanel({ command }: InstallCommandPanelProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(command);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const textArea = document.createElement("textarea");
      textArea.value = command;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="overflow-hidden rounded-[1.75rem] border border-neutral-800 bg-neutral-900/90 shadow-[0_20px_50px_rgba(0,0,0,0.16)] ring-1 ring-neutral-800/80">
      <div className="px-5 pb-5 pt-7 sm:px-7 sm:pb-7 sm:pt-8">
        <p className="text-sm font-medium text-neutral-500">Recommended</p>
        <div className="mt-5 flex items-center gap-3">
          <div className="min-w-0 flex-1 overflow-x-auto font-mono text-sm leading-7 text-neutral-400 sm:text-[1.02rem]">
            <span className="select-none text-neutral-600">$ </span>
            {command}
          </div>
          <button
            type="button"
            onClick={handleCopy}
            className="shrink-0 rounded-md p-2 text-neutral-500 transition-colors hover:bg-neutral-800 hover:text-neutral-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-500"
            aria-label="Copy install command"
          >
            {copied ? <CheckIcon size={18} /> : <CopyIcon size={18} />}
          </button>
        </div>
      </div>
    </div>
  );
}
