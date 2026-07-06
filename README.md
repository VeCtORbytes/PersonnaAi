# BrewedMinds

> AI-powered conversations with India's top tech educators — Hitesh Choudhary and Piyush Garg.

🔗 **Live Demo**: [https://brewedminds.vercel.app](https://personna-ai.vercel.app/)

---

## What is this?

BrewedMinds simulates deep, believable conversations with two of India's most well-known software engineering educators. This isn't a simple `system: "You are Hitesh"` chatbot. Each persona is built from structured behavioral data — teaching philosophy, communication style, Hinglish patterns, favorite phrases, humor fingerprints, and few-shot conversation examples — assembled dynamically into a prompt pipeline at runtime.

---

## Features

- **Believable AI personas** — deep behavioral prompting beyond name-injection
- **Streaming responses** — token-by-token rendering via Vercel AI SDK
- **Markdown + syntax highlighting** — code blocks rendered with `react-syntax-highlighter`
- **Text-to-speech** — Hinglish-aware TTS with Devanagari transliteration
- **Persona-specific theming** — amber for Hitesh, purple for Piyush
- **Token-aware memory** — sliding window history trimmer stays within Groq's TPM limit
- **Rate limiting** — per-persona quotas, keyed by `clientId:personaId`
- **Dark / light mode** — system preference detection via `next-themes`
- **Topic suggestions** — contextual prompt pills per persona
- **Mobile responsive** — works on 375px+

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS + shadcn/ui |
| AI SDK | Vercel AI SDK (`streamText`) |
| LLM Provider | Groq (`llama-3.3-70b-versatile`) |
| Animations | Framer Motion |
| Toasts | Sonner |
| Dark mode | next-themes |
| Deployment | Vercel |

---

## Architecture

```
User
 ↓
PersonaSelector (client state)
 ↓
useChat hook → POST /api/chat
 ↓
MemoryManager.trimHistory() — token budget: 4000
 ↓
PersonaRegistry.getPersona(id)
 ↓
PromptBuilder.buildPrompt(persona, history, message) → ModelMessage[]
 ↓
AIProvider → Groq (llama-3.3-70b-versatile)
 ↓
streamText() → ReadableStream → SSE
 ↓
UI renders tokens as they arrive
```

---

## Folder Structure

```
persona-ai/
├── app/
│   ├── api/
│   │   ├── chat/route.ts       # Only LLM boundary
│   │   └── tts/route.ts        # TTS + Hinglish transliterator
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── chat/                   # ChatWindow, MessageBubble, MessageList, Input, TypingIndicator
│   └── persona/                # PersonaSelector
├── data/personas/
│   ├── hiteshSir.ts            # Full Hitesh persona object
│   ├── piyushSir.ts            # Full Piyush persona object
│   └── registry.ts             # getPersona(), getAllPersonas()
├── lib/
│   ├── ai/provider.ts          # Groq client + AI_CONFIG
│   ├── prompt/builder.ts       # Pure fn: buildPrompt()
│   ├── memory/context.ts       # trimHistory(), estimateTokens()
│   └── voice/                  # TTS pipeline: splitter, cache, player
├── hooks/useChat.ts            # All client state + streaming fetch
├── context/VoiceContext.tsx    # TTS prefetching + audio lifecycle
└── types/index.ts              # Shared types
```

---

## Prompt Architecture

Each request assembles a prompt in this order:

```
System Prompt (role + behavior rules)
      ↓
Persona Block (tone, style, philosophy, do/dont, phrases)
      ↓
Few-shot Examples (3–5 real conversation examples per persona)
      ↓
Formatting Rules
      ↓
Trimmed Conversation History (within 4000 token budget)
      ↓
Current User Message
```

The prompt builder (`lib/prompt/builder.ts`) is a pure function — same inputs always produce the same output. Testable and isolated from UI and API logic.

---

## Persona Design

Each persona is a TypeScript object (not a JSON file — full compile-time type safety) with:

- `tone` — with hard response-length rules at the top (LLM reads first)
- `teaching_style` — exact teaching hierarchy (10 steps for Hitesh, 7 for Piyush)
- `humor_style` — signature humor patterns (minoxidil jokes, heartbreak analogies, self-flex for Piyush; dry Hinglish humor for Hitesh)
- `behavioral_fingerprint` — micro-behaviors that define the person
- `language_rules` — Hinglish patterns, tum/aap enforcement (Piyush never says "tu")
- `examples` — 7–9 few-shot conversations covering casual, technical, career, and identity

Adding a new persona = create one `.ts` file + register it. Zero logic changes.

---

## Local Development

```bash
git clone https://github.com/VeCtORbytes/persona-ai.git
cd persona-ai
npm install
cp .env.example .env.local
# Add your GROQ_API_KEY to .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Environment Variables

```bash
GROQ_API_KEY=           # Required — get free at console.groq.com
AI_MODEL=               # Optional — defaults to llama-3.3-70b-versatile
```

---

## Key Engineering Decisions

**Why TypeScript for personas, not JSON?**
Compile-time validation. A typo in a JSON key silently breaks the prompt. A typo in a TypeScript field is a build error.

**Why token budget trimming, not summarization?**
Groq free tier caps at 6000 TPM. Trimming is deterministic, zero-latency, and sufficient for session-length conversations. Summarization hook exists in `context.ts` for Phase 2.

**Why Groq over OpenAI?**
Groq's `llama-3.3-70b-versatile` has the lowest first-token latency available for free tier — critical for streaming UX. Provider abstraction in `lib/ai/provider.ts` means swapping to OpenAI is a one-line change.

**Why no database?**
Session-only memory keeps the architecture simple for v1. `localStorage` persistence is a 2-hour addition when needed.

---

## Roadmap

- [ ] Debate Mode — split-screen dual persona simultaneous responses
- [ ] Conversation persistence with localStorage
- [ ] Conversation sidebar with thread history
- [ ] Audio waveform visualizer (wavesurfer.js)
- [ ] Command palette (cmdk)
- [ ] Export conversation as Markdown

---

## Built by

Sarthak Gupta — [GitHub](https://github.com/VeCtORbytes) · [Hashnode](https://sarthakgupta25.hashnode.dev)

Built as part of the **ChaiCode GenAI Engineering Cohort**.

#chaicode #genaicohort
