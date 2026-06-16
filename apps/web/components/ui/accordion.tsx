"use client";

import * as React from "react";
import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export function Accordion({
  className,
  children,
  ...props
}: Omit<AccordionPrimitive.AccordionSingleProps, "type"> & {
  children: React.ReactNode;
}) {
  return (
    <AccordionPrimitive.Root
      data-slot="accordion"
      type="single"
      collapsible
      className={cn(
        "w-full overflow-hidden rounded-[2rem] border border-white/10 bg-black/20 shadow-[0_0_0_1px_rgba(255,255,255,0.03),0_18px_50px_rgba(0,0,0,0.18)]",
        className,
      )}
      {...props}
    >
      {children}
    </AccordionPrimitive.Root>
  );
}

export function AccordionItem({
  className,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Item>) {
  return (
    <AccordionPrimitive.Item
      data-slot="accordion-item"
      className={cn(
        "border-b border-white/8 px-6 last:border-b-0 sm:px-10 data-[state=open]:bg-white/[0.015]",
        className,
      )}
      {...props}
    />
  );
}

export function AccordionTrigger({
  className,
  children,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Trigger>) {
  return (
    <AccordionPrimitive.Header className="flex">
      <AccordionPrimitive.Trigger
        data-slot="accordion-trigger"
        className={cn(
          "group flex flex-1 items-center justify-between gap-6 py-7 text-left text-lg font-medium tracking-[-0.03em] text-foreground transition-colors hover:text-foreground/90 focus-visible:outline-none focus-visible:ring-0 sm:py-9 sm:text-[2rem] sm:leading-none",
          className,
        )}
        {...props}
      >
        <span className="pr-4">{children}</span>
        <span className="flex size-8 shrink-0 items-center justify-center text-white/65 sm:size-10">
          <ChevronDown className="size-6 stroke-[2.2] transition-transform duration-200 group-data-[state=open]:rotate-180 sm:size-7" />
        </span>
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  );
}

export function AccordionContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Content>) {
  return (
    <AccordionPrimitive.Content
      data-slot="accordion-content"
      className="overflow-hidden text-sm data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down"
      {...props}
    >
      <div
        className={cn(
          "max-w-4xl pb-8 pr-14 text-base leading-8 text-muted-foreground sm:pb-10 sm:pl-0 sm:pr-24",
          className,
        )}
      >
        {children}
      </div>
    </AccordionPrimitive.Content>
  );
}
