"use client";

import { cn } from "@/utils/helpers";

interface HexagonPatternProps {
  className?: string;
}

export function HexagonPattern({ className }: HexagonPatternProps) {
  return (
    <div
      className={cn(
        "absolute inset-0 pointer-events-none bg-hex-pattern transition-opacity duration-300",
        className
      )}
      aria-hidden="true"
    />
  );
}
