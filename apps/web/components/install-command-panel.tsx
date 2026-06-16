"use client";

import { useState } from "react";
import { CheckIcon, CopyIcon } from "@/components/icons";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";

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
    <Card className="overflow-hidden border-white/10 bg-black/30">
      <Tabs value={activeLabel} onValueChange={setActiveLabel}>
        <CardHeader className="gap-4 border-b border-white/8 pb-5">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-[color:var(--paper)] font-mono text-sm font-semibold text-[color:var(--paper-ink)]">
                &gt;_
              </div>
              <div>
                <CardTitle className="text-base">
                  Install or run locally
                </CardTitle>
                <CardDescription>
                  Pick the path you want and copy the exact command.
                </CardDescription>
              </div>
            </div>

            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={handleCopy}
              className="text-muted-foreground hover:text-foreground"
              aria-label="Copy command"
            >
              {copied ? <CheckIcon size={18} /> : <CopyIcon size={18} />}
            </Button>
          </div>

          <TabsList className="flex w-full flex-wrap justify-start">
            {items.map((item) => (
              <TabsTrigger key={item.label} value={item.label}>
                {item.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </CardHeader>

        {items.map((item) => (
          <TabsContent key={item.label} value={item.label}>
            <CardContent className="pb-7 pt-6">
              <div className="overflow-x-auto rounded-[1.25rem] border border-white/8 bg-black/40 px-4 py-4 font-mono text-[0.98rem] leading-8 text-neutral-300">
                <span className="select-none text-[color:var(--accent-soft)]">
                  ${" "}
                </span>
                {item.command}
              </div>
            </CardContent>
          </TabsContent>
        ))}
      </Tabs>
    </Card>
  );
}
