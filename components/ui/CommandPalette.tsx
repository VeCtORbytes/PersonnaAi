"use client";

import { useEffect, useState, useRef } from "react";
import { useTheme } from "next-themes";
import {
  Swords,
  User,
  Trash2,
  Sun,
  Moon,
  Plus,
  Search,
  Terminal,
} from "lucide-react";
import type { PersonaId } from "@/types";
import { cn } from "@/utils/helpers";

interface Props {
  activePersona: PersonaId;
  debateMode: boolean;
  onSwitchPersona: (persona: PersonaId) => void;
  onToggleDebate: (val: boolean) => void;
  onNewThread: () => void;
  onClearThread: () => void;
}

export function CommandPalette({
  activePersona,
  debateMode,
  onSwitchPersona,
  onToggleDebate,
  onNewThread,
  onClearThread,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const { theme, setTheme } = useTheme();

  const commands = [
    {
      id: "switch-hitesh",
      label: "Switch to Hitesh Sir",
      category: "Persona Selection",
      shortcut: "⌥1",
      icon: User,
      action: () => onSwitchPersona("hitesh"),
    },
    {
      id: "switch-piyush",
      label: "Switch to Piyush Sir",
      category: "Persona Selection",
      shortcut: "⌥2",
      icon: User,
      action: () => onSwitchPersona("piyush"),
    },
    {
      id: "toggle-debate",
      label: debateMode ? "Exit Debate Mode" : "Start Debate Mode",
      category: "Modes",
      shortcut: "⌥D",
      icon: Swords,
      action: () => onToggleDebate(!debateMode),
    },
    {
      id: "new-thread",
      label: "New Conversation",
      category: "Actions",
      shortcut: "⌥N",
      icon: Plus,
      action: onNewThread,
    },
    {
      id: "clear-thread",
      label: "Clear Conversation / Debate",
      category: "Actions",
      shortcut: "⌥⌫",
      icon: Trash2,
      action: onClearThread,
    },
    {
      id: "toggle-theme",
      label: `Switch to ${theme === "dark" ? "Light" : "Dark"} Mode`,
      category: "Preferences",
      shortcut: "⌥T",
      icon: theme === "dark" ? Sun : Moon,
      action: () => setTheme(theme === "dark" ? "light" : "dark"),
    },
  ];

  const filteredCommands = commands.filter((c) =>
    c.label.toLowerCase().includes(search.toLowerCase()) ||
    c.category.toLowerCase().includes(search.toLowerCase())
  );



  // Command palette toggle listener (Cmd+K / Ctrl+K) + Global hotkeys
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 1. Toggle command palette: Cmd/Ctrl + K
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }

      // 2. Global Hotkeys (Alt/Option + Key)
      if (e.altKey) {
        switch (e.key) {
          case "1":
            e.preventDefault();
            onSwitchPersona("hitesh");
            break;
          case "2":
            e.preventDefault();
            onSwitchPersona("piyush");
            break;
          case "d":
          case "D":
          case "∂": // Alt+d on macOS produces ∂
            e.preventDefault();
            onToggleDebate(!debateMode);
            break;
          case "n":
          case "N":
          case "˜": // Alt+n on macOS produces ˜
            e.preventDefault();
            onNewThread();
            break;
          case "t":
          case "T":
          case "†": // Alt+t on macOS produces †
            e.preventDefault();
            setTheme(theme === "dark" ? "light" : "dark");
            break;
          case "Backspace":
            e.preventDefault();
            onClearThread();
            break;
          default:
            break;
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [debateMode, onSwitchPersona, onToggleDebate, onNewThread, onClearThread, theme, setTheme]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      const handle = setTimeout(() => {
        inputRef.current?.focus();
        setSearch("");
      }, 50);
      return () => clearTimeout(handle);
    }
  }, [isOpen]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev === filteredCommands.length - 1 ? 0 : prev + 1
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev === 0 ? filteredCommands.length - 1 : prev - 1
      );
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (filteredCommands[selectedIndex]) {
        filteredCommands[selectedIndex].action();
        setIsOpen(false);
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      setIsOpen(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4 bg-background/30 dark:bg-background/40 backdrop-blur-sm"
      onClick={() => setIsOpen(false)}
    >
      <div
        data-persona={activePersona}
        className="w-full max-w-lg overflow-hidden border border-border bg-background/90 backdrop-blur-md shadow-2xl rounded-2xl transition-all scale-100 duration-150 ease-out"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search header */}
        <div className="flex items-center gap-2 border-b border-border/80 px-4 py-3">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a command or search..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none border-none focus:ring-0 focus:outline-none"
          />
          <button
            onClick={() => setIsOpen(false)}
            className="text-[10px] bg-muted text-muted-foreground px-2 py-0.5 rounded border border-border"
          >
            ESC
          </button>
        </div>

        {/* Command list */}
        <div className="max-h-[300px] overflow-y-auto py-2">
          {filteredCommands.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-6 px-4">
              No results found.
            </p>
          ) : (
            Object.entries(
              filteredCommands.reduce((acc, c) => {
                if (!acc[c.category]) acc[c.category] = [];
                acc[c.category].push(c);
                return acc;
              }, {} as Record<string, typeof commands>)
            ).map(([category, items]) => (
              <div key={category} className="mb-2 last:mb-0">
                <p className="text-[10px] font-semibold text-muted-foreground/60 px-3.5 py-1 uppercase tracking-wider">
                  {category}
                </p>
                <div>
                  {items.map((c) => {
                    const globalIdx = filteredCommands.findIndex(
                      (fc) => fc.id === c.id
                    );
                    const isSelected = globalIdx === selectedIndex;
                    const Icon = c.icon;

                    return (
                      <button
                        key={c.id}
                        onClick={() => {
                          c.action();
                          setIsOpen(false);
                        }}
                        onMouseEnter={() => setSelectedIndex(globalIdx)}
                        className={cn(
                          "w-full flex items-center justify-between px-3.5 py-2 text-left transition-colors border-l-2 text-xs",
                          isSelected
                            ? "bg-[var(--persona-accent)]/10 border-[var(--persona-accent)] text-foreground"
                            : "bg-transparent border-transparent text-muted-foreground hover:text-foreground"
                        )}
                      >
                        <div className="flex items-center gap-2.5">
                          <Icon
                            className={cn(
                              "h-4 w-4",
                              isSelected
                                ? "text-[var(--persona-accent)]"
                                : "text-muted-foreground/75"
                            )}
                          />
                          <span className="font-medium">{c.label}</span>
                        </div>
                        <kbd className="text-[9px] bg-muted/60 text-muted-foreground/80 px-1.5 py-0.5 rounded border border-border/80 font-sans tracking-widest">
                          {c.shortcut}
                        </kbd>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-border/80 px-4 py-2 bg-muted/20 text-[10px] text-muted-foreground/75 select-none">
          <div className="flex items-center gap-1.5">
            <Terminal className="h-3 w-3" />
            <span>Command Palette active</span>
          </div>
          <div className="flex items-center gap-3">
            <span>
              <kbd className="bg-muted px-1.5 py-0.5 rounded">↑↓</kbd> navigate
            </span>
            <span>
              <kbd className="bg-muted px-1.5 py-0.5 rounded">↵</kbd> select
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
