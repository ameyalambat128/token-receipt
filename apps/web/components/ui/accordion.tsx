"use client";

import * as React from "react";
import { ChevronDownIcon } from "@/components/icons";
import { cn } from "@/lib/utils";

type AccordionContextValue = {
  value: string;
  isOpen: boolean;
  toggle: () => void;
};

const AccordionContext = React.createContext<AccordionContextValue | null>(
  null,
);

export function Accordion({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  const [openValue, setOpenValue] = React.useState<string | null>(null);
  const items = React.Children.toArray(children) as React.ReactElement<{
    value: string;
  }>[];

  return (
    <div className={className}>
      {items.map((item) => (
        <AccordionContext.Provider
          key={item.props.value}
          value={{
            value: item.props.value,
            isOpen: openValue === item.props.value,
            toggle: () =>
              setOpenValue((current) =>
                current === item.props.value ? null : item.props.value,
              ),
          }}
        >
          {item}
        </AccordionContext.Provider>
      ))}
    </div>
  );
}

export function AccordionItem({
  className,
  children,
}: {
  value: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn("border-b border-neutral-800 last:border-b-0", className)}
    >
      {children}
    </div>
  );
}

export function AccordionTrigger({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  const context = React.useContext(AccordionContext);

  if (!context) return null;

  return (
    <button
      type="button"
      onClick={context.toggle}
      aria-expanded={context.isOpen}
      aria-controls={`accordion-panel-${context.value}`}
      id={`accordion-trigger-${context.value}`}
      className={cn(
        "flex w-full items-center justify-between gap-4 py-5 text-left text-[0.95rem] font-medium text-gray-200 transition-colors hover:text-white focus-visible:rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-500",
        className,
      )}
    >
      <span>{children}</span>
      <ChevronDownIcon
        size={18}
        className={cn(
          "shrink-0 text-neutral-500 transition-transform duration-300 ease-out",
          context.isOpen && "-rotate-180 text-neutral-300",
        )}
      />
    </button>
  );
}

export function AccordionContent({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  const context = React.useContext(AccordionContext);

  if (!context) return null;

  return (
    <div
      id={`accordion-panel-${context.value}`}
      role="region"
      aria-labelledby={`accordion-trigger-${context.value}`}
      className={cn(
        "grid transition-all duration-300 ease-out",
        context.isOpen
          ? "grid-rows-[1fr] opacity-100"
          : "grid-rows-[0fr] opacity-0",
      )}
    >
      <div className="overflow-hidden">
        <div className={cn("pb-5 pr-10 text-sm", className)}>{children}</div>
      </div>
    </div>
  );
}
