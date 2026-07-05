"use client";

import { useState, useEffect } from "react";
import { Trash2, MessageSquare } from "lucide-react";
import { cn } from "@/utils/helpers";
import type { Thread } from "@/lib/storage/threads";
import { Button } from "@/components/ui/button";

interface Props {
  thread: Thread;
  isActive: boolean;
  onSelect: () => void;
  onDelete: () => void;
}

export function ThreadItem({ thread, isActive, onSelect, onDelete }: Props) {
  const [timeAgoText, setTimeAgoText] = useState("");

  useEffect(() => {
    const calculateTimeAgo = () => {
      const diff = Date.now() - new Date(thread.updatedAt).getTime();
      const mins = Math.floor(diff / 60000);
      const hours = Math.floor(mins / 60);
      const days = Math.floor(hours / 24);
      if (days > 0) return `${days}d ago`;
      if (hours > 0) return `${hours}h ago`;
      if (mins > 0) return `${mins}m ago`;
      return "Just now";
    };
    const handle = setTimeout(() => {
      setTimeAgoText(calculateTimeAgo());
    }, 0);
    return () => clearTimeout(handle);
  }, [thread.updatedAt]);

  return (
    <div
      className={cn(
        "group flex items-start gap-2 px-3 py-2.5 rounded-lg cursor-pointer transition-all",
        isActive
          ? "bg-[var(--persona-accent)]/10 border border-[var(--persona-accent)]/20"
          : "hover:bg-muted border border-transparent"
      )}
      onClick={onSelect}
    >
      <MessageSquare
        className={cn(
          "h-3.5 w-3.5 mt-0.5 flex-shrink-0",
          isActive ? "text-[var(--persona-accent)]" : "text-muted-foreground"
        )}
      />
      <div className="flex-1 min-w-0">
        <p
          className={cn(
            "text-xs font-medium truncate leading-tight",
            isActive ? "text-foreground" : "text-muted-foreground"
          )}
        >
          {thread.title}
        </p>
        <p className="text-[10px] text-muted-foreground/60 mt-0.5">
          {timeAgoText || "Just now"} · {thread.messages.length} msgs
        </p>
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="h-5 w-5 opacity-0 group-hover:opacity-100 flex-shrink-0"
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        aria-label="Delete thread"
      >
        <Trash2 className="h-3 w-3 text-muted-foreground" />
      </Button>
    </div>
  );
}