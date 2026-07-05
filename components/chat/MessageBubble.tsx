import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import Image from "next/image";
import type { Message, PersonaId } from "@/types";
import { cn, formatTimestamp } from "../../utils/helpers";
import { getPersona } from "../../data/personas/registry";
import { VoiceButton } from "./VoiceButton";

interface Props {
  message: Message;
  activePersona: PersonaId;
}

export function MessageBubble({ message, activePersona }: Props) {
  const isUser = message.role === "user";
  const persona = getPersona(activePersona);
  const voiceEnabled = !isUser && persona.voice?.enabled && message.content.trim() !== "";

  return (
    <div className={cn("flex gap-3 px-4 py-3", isUser && "flex-row-reverse")}>
      {/* Avatar */}
      <div
        className={cn(
          "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1 overflow-hidden",
          isUser
            ? "bg-primary text-primary-foreground text-sm"
            : "border border-border/40"
        )}
      >
        {isUser ? (
          "S"
        ) : (
          <Image
            src={persona.avatar}
            alt={persona.name}
            width={32}
            height={32}
            className="w-full h-full object-cover"
          />
        )}
      </div>

      {/* Bubble */}
      <div
        className={cn(
          "max-w-[75%] rounded-2xl px-4 py-3 text-sm",
          isUser
            ? "bg-primary text-primary-foreground rounded-tr-sm"
            : "bg-muted text-foreground rounded-tl-sm"
        )}
      >
        <ReactMarkdown
          components={{
            code({ className, children, ...props }) {
              const match = /language-(\w+)/.exec(className || "");
              const isBlock = !!match;
              return isBlock ? (
                <SyntaxHighlighter
                  style={oneDark}
                  language={match[1]}
                  PreTag="div"
                  className="rounded-lg !my-3 !text-xs"
                >
                  {String(children).replace(/\n$/, "")}
                </SyntaxHighlighter>
              ) : (
                <code
                  className="bg-black/20 rounded px-1 py-0.5 text-xs font-mono"
                  {...props}
                >
                  {children}
                </code>
              );
            },
            p({ children }) {
              return <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>;
            },
            ul({ children }) {
              return <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>;
            },
            ol({ children }) {
              return <ol className="list-decimal list-inside mb-2 space-y-1">{children}</ol>;
            },
            strong({ children }) {
              return <strong className="font-semibold">{children}</strong>;
            },
            h3({ children }) {
              return <h3 className="font-bold text-base mt-3 mb-1">{children}</h3>;
            },
          }}
        >
          {message.content}
        </ReactMarkdown>

        {voiceEnabled && (
          <VoiceButton
            messageId={message.id}
            text={message.content}
            personaId={activePersona}
          />
        )}

        <div
          className={cn(
            "text-xs mt-1 opacity-50",
            isUser ? "text-right" : "text-left"
          )}
        >
          {formatTimestamp(message.timestamp)}
        </div>
      </div>
    </div>
  );
}