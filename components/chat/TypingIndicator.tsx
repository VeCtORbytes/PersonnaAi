export function TypingIndicator() {
  return (
    <div className="flex gap-3 px-4 py-3">
      {/* Avatar placeholder */}
      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0 mt-1 opacity-50" />

      {/* Indicator bubble */}
      <div className="bg-muted text-foreground rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1.5 min-h-[40px]">
        <span className="w-2 h-2 rounded-full bg-foreground/40 animate-bounce [animation-delay:0ms] [animation-duration:1s]" />
        <span className="w-2 h-2 rounded-full bg-foreground/40 animate-bounce [animation-delay:150ms] [animation-duration:1s]" />
        <span className="w-2 h-2 rounded-full bg-foreground/40 animate-bounce [animation-delay:300ms] [animation-duration:1s]" />
      </div>
    </div>
  );
}
