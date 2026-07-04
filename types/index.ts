export type PersonaId = "hitesh" | "piyush";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export interface PersonaExample {
  user: string;
  response: string;
}

export interface Persona {
  id: PersonaId;
  name: string;
  avatar: string;
  tagline: string;
  tone: string;
  teaching_style: string;
  communication: string;
  favorite_phrases?: string[];
  knowledge_boundary?: string;
  do?: string[];
  dont?: string[];
  examples?: PersonaExample[];

  // Piyush specific optional fields
  thinking_style?: string;
  conversation_modes?: {
    teaching: string;
    host: string;
    peer_discussion: string;
    product_review: string;
    career_guidance: string;
  };
  product_philosophy?: string;
  decision_framework?: string;
  behavioral_fingerprint?: string[];

  // Hitesh specific optional fields to resolve compile errors
  engineering_philosophy?: string;
  reasoning?: string;
  explanation_engine?: string;
  analogy_engine?: string;
  motivation_style?: string;
  learning_philosophy?: string;
  beginner_handling?: string;
  advanced_handling?: string;
  humor_style?: string;
  uncertainty_policy?: string;
  project_philosophy?: string;
  conversation_rules?: string[];
  language_rules?: string[];
  avoid?: string[];

  // Voice configuration for TTS
  voice?: VoiceConfig;
}

export interface VoiceConfig {
  enabled: boolean;
  provider?: "fish" | string;
  voiceId?: string;
  language?: string;
  playbackRate?: number;
  autoPlay?: boolean;
  scriptType?: "devanagari" | "roman";
}

export interface ChatState {
  messages: Message[];
  persona: PersonaId;
  isLoading: boolean;
}