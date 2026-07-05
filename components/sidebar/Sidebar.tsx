"use client";

import { Plus, PanelLeftClose, PanelLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ThreadList } from "./ThreadList";
import type { Thread } from "@/lib/storage/threads";
import type { PersonaId } from "@/types";
import { cn } from "@/utils/helpers";

interface Props {
  threads: Thread[];
  activeThreadId: string | null;
  activePersona: PersonaId;
  isOpen: boolean;
  onToggle: () => void;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onNew: () => void;
}

export function Sidebar({
  threads,
  activeThreadId,
  isOpen,
  onToggle,
  onSelect,
  onDelete,
  onNew,
}: Props) {
  return (
    <>
      {/* Toggle button — always visible */}
      <Button
        variant="ghost"
        size="icon"
        onClick={onToggle}
        className="absolute left-2 top-3 z-20 h-8 w-8"
        aria-label={isOpen ? "Close sidebar" : "Open sidebar"}
      >
        {isOpen ? (
          <PanelLeftClose className="h-4 w-4" />
        ) : (
          <PanelLeft className="h-4 w-4" />
        )}
      </Button>

      {/* Sidebar panel */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.aside
            key="sidebar"
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 240, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className={cn(
              "flex flex-col border-r border-border bg-background overflow-hidden flex-shrink-0",
              "h-full"
            )}
          >
            {/* Sidebar header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border mt-10">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Conversations
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={onNew}
                aria-label="New conversation"
              >
                <Plus className="h-3.5 w-3.5" />
              </Button>
            </div>

            {/* Thread list */}
            <ScrollArea className="flex-1 min-h-0 py-2">
              {threads.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-8 px-4">
                  No conversations yet. Start chatting!
                </p>
              ) : (
                <ThreadList
                  threads={threads}
                  activeThreadId={activeThreadId}
                  onSelect={onSelect}
                  onDelete={onDelete}
                />
              )}
            </ScrollArea>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}