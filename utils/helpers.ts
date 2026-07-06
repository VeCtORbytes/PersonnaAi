import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 15);
}

export function formatTimestamp(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

/**
 * Localized phonetic mapping for Hinglish words to ensure proper TTS pronunciation.
 * Maps common Roman Hinglish text to Devanagari script equivalents.
 */
const HINGLISH_PHONETIC_MAP: Record<string, string> = {
  "ye": "ये",
  "aur": "और",
  "hain": "हैं",
  "hai": "है",
  "dono": "दोनों",
  "samajh": "समझ",
  "lo": "लो",
  "lagao": "लगाओ",
  "bhi": "भी",
  "hoon": "हूँ",
  "hu": "हूँ",
  "bhai": "भाई",
  "ko": "को",
  "ki": "की",
  "ke": "के",
  "ka": "का",
  "se": "से",
  "me": "में",
  "mein": "में",
  "toh": "तो",
  "to": "तो",
  "kr": "कर",
  "kar": "कर",
  "rha": "रहा",
  "raha": "रहा",
  "smjh": "समझ",
  "hitesh": "Hitesh",
  "piyush": "Piyush",
  "sir": "सर",
  "naam": "नाम",
  "kya": "क्या",
  "chal": "चल",
  "gya": "गया",
  "gaya": "गया",
  "thi": "थी",
  "tha": "था",
  "diya": "दिया",
  "liye": "लिए",
  "apna": "अपना",
  "apne": "अपने",
  "chahiye": "चाहिए",
  "peete": "पीते",
  "peeke": "पीकर",
  "sahi": "सही",
  "galat": "गलत",
  "sab": "सब",
  "ek": "एक",
  "do": "दो",
  "teen": "तीन",
  "chaar": "चार",
  "paanch": "पांच",
  "ache": "अच्छे",
  "acha": "अच्छा",
  "meri": "मेरी",
  "mera": "मेरा",
  "mere": "मेरे",
  "tum": "तुम",
  "aap": "आप",
  "batao": "बताओ",
  "seekhna": "सीखना",
  "samajhna": "समझना",
  "codebase": "codebase",
  "important": "important",
  "redis": "redis",
  "kafka": "kafka",
  "docker": "docker",
  "nginx": "nginx",
  "api": "API",
  "apis": "APIs",
};

export function preprocessPhoneticHinglish(text: string): string {
  return text
    .split(/(\b\w+\b)/g)
    .map(part => {
      const lower = part.toLowerCase();
      return HINGLISH_PHONETIC_MAP[lower] ?? part;
    })
    .join("");
}
