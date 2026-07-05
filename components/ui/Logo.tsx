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
      <style>{`
        @keyframes steam-drift {
          0%, 100% {
            transform: translateY(0) scaleY(1);
            opacity: 0.6;
          }
          50% {
            transform: translateY(-3px) scaleY(1.08);
            opacity: 0.95;
          }
        }
        @keyframes node-glow {
          0%, 100% {
            r: 4.5;
            filter: drop-shadow(0 0 1px rgba(124, 58, 237, 0.4));
          }
          50% {
            r: 5.5;
            filter: drop-shadow(0 0 3px rgba(124, 58, 237, 0.8));
          }
        }
        @keyframes node-glow-amber {
          0%, 100% {
            r: 3.5;
            filter: drop-shadow(0 0 1px rgba(212, 167, 106, 0.4));
          }
          50% {
            r: 4.2;
            filter: drop-shadow(0 0 3px rgba(212, 167, 106, 0.8));
          }
        }
        .logo-steam-1 {
          animation: steam-drift 3.5s ease-in-out infinite;
          transform-origin: 50px 32px;
        }
        .logo-steam-2 {
          animation: steam-drift 2.8s ease-in-out infinite 0.6s;
          transform-origin: 50px 32px;
        }
        .logo-node-violet {
          animation: node-glow 3s ease-in-out infinite;
        }
        .logo-node-amber-1 {
          animation: node-glow-amber 3.5s ease-in-out infinite 0.4s;
        }
        .logo-node-amber-2 {
          animation: node-glow-amber 3.5s ease-in-out infinite 0.8s;
        }
      `}</style>

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
        className="logo-steam-1"
      />

      {/* Neural Steam Line 2 (Inside loop) */}
      <path
        d="M45 32 C45 25, 55 25, 55 32"
        stroke="currentColor"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="logo-steam-2"
      />

      {/* Network Nodes (The Minds) */}
      <circle cx="50" cy="12" r="4.5" fill="#7C3AED" className="logo-node-violet" />
      <circle cx="38" cy="32" r="3.5" fill="#D4A76A" className="logo-node-amber-1" />
      <circle cx="62" cy="32" r="3.5" fill="#D4A76A" className="logo-node-amber-2" />
    </svg>
  );
}
