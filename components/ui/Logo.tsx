"use client";

import React from "react";
import { cn } from "@/utils/helpers";

interface LogoProps {
  className?: string;
  size?: number;
}

export function Logo({ className, size = 28 }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("flex-shrink-0 select-none", className)}
    >
      {/* Main Cup Body (The Brew) */}
      <path
        d="M28 42 C28 65, 34 76, 50 76 C66 76, 72 65, 72 42 Z"
        stroke="currentColor"
        strokeWidth="6.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Cup Handle */}
      <path
        d="M72 48 C81 48, 85 53, 85 59 C85 65, 81 70, 72 70"
        stroke="currentColor"
        strokeWidth="5.5"
        strokeLinecap="round"
      />

      {/* Saucer / Base */}
      <path
        d="M20 86 L80 86"
        stroke="currentColor"
        strokeWidth="6.5"
        strokeLinecap="round"
      />

      {/* Neural Steam Line 1 */}
      <path
        d="M38 32 C38 22, 47 16, 50 12 C53 16, 62 22, 62 32"
        stroke="currentColor"
        strokeWidth="4.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="opacity-90"
      />

      {/* Neural Steam Line 2 (Inside loop) */}
      <path
        d="M45 32 C45 25, 55 25, 55 32"
        stroke="currentColor"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="opacity-75"
      />

      {/* Network Nodes (The Minds) */}
      <circle cx="50" cy="12" r="4.5" fill="#7C3AED" />
      <circle cx="38" cy="32" r="3.5" fill="#D4A76A" />
      <circle cx="62" cy="32" r="3.5" fill="#D4A76A" />
    </svg>
  );
}
