import type { ModelMessage } from "ai";
import type { Message, Persona } from "@/types";

function buildSystemPrompt(persona: Persona, userName?: string, isFallback: boolean = false): string {
  const sections: string[] = [];

  // Core identity
  sections.push(`
You are roleplaying as ${persona.name}.
You are NOT an AI assistant. You ARE ${persona.name}.
Never break character. Never say you are an AI unless directly asked — and even then, deflect naturally in ${persona.name}'s voice.
`.trim());

  // User identity personalisation — placed near top so LLM prioritises it
  if (userName) {
    sections.push(`USER IDENTITY:
The student you are talking to is named "${userName}".
- Address them by their first name naturally and warmly — exactly as ${persona.name} would greet a student.
- Don't overuse it; weave it in at natural moments (greeting, encouragement, calling out a mistake, wrapping up).
- Never repeat the name more than once or twice per response.`);
  }

  // Tone
  sections.push(`TONE:\n${persona.tone}`);

  // Teaching style
  sections.push(`TEACHING STYLE:\n${persona.teaching_style}`);

  // Communication
  sections.push(`COMMUNICATION:\n${persona.communication}`);

  // Skip heavy engineering and learning philosophy essays on fallback paths to fit strict TPM quotas (like 6000 TPM)
  if (!isFallback) {
    if (persona.reasoning) {
      sections.push(`REASONING APPROACH:\n${persona.reasoning}`);
    }

    if (persona.explanation_engine) {
      sections.push(`EXPLANATION ENGINE:\n${persona.explanation_engine}`);
    }

    if (persona.analogy_engine) {
      sections.push(`ANALOGY ENGINE:\n${persona.analogy_engine}`);
    }

    if (persona.beginner_handling) {
      sections.push(`HANDLING BEGINNERS:\n${persona.beginner_handling}`);
    }

    if (persona.advanced_handling) {
      sections.push(`HANDLING ADVANCED USERS:\n${persona.advanced_handling}`);
    }

    if (persona.humor_style) {
      sections.push(`HUMOR STYLE:\n${persona.humor_style}`);
    }

    if (persona.uncertainty_policy) {
      sections.push(`UNCERTAINTY POLICY:\n${persona.uncertainty_policy}`);
    }

    if (persona.motivation_style) {
      sections.push(`MOTIVATION STYLE:\n${persona.motivation_style}`);
    }

    if (persona.engineering_philosophy) {
      sections.push(`ENGINEERING PHILOSOPHY:\n${persona.engineering_philosophy}`);
    }

    if (persona.learning_philosophy) {
      sections.push(`LEARNING PHILOSOPHY:\n${persona.learning_philosophy}`);
    }

    if (persona.project_philosophy) {
      sections.push(`PROJECT PHILOSOPHY:\n${persona.project_philosophy}`);
    }

    // Optional Piyush-specific fields
    if (persona.thinking_style) {
      sections.push(`THINKING STYLE:\n${persona.thinking_style}`);
    }

    if (persona.product_philosophy) {
      sections.push(`PRODUCT PHILOSOPHY:\n${persona.product_philosophy}`);
    }

    if (persona.decision_framework) {
      sections.push(`DECISION FRAMEWORK:\n${persona.decision_framework}`);
    }

    if (persona.conversation_modes) {
      const modes = persona.conversation_modes;
      sections.push(`CONVERSATION MODES:
- Teaching: ${modes.teaching}
- Peer Discussion: ${modes.peer_discussion}
- Product Review: ${modes.product_review}
- Career Guidance: ${modes.career_guidance}`);
    }

    if (persona.favorite_phrases?.length) {
      sections.push(
        `FAVORITE PHRASES (use naturally, never force):\n${persona.favorite_phrases.map((p) => `- "${p}"`).join("\n")}`
      );
    }
  }

  if (persona.behavioral_fingerprint?.length) {
    sections.push(
      `BEHAVIORAL FINGERPRINT:\n${persona.behavioral_fingerprint.map((b) => `- ${b}`).join("\n")}`
    );
  }

  if (persona.knowledge_boundary) {
    sections.push(`KNOWLEDGE BOUNDARY:\n${persona.knowledge_boundary}`);
  }

  if (persona.conversation_rules?.length) {
    sections.push(
      `CONVERSATION RULES:\n${persona.conversation_rules.map((r) => `- ${r}`).join("\n")}`
    );
  }

  if (persona.language_rules?.length) {
    sections.push(
      `LANGUAGE RULES:\n${persona.language_rules.map((r) => `- ${r}`).join("\n")}`
    );
  }

  if (persona.do?.length) {
    sections.push(
      `ALWAYS DO:\n${persona.do.map((d) => `- ${d}`).join("\n")}`
    );
  }

  if (persona.dont?.length) {
    sections.push(
      `NEVER DO:\n${persona.dont.map((d) => `- ${d}`).join("\n")}`
    );
  }

  if (persona.avoid?.length) {
    sections.push(
      `AVOID:\n${persona.avoid.map((a) => `- ${a}`).join("\n")}`
    );
  }

  // Few-shot examples - streamlined for fallback models to fit in strict TPM quotas (e.g. 6000 TPM)
  if (persona.examples?.length) {
    // For fallback models, filter to only use short style-defining examples (under 250 characters response)
    const examplesToUse = isFallback
      ? persona.examples.filter((e) => e.response.length < 250)
      : persona.examples;

    if (examplesToUse.length > 0) {
      const exampleBlock = examplesToUse
        .map(
          (e) =>
            `User: ${e.user}\n${persona.name}: ${e.response}`
        )
        .join("\n\n---\n\n");

      sections.push(
        `FEW-SHOT EXAMPLES (study these carefully — this is exactly how you respond):\n\n${exampleBlock}`
      );
    }
  }

  // Formatting rules — always last
  sections.push(`FORMATTING RULES:
- Always format code in markdown code blocks with the language specified.
- Use markdown for structure when it aids clarity.
- Never respond with a single generic paragraph for conceptual questions.
- Match response length to complexity — short answers for simple questions, detailed for complex ones.`);

  return sections.join("\n\n---\n\n");
}

export function buildPrompt(
  persona: Persona,
  history: Message[],
  userMessage: string,
  userName?: string,
  isFallback: boolean = false
): ModelMessage[] {
  // If there is conversation history, we omit the massive static system prompt to save tokens,
  // speed up latency, and stay safely within Groq's token rate limits.
  // The model will infer its tone and signature Hinglish style from the previous turns in the history.
  const systemPrompt = history.length > 0
    ? `You are roleplaying as ${persona.name}. Maintain your character identity, Hinglish rules, and tone exactly as shown in the conversation history.`
    : buildSystemPrompt(persona, userName, isFallback);

  const historyMessages: ModelMessage[] = history.map((msg) => ({
    role: msg.role,
    content: msg.content,
  } as ModelMessage));

  return [
    { role: "system", content: systemPrompt },
    ...historyMessages,
    { role: "user", content: userMessage },
  ];
}