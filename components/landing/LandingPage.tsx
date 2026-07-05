"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { HexagonPattern } from "@/components/ui/HexagonPattern";
import { CommandPalette } from "@/components/ui/CommandPalette";
import { Badge } from "@/components/ui/badge";
import { Swords, Mic, Sparkles, Terminal, Keyboard } from "lucide-react";
import { toast } from "sonner";
import { Logo } from "@/components/ui/Logo";
import {
  SignInButton,
  SignUpButton,
  Show,
  UserButton,
} from "@clerk/nextjs";

export function LandingPage() {
  const router = useRouter();
  const [shortcutText, setShortcutText] = useState("⌘K");
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      !/Mac|iPad|iPhone|iPod/.test(navigator.userAgent)
    ) {
      setShortcutText("Ctrl+K");
    }
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring" as const,
        stiffness: 100,
        damping: 15,
      },
    },
  };

  const handleShowFeatures = (e: React.MouseEvent) => {
    e.preventDefault();
    toast.info(
      "Features: Dual AI Mentors, Live Debate Mode, Voice Input & Hinglish TTS, Thread History, Command Palette",
      { duration: 4000 }
    );
  };

  return (
    <div className="relative min-h-screen bg-background text-foreground flex flex-col justify-between overflow-hidden">
      {/* Honeycomb Pattern */}
      <HexagonPattern />

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-6 py-4 border-b border-border bg-background">
        <Link href="/" className="flex items-center gap-2 group">
          <Logo size={28} className="group-hover:rotate-6 transition-transform duration-300" />
          <span className="text-xl font-extrabold tracking-tight text-foreground">
            BrewedMinds
          </span>
        </Link>
        <div className="flex items-center gap-3">
          <a
            href="#features"
            onClick={handleShowFeatures}
            className="text-sm font-medium hover:text-primary transition-colors text-muted-foreground hidden sm:inline-block px-3 py-1.5 rounded-lg hover:bg-muted/50"
          >
            Features
          </a>
          <button
            onClick={() => setIsCommandPaletteOpen(true)}
            className="hidden md:inline-flex h-8 select-none items-center gap-1.5 rounded-lg border border-border bg-muted/30 px-3 font-mono text-xs font-medium text-muted-foreground hover:bg-muted/60 transition-colors"
            title="Open Command Palette"
          >
            <Keyboard className="h-3.5 w-3.5" />
            <span>Search</span>
            <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-0.5 rounded border bg-background px-1.5 text-[10px] font-medium opacity-100">
              {shortcutText}
            </kbd>
          </button>
          <ThemeToggle />
          <Show when="signed-out">
            <SignInButton mode="redirect" fallbackRedirectUrl="/chat">
              <button className="text-sm font-medium px-3 py-1.5 rounded-lg border border-border hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-colors">
                Sign In
              </button>
            </SignInButton>
            <SignUpButton mode="redirect" fallbackRedirectUrl="/chat">
              <button className="text-sm font-semibold px-3 py-1.5 rounded-lg bg-[#D4A76A] hover:bg-[#C4955A] text-black transition-colors">
                Sign Up
              </button>
            </SignUpButton>
          </Show>
          <Show when="signed-in">
            <UserButton />
          </Show>
        </div>
      </header>

      {/* Main Hero & Card Selectors */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 py-12 max-w-5xl mx-auto w-full">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="w-full flex flex-col items-center text-center space-y-8"
        >
          {/* Tagline */}
          <motion.div variants={itemVariants} className="space-y-4 max-w-2xl">
            <Badge variant="outline" className="px-3 py-1 text-xs border-amber-500/20 bg-amber-500/5 text-amber-600 dark:text-amber-400">
              ChaiCode GenAI Cohort MVP
            </Badge>
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
              Learn from the Best.
              <br />
              Chat with the{" "}
              <span className="text-[#D4A76A] dark:text-[#D4A76A] font-bold">
                Legends
              </span>
              .
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground">
              AI-powered conversations with India's top tech educators.
              <br />
              <span className="italic text-muted-foreground/80">Not a chatbot — a mentor.</span>
            </p>
          </motion.div>

          {/* Cards Grid */}
          <motion.div
            variants={itemVariants}
            className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl px-2 mt-4"
          >
            <div
              onClick={() => router.push("/chat?persona=hitesh")}
              className="group relative cursor-pointer rounded-2xl border border-border bg-card p-8 flex flex-col items-center justify-between text-center transition-all duration-200 hover:border-[#D4A76A] shadow-xs overflow-hidden"
            >
              <div className="flex flex-col items-center space-y-4 w-full">
                {/* Avatar with Flat Border */}
                <div className="relative w-28 h-28 rounded-full overflow-hidden border-3 border-border group-hover:border-[#D4A76A] transition-colors duration-200 flex items-center justify-center">
                  <Image
                    src="/hiteshsir.png"
                    alt="Hitesh Choudhary"
                    fill
                    sizes="(max-width: 112px) 100vw, 112px"
                    className="object-cover"
                  />
                </div>
                
                <div className="space-y-1">
                  <h2 className="text-2xl font-bold tracking-tight text-foreground group-hover:text-[#D4A76A] transition-colors duration-200">
                    Hitesh Choudhary
                  </h2>
                  <div className="flex items-center justify-center gap-1.5">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full border border-[#D4A76A]/30 bg-[#D4A76A]/10 text-[#D4A76A]">
                      Chai aur Code
                    </span>
                    <span className="text-xs text-muted-foreground">•</span>
                    <span className="text-xs text-muted-foreground font-medium">Investigative Learning</span>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground italic px-4 py-2 border-y border-border-subtle w-full">
                  &ldquo;Slower you learn, faster you code.&rdquo;
                </p>

                {/* Cultural/Branding Associations */}
                <div className="flex flex-wrap items-center justify-center gap-1.5 mt-1">
                  <span className="text-[10px] bg-muted/60 text-muted-foreground px-2 py-0.5 rounded-md border border-border">🍵 ChaiCode</span>
                  <span className="text-[10px] bg-muted/60 text-muted-foreground px-2 py-0.5 rounded-md border border-border">👕 Signature Grey Tee</span>
                  <span className="text-[10px] bg-muted/60 text-muted-foreground px-2 py-0.5 rounded-md border border-border">🏰 Jaipur NIT Alumni</span>
                  <span className="text-[10px] bg-muted/60 text-muted-foreground px-2 py-0.5 rounded-md border border-border">✈️ 39+ Countries</span>
                </div>
              </div>

              <div className="w-full mt-6">
                <button className="w-full py-2.5 px-4 rounded-xl font-semibold text-sm bg-[#D4A76A] hover:bg-[#C4955A] text-black transition-colors flex items-center justify-center gap-2">
                  Start Chat
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </button>
              </div>
            </div>

            <div
              onClick={() => router.push("/chat?persona=piyush")}
              className="group relative cursor-pointer rounded-2xl border border-border bg-card p-8 flex flex-col items-center justify-between text-center transition-all duration-200 hover:border-[#7C3AED] shadow-xs overflow-hidden"
            >
              <div className="flex flex-col items-center space-y-4 w-full">
                {/* Avatar with Flat Border */}
                <div className="relative w-28 h-28 rounded-full overflow-hidden border-3 border-border group-hover:border-[#7C3AED] transition-colors duration-200 flex items-center justify-center bg-zinc-900">
                  <Image
                    src="/piyush sir.webp"
                    alt="Piyush Garg"
                    fill
                    sizes="(max-width: 112px) 100vw, 112px"
                    className="object-cover"
                  />
                </div>

                <div className="space-y-1">
                  <h2 className="text-2xl font-bold tracking-tight text-foreground group-hover:text-[#7C3AED] transition-colors duration-200">
                    Piyush Garg
                  </h2>
                  <div className="flex items-center justify-center gap-1.5">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full border border-[#7C3AED]/30 bg-[#7C3AED]/10 text-[#7C3AED]">
                      Systems First
                    </span>
                    <span className="text-xs text-muted-foreground">•</span>
                    <span className="text-xs text-muted-foreground font-medium">Production Engineering</span>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground italic px-4 py-2 border-y border-border-subtle w-full">
                  &ldquo;I build devs, not just apps.&rdquo;
                </p>

                {/* Cultural/Branding Associations */}
                <div className="flex flex-wrap items-center justify-center gap-1.5 mt-1">
                  <span className="text-[10px] bg-muted/60 text-muted-foreground px-2 py-0.5 rounded-md border border-border">🧴 Minoxidil Jokes</span>
                  <span className="text-[10px] bg-muted/60 text-muted-foreground px-2 py-0.5 rounded-md border border-border">💔 Kaat ke toh wo gyi</span>
                  <span className="text-[10px] bg-muted/60 text-muted-foreground px-2 py-0.5 rounded-md border border-border">💀 Is Docker Dead?</span>
                  <span className="text-[10px] bg-muted/60 text-muted-foreground px-2 py-0.5 rounded-md border border-border">🤖 AI Agent SDK</span>
                </div>
              </div>

              <div className="w-full mt-6">
                <button className="w-full py-2.5 px-4 rounded-xl font-semibold text-sm bg-[#7C3AED] hover:bg-[#6D28D9] text-white transition-colors flex items-center justify-center gap-2">
                  Start Chat
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </button>
              </div>
            </div>
          </motion.div>

          {/* Quick Links / Feature Badges */}
          <motion.div variants={itemVariants} className="w-full max-w-md pt-4 space-y-3">
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
              Explore Interactive Features
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2.5">
              <Link
                href="/chat?mode=debate"
                className="flex items-center gap-1.5 text-xs font-medium px-4 py-2 rounded-full border border-border hover:border-amber-500/40 hover:bg-amber-500/5 transition-all text-muted-foreground hover:text-foreground shadow-sm"
              >
                <Swords className="h-3.5 w-3.5 text-amber-500" />
                <span>⚔️ Debate Mode</span>
              </Link>
              <Link
                href="/chat?voice=true"
                className="flex items-center gap-1.5 text-xs font-medium px-4 py-2 rounded-full border border-border hover:border-violet-500/40 hover:bg-violet-500/5 transition-all text-muted-foreground hover:text-foreground shadow-sm"
              >
                <Mic className="h-3.5 w-3.5 text-violet-500" />
                <span>🎙️ Voice Mode</span>
              </Link>
              <button
                onClick={() => {
                  toast.success("💡 Smart Tips active! Try asking for system limits or Chai shop analogies.");
                }}
                className="flex items-center gap-1.5 text-xs font-medium px-4 py-2 rounded-full border border-border hover:border-emerald-500/40 hover:bg-emerald-500/5 transition-all text-muted-foreground hover:text-foreground shadow-sm"
              >
                <Sparkles className="h-3.5 w-3.5 text-emerald-500" />
                <span>💡 Smart Tips</span>
              </button>
            </div>
          </motion.div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-6 text-center text-xs text-muted-foreground border-t border-border bg-background/30 flex flex-col items-center gap-2">
        <p>
          Built by{" "}
          <span className="font-semibold text-foreground">Sarthak Gupta</span> ·{" "}
          <span className="text-amber-500 font-medium">ChaiCode GenAI Cohort</span>
        </p>
        <div className="flex items-center gap-3">
          <a
            href="https://github.com/VeCtORbytes"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground transition-colors p-1"
            aria-label="GitHub Profile"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
              <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"></path>
              <path d="M9 18c-4.51 2-5-2-7-2"></path>
            </svg>
          </a>
          <a
            href="https://www.linkedin.com/in/sarthakgupta25/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground transition-colors p-1"
            aria-label="LinkedIn Profile"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
              <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
              <rect width="4" height="12" x="2" y="9"></rect>
              <circle cx="4" cy="4" r="2"></circle>
            </svg>
          </a>
        </div>
      </footer>

      {/* Hidden standard palette integration for Landing Page */}
      {isCommandPaletteOpen && (
        <CommandPalette
          activePersona="hitesh"
          debateMode={false}
          onSwitchPersona={(id) => {
            setIsCommandPaletteOpen(false);
            router.push(`/chat?persona=${id}`);
          }}
          onToggleDebate={(mode) => {
            setIsCommandPaletteOpen(false);
            if (mode) router.push("/chat?mode=debate");
          }}
          onNewThread={() => {
            setIsCommandPaletteOpen(false);
            router.push("/chat");
          }}
          onClearThread={() => {
            setIsCommandPaletteOpen(false);
          }}
        />
      )}
    </div>
  );
}
