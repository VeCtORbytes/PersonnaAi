"use client";

import { Swords } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/utils/helpers";

interface Props {
  onClick: () => void;
  className?: string;
}

export function DebateModeToggle({ onClick, className }: Props) {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onClick}
      className={cn("gap-2", className)}
    >
      <Swords className="h-4 w-4" />
      <span className="hidden sm:inline">Debate Mode</span>
      <Badge variant="secondary" className="text-xs px-1.5 py-0">
        NEW
      </Badge>
    </Button>
  );
}