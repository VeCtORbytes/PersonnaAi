"use client";

import React, { useEffect, useState } from "react";
import { Logo } from "@/components/ui/Logo";
import { HexagonPattern } from "@/components/ui/HexagonPattern";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { Quote, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface AuthLayoutProps {
  children: React.ReactNode;
  subtitle: string;
}

const QUOTES = [
  {
    text: "Slower you learn, faster you code. 🍵",
    author: "Hitesh Choudhary",
    role: "Chai aur Code",
  },
  {
    text: "I build devs, not just apps. 💻",
    author: "Piyush Garg",
    role: "Systems First",
  },
  {
    text: "Lala, systems ko architecture karna seekho, code toh AI bhi likh lega! 🍵",
    author: "Hitesh Choudhary",
    role: "Chai aur Code",
  },
  {
    text: "Kaat ke toh wo gyi, ab Docker configure kar lo lala. 💀",
    author: "Piyush Garg",
    role: "Systems First",
  },
];

function ChaiSceneIllustration() {
  return (
    <div className="relative w-full h-full min-h-[200px] flex items-center justify-center select-none pointer-events-none">
      {/* Background Atmosphere Glows */}
      <div className="absolute top-[10%] left-[20%] w-36 h-36 bg-amber-500/5 rounded-full blur-3xl" />
      <div className="absolute top-[20%] right-[20%] w-36 h-36 bg-violet-600/5 rounded-full blur-3xl" />

      {/* Main Illustration Scene Container */}
      <div className="relative w-full max-w-[420px] h-full flex flex-col items-center justify-end pb-8">
        
        {/* Steam & Floating Code Particles */}
        <div className="absolute inset-0 z-0">
          {/* Steam from Chai Pan */}
          <motion.div
            animate={{ y: [160, 40], x: [100, 90, 105], opacity: [0, 0.6, 0], scale: [0.8, 1.2, 0.9] }}
            transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
            className="absolute left-[95px] w-2 h-14 bg-foreground/10 rounded-full blur-[2px]"
          />
          <motion.div
            animate={{ y: [165, 30], x: [115, 125, 110], opacity: [0, 0.7, 0], scale: [0.7, 1.3, 0.8] }}
            transition={{ duration: 2.8, repeat: Infinity, delay: 0.6, ease: "easeInOut" }}
            className="absolute left-[95px] w-3 h-16 bg-foreground/5 rounded-full blur-[3px]"
          />

          {/* Steam from Cutting Chai Glass */}
          <motion.div
            animate={{ y: [180, 80], x: [180, 175, 185], opacity: [0, 0.5, 0], scale: [0.6, 1, 0.7] }}
            transition={{ duration: 2.5, repeat: Infinity, delay: 0.3, ease: "easeInOut" }}
            className="absolute left-[20px] w-1.5 h-10 bg-foreground/10 rounded-full blur-[1px]"
          />

          {/* Code Stream from Laptop Screen */}
          <motion.span
            animate={{ y: [150, 40], x: [260, 240], opacity: [0, 0.8, 0] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: "linear" }}
            className="absolute text-[10px] font-mono text-amber-500/40"
          >
            const
          </motion.span>
          <motion.span
            animate={{ y: [145, 20], x: [280, 290], opacity: [0, 0.7, 0] }}
            transition={{ duration: 2.8, repeat: Infinity, delay: 0.9, ease: "linear" }}
            className="absolute text-xs font-mono text-zinc-500/50"
          >
            {"{}"}
          </motion.span>
          <motion.span
            animate={{ y: [155, 30], x: [240, 255], opacity: [0, 0.8, 0] }}
            transition={{ duration: 3.2, repeat: Infinity, delay: 0.4, ease: "linear" }}
            className="absolute text-[10px] font-mono text-amber-500/60"
          >
            🍵
          </motion.span>
          <motion.span
            animate={{ y: [150, 10], x: [300, 280], opacity: [0, 0.6, 0] }}
            transition={{ duration: 4, repeat: Infinity, delay: 1.2, ease: "linear" }}
            className="absolute text-[9px] font-mono text-zinc-500/40"
          >
            log()
          </motion.span>
        </div>

        {/* The Desk Surface */}
        <div className="z-10 w-full h-3 bg-zinc-300 dark:bg-zinc-700/80 rounded-full border-b border-zinc-200 dark:border-zinc-650" />

        {/* 1. Left Side: The Stove & Boiling Pot */}
        <div className="absolute left-[30px] bottom-[20px] flex flex-col items-center">
          {/* Boiling Pan */}
          <div className="relative z-10 w-28 h-15 bg-muted/95 rounded-b-2xl border-x-3 border-b-3 border-zinc-300 dark:border-zinc-700 shadow-sm overflow-hidden flex flex-col justify-end">
            {/* Boiling Liquid */}
            <div className="absolute bottom-0 w-full h-[70%] bg-gradient-to-t from-amber-900 via-amber-800 to-amber-700/90 border-t border-amber-600/50">
              {/* Bubbles */}
              <motion.div animate={{ y: [30, -5], x: [5, 10], opacity: [0, 1, 0] }} transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }} className="absolute w-1.5 h-1.5 rounded-full bg-amber-400/40" />
              <motion.div animate={{ y: [25, 0], x: [50, 45], opacity: [0, 0.8, 0] }} transition={{ duration: 1.5, repeat: Infinity, delay: 0.3, ease: "linear" }} className="absolute w-1 h-1 rounded-full bg-amber-300/50" />
              <motion.div animate={{ y: [28, -3], x: [80, 75], opacity: [0, 0.9, 0] }} transition={{ duration: 1.1, repeat: Infinity, delay: 0.6, ease: "linear" }} className="absolute w-2 h-2 rounded-full bg-amber-500/30" />
              {/* Froth */}
              <div className="absolute top-[-3px] w-full h-1.5 bg-amber-600/40 blur-[1px] flex gap-0.5 justify-around">
                <span className="w-3 h-1 bg-amber-500/30 rounded-full animate-bounce" />
                <span className="w-4 h-0.5 bg-amber-400/20 rounded-full animate-bounce delay-100" />
                <span className="w-2 h-1 bg-amber-500/30 rounded-full animate-bounce delay-200" />
              </div>
            </div>
          </div>

          {/* Pan Handle */}
          <div className="absolute z-0 left-[-22px] bottom-7 w-12 h-2.5 bg-zinc-400 dark:bg-zinc-900 rounded-l-full rotate-[-15deg] border border-zinc-300 dark:border-zinc-800" />

          {/* Stove Grid / Burner */}
          <div className="z-10 w-32 h-2 bg-zinc-300 dark:bg-zinc-700 rounded-full" />

          {/* Flames */}
          <div className="absolute bottom-[-10px] w-20 h-4 flex justify-around items-end px-2 opacity-90">
            <motion.div animate={{ height: [8, 16, 8] }} transition={{ duration: 0.4, repeat: Infinity }} className="w-2 bg-gradient-to-t from-amber-600 via-amber-500 to-yellow-450 rounded-t-full filter blur-[0.5px]" />
            <motion.div animate={{ height: [10, 20, 10] }} transition={{ duration: 0.35, repeat: Infinity, delay: 0.1 }} className="w-2 bg-gradient-to-t from-amber-600 via-amber-500 to-yellow-450 rounded-t-full filter blur-[0.5px]" />
            <motion.div animate={{ height: [12, 22, 12] }} transition={{ duration: 0.45, repeat: Infinity, delay: 0.05 }} className="w-2.5 bg-gradient-to-t from-amber-600 via-amber-500 to-yellow-450 rounded-t-full filter blur-[0.5px]" />
            <motion.div animate={{ height: [9, 18, 9] }} transition={{ duration: 0.38, repeat: Infinity, delay: 0.15 }} className="w-2 bg-gradient-to-t from-amber-600 via-amber-500 to-yellow-450 rounded-t-full filter blur-[0.5px]" />
          </div>

          {/* Stove Stand */}
          <div className="z-0 w-24 h-1.5 bg-zinc-200 dark:bg-zinc-950 rounded-b-md" />
        </div>

        {/* 2. Center: Steam Cutting Chai Glass on Desk */}
        <div className="absolute left-[175px] bottom-[20px] z-10 flex flex-col items-center">
          <div className="w-5 h-9 border border-foreground/30 rounded-b-sm relative bg-foreground/5 backdrop-blur-xs flex flex-col justify-end overflow-hidden shadow-xs">
            <div className="w-full h-[70%] bg-gradient-to-t from-amber-800 to-amber-600" />
          </div>
        </div>

        {/* 3. Right Side: Coder Coder & Laptop */}
        <div className="absolute right-[20px] bottom-[20px] flex items-end">
          {/* Laptop Base & Open Lid */}
          <div className="relative z-10 flex flex-col items-end mr-[-20px] mb-[-4px]">
            {/* Screen Lid (3/4 open profile) */}
            <div className="w-20 h-14 bg-zinc-200 dark:bg-zinc-850 border border-zinc-350 dark:border-zinc-700 rounded-t-md relative flex items-center justify-center origin-bottom rotate-[-5deg] mr-2">
              {/* Screen Display content */}
              <div className="w-[90%] h-[90%] bg-zinc-950 rounded-xs relative overflow-hidden flex flex-col justify-between p-1">
                <div className="flex gap-0.5">
                  <span className="w-1.5 h-1 bg-red-500 rounded-full" />
                  <span className="w-1.5 h-1 bg-yellow-500 rounded-full" />
                  <span className="w-1.5 h-1 bg-green-500 rounded-full" />
                </div>
                <div className="w-6 h-3 bg-amber-500/20 rounded-xs border border-amber-500/40 flex items-center justify-center">
                  <span className="text-[5px] font-mono text-amber-500 scale-75 animate-pulse">code</span>
                </div>
              </div>
              {/* Screen Glow */}
              <div className="absolute inset-0 bg-amber-500/5 rounded-md filter blur-xs animate-pulse" />
            </div>
            {/* Keyboard base */}
            <div className="w-24 h-1.5 bg-zinc-300 dark:bg-zinc-900 border-b border-zinc-400 dark:border-zinc-950 rounded-b-sm relative z-20" />
          </div>

          {/* Student Coder Figure */}
          <div className="flex flex-col items-center relative z-0">
            {/* Head & Hair */}
            <div className="w-11 h-11 bg-amber-100 dark:bg-amber-800/80 rounded-full relative overflow-hidden border border-zinc-200 dark:border-zinc-700 flex items-center justify-center">
              {/* Hair/Cap */}
              <div className="absolute top-0 w-full h-[60%] bg-zinc-400 dark:bg-zinc-700 rounded-t-full" />
              {/* Glasses */}
              <div className="absolute top-[40%] flex gap-1 z-10 opacity-70">
                <span className="w-3.5 h-2.5 border border-zinc-800 dark:border-zinc-200 rounded-xs bg-zinc-950/20" />
                <span className="w-3.5 h-2.5 border border-zinc-800 dark:border-zinc-200 rounded-xs bg-zinc-950/20" />
              </div>
            </div>

            {/* Torso / Hoodie */}
            <div className="w-16 h-18 bg-zinc-200 dark:bg-zinc-850 rounded-t-2xl relative border-t border-zinc-350 dark:border-zinc-700 flex justify-center items-end">
              {/* Hoodie string */}
              <div className="absolute top-2 w-1.5 h-5 bg-zinc-400 dark:bg-zinc-600 rounded-full" />

              {/* Arms Typing */}
              <div className="absolute bottom-1 w-full flex justify-between px-1">
                {/* Left hand typing */}
                <motion.div
                  animate={{ y: [0, -4, 0] }}
                  transition={{ duration: 0.25, repeat: Infinity, ease: "easeInOut" }}
                  className="w-3 h-3 rounded-full bg-amber-100 dark:bg-amber-800/80 border border-zinc-300 dark:border-zinc-700"
                />
                {/* Right hand typing */}
                <motion.div
                  animate={{ y: [0, -3, 0] }}
                  transition={{ duration: 0.2, repeat: Infinity, delay: 0.08, ease: "easeInOut" }}
                  className="w-3 h-3 rounded-full bg-amber-100 dark:bg-amber-800/80 border border-zinc-300 dark:border-zinc-700"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function AuthLayout({ children, subtitle }: AuthLayoutProps) {
  const [quoteIndex, setQuoteIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setQuoteIndex((prev) => (prev + 1) % QUOTES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen w-full flex bg-background text-foreground overflow-hidden">
      {/* Left Panel - Illustration & Branding (Hidden on mobile) */}
      <div className="hidden lg:flex w-1/2 h-screen bg-card text-foreground flex-col justify-between p-8 xl:p-12 relative overflow-hidden border-r border-border">
        {/* Decorative Background Elements */}
        <HexagonPattern className="opacity-15 dark:opacity-[0.08]" />

        {/* Top Section */}
        <div className="relative z-10 flex-shrink-0">
          <Link href="/" className="flex items-center gap-3 group w-fit">
            <div className="bg-muted p-2.5 rounded-xl border border-border group-hover:border-amber-500/40 transition-colors duration-300">
              <Logo size={36} className="text-amber-500 group-hover:rotate-6 transition-transform duration-300" />
            </div>
            <div>
              <span className="text-2xl font-extrabold tracking-tight text-foreground leading-none block">
                BrewedMinds
              </span>
              <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider mt-1 block">
                ChaiCode GenAI Mentor Platform
              </span>
            </div>
          </Link>
        </div>

        {/* Center / Illustration Section */}
        <div className="relative z-10 flex flex-col justify-between flex-1 w-full min-h-0 py-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="flex-1 flex flex-col justify-between min-h-0 gap-6"
          >
            {/* Header Text block */}
            <div className="space-y-3 flex-shrink-0">
              <Badge variant="outline" className="px-3 py-1 border-amber-500/20 bg-amber-500/5 text-amber-600 dark:text-amber-400 font-semibold select-none">
                🍵 100% Adrak &amp; Cardamom Vibes
              </Badge>
              <h2 className="text-3xl xl:text-4xl font-extrabold tracking-tight leading-tight text-foreground">
                Logic building start
                <br />
                hoti hai ek garam{" "}
                <span className="text-[#D4A76A] font-bold">
                  Chai
                </span>{" "}
                se.
              </h2>
              <p className="text-muted-foreground text-xs leading-relaxed">
                No corporate slideshows, no enterprise jargon. Just Hitesh and Piyush sharing core architecture, NIT-Jaipur hostel stories, and systems engineering code. Grab a hot glass of cutting chai and let&apos;s compile some logic.
              </p>
            </div>

            {/* Handcrafted CSS Coder & Chai Scene Illustration */}
            <div className="flex-1 min-h-[220px] flex items-center justify-center">
              <ChaiSceneIllustration />
            </div>

            {/* Dynamic Quote Box */}
            <div className="relative bg-muted/40 backdrop-blur-md p-5 rounded-2xl border border-border min-h-[120px] flex flex-col justify-between flex-shrink-0">
              <div className="absolute top-4 right-4 opacity-10">
                <Quote className="h-8 w-8 text-foreground" />
              </div>
              <div className="flex-1 flex items-center">
                <AnimatePresence mode="wait">
                  <motion.p
                    key={quoteIndex}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.35 }}
                    className="text-foreground text-sm font-semibold italic leading-relaxed"
                  >
                    &ldquo;{QUOTES[quoteIndex].text}&rdquo;
                  </motion.p>
                </AnimatePresence>
              </div>
              <div className="mt-4 pt-3 border-t border-border flex items-center justify-between">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={quoteIndex}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.35 }}
                    className="flex flex-col"
                  >
                    <span className="text-xs text-foreground font-bold">{QUOTES[quoteIndex].author}</span>
                    <span className="text-[10px] text-muted-foreground font-medium">{QUOTES[quoteIndex].role}</span>
                  </motion.div>
                </AnimatePresence>
                <div className="flex gap-1">
                  {QUOTES.map((_, i) => (
                    <div
                      key={i}
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        i === quoteIndex ? "w-4 bg-amber-500" : "w-1.5 bg-border"
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Bottom Section */}
        <div className="relative z-10 flex items-center justify-between text-xs text-muted-foreground pt-6 border-t border-border flex-shrink-0">
          <p>© {new Date().getFullYear()} BrewedMinds. All rights reserved.</p>
          <Link href="/" className="hover:text-foreground flex items-center gap-1 transition-colors">
            <ArrowLeft className="h-3 w-3" /> Back to Home
          </Link>
        </div>
      </div>

      {/* Right Panel - Auth Component Container */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 bg-background relative overflow-y-auto">
        <HexagonPattern className="opacity-[0.03] dark:opacity-[0.05]" />
        
        {/* Floating Mobile Home Button */}
        <div className="absolute top-6 left-6 lg:hidden z-20">
          <Link
            href="/"
            className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg border border-border bg-card/60 backdrop-blur-md hover:bg-muted/50 transition-colors"
          >
            <ArrowLeft className="h-3 w-3" /> Home
          </Link>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-md flex flex-col items-center gap-6"
        >
          {/* Mobile Logo Header */}
          <div className="flex flex-col items-center gap-2 lg:hidden text-center">
            <Logo size={44} className="text-amber-500 animate-pulse" />
            <h1 className="text-xl font-black tracking-tight mt-1">BrewedMinds</h1>
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          </div>

          <div className="w-full shadow-2xl lg:shadow-none rounded-2xl overflow-hidden flex justify-center">
            {children}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
