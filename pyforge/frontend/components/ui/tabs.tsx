"use client";

import * as Tabs from "@radix-ui/react-tabs";
import { cn } from "@/lib/utils";

export function TabsRoot({ defaultValue, children, className }: {
  defaultValue: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Tabs.Root defaultValue={defaultValue} className={cn("flex flex-col", className)}>
      {children}
    </Tabs.Root>
  );
}

export function TabsList({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <Tabs.List className={cn("flex border-b border-border bg-background", className)}>
      {children}
    </Tabs.List>
  );
}

export function TabsTrigger({ value, children }: { value: string; children: React.ReactNode }) {
  return (
    <Tabs.Trigger
      value={value}
      className="px-4 py-2 text-sm font-medium text-muted data-[state=active]:text-accent data-[state=active]:border-b-2 data-[state=active]:border-accent outline-none"
    >
      {children}
    </Tabs.Trigger>
  );
}

export function TabsContent({ value, children, className }: { value: string; children: React.ReactNode; className?: string }) {
  return (
    <Tabs.Content value={value} className={cn("flex-1 outline-none", className)}>
      {children}
    </Tabs.Content>
  );
}
