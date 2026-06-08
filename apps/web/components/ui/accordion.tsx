"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type AccordionContextValue = {
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
    <div className={cn("border-b last:border-b-0", className)}>{children}</div>
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
      className={cn(
        "flex w-full items-start justify-between gap-4 rounded-md py-4 text-left text-sm font-medium transition-all hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400",
        className,
      )}
    >
      <span>{children}</span>
      <span
        className={cn(
          "text-muted-foreground transition-transform duration-200",
          context.isOpen && "rotate-180",
        )}
      >
        ˅
      </span>
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

  if (!context || !context.isOpen) return null;

  return <div className={cn("pb-4 pt-0 text-sm", className)}>{children}</div>;
}
