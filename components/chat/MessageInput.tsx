"use client";

import { useState, useRef, useEffect, type KeyboardEvent } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "../../utils/helpers";

interface Props {
  onSend: (message: string) => void;
  disabled?: boolean;
}

export function MessageInput({ onSend, disabled }: Props) {
  const [value, setValue] = useState("");
  const [shortcutText, setShortcutText] = useState("⌘K");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      !/Mac|iPad|iPhone|iPod/.test(navigator.userAgent)
    ) {
      const handle = setTimeout(() => {
        setShortcutText("Ctrl+K");
      }, 0);
      return () => clearTimeout(handle);
    }
  }, []);

  const handleSend = () => {
    if (!value.trim() || disabled) return;
    onSend(value);
    setValue("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInput = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  };

  return (
    <div className="border-t border-border p-4">
      <div className="flex gap-3 items-end max-w-4xl mx-auto">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onInput={handleInput}
          disabled={disabled}
          placeholder={disabled ? "Generating..." : "Ask a question..."}
          rows={1}
          aria-label="Message input"
          className={cn(
            "flex-1 resize-none rounded-xl border border-border bg-background px-4 py-3 text-sm",
            "placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50",
            "disabled:opacity-50 disabled:cursor-not-allowed transition-all",
            "min-h-[48px] max-h-[160px]"
          )}
        />
        <Button
          onClick={handleSend}
          disabled={disabled || !value.trim()}
          size="icon"
          aria-label="Send message"
          className="h-12 w-12 rounded-xl flex-shrink-0"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
      <p className="text-xs text-muted-foreground text-center mt-2">
        Shift + Enter for new line
      </p>
    </div>
  );
}