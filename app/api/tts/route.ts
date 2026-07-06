import { NextRequest, NextResponse } from "next/server";
import { generateText } from "ai";
import { groq } from "@/lib/ai/provider";
import { synthesizeSpeech } from "@/lib/voice/provider";
import { rateLimiter } from "@/lib/rateLimiter/provider";
import { getPersona } from "@/data/personas/registry";
import { preprocessPhoneticHinglish } from "@/utils/helpers";
import type { PersonaId } from "@/types";

export async function POST(req: NextRequest) {
  try {
    // 1. Request Parsing & Validation
    const body = await req.json();
    const { text, personaId } = body as { text: string; personaId: PersonaId };

    if (!text?.trim()) {
      return NextResponse.json(
        { error: "Text is required" },
        { status: 400 }
      );
    }

    if (!personaId || !["hitesh", "piyush"].includes(personaId)) {
      return NextResponse.json(
        { error: "Invalid personaId" },
        { status: 400 }
      );
    }

    // 2. Rate Limiting Check (Separately allocated per persona)
    const clientId =
      req.headers.get("x-forwarded-for") ||
      req.headers.get("x-real-ip") ||
      "127.0.0.1";

    const rateLimitKey = `${clientId}:${personaId}`;
    const limitResult = await rateLimiter.check(rateLimitKey);

    const limitHeaders = {
      "X-RateLimit-Limit": limitResult.limit.toString(),
      "X-RateLimit-Remaining": limitResult.remaining.toString(),
      "X-RateLimit-Reset": limitResult.reset.toString(),
    };

    if (!limitResult.allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429, headers: limitHeaders }
      );
    }

    // 3. Resolving script type configuration
    const persona = getPersona(personaId);
    const scriptType = persona.voice?.scriptType ?? "devanagari";

    // 4. Translating or normalising Hinglish using a fast LLM based on script support
    let textToSynthesize = text;
    try {
      // Using llama-3.1-8b-instant to stay within organization token quotas (TPD) on Groq
      const translationModel = groq("llama-3.1-8b-instant");
      
      const systemPrompt =
        scriptType === "roman"
          ? `You are a strict phonetic romanization normalizer for a Text-to-Speech system.
Your only job is to clean up, simplify, and normalize Roman-script Hinglish text into a clean standard Roman script (Latin script). Do NOT convert any words to Devanagari script (Hindi characters). Keep the text entirely in English script.

Rules:
1. Normalize texting shortcuts and casual typos into standard Hinglish spellings (e.g. "smjh" -> "samajh", "kr" -> "kar", "rha" -> "raha", "s" -> "is", "ne" -> "ne", "me" -> "me", "hu" -> "hoon").
2. Keep English words exactly as they are written in the input text in English script (e.g., "redis", "cache", "save", "video", "youtube", "welcome").
3. The output must be written 100% in English/Latin script. No Devanagari characters allowed.
4. Do not add, remove, or modify the meaning of any words.
5. Keep all original punctuation (., !, ?, ,, -) exactly where they were. Do not drop or add symbols.
6. Under no circumstances should you add any explanation, notes, or introductory/trailing comments. You must output the final result wrapped in <result> and </result> tags.
7. NEVER include words like "Note:", "Explanation:", "I have", or any conversational comments anywhere inside the <result> and </result> tags. The content inside the tags must ONLY be the translated speech text itself.

Examples:
Input: Perfect time to code then. Chai aur code — best combination hai.
Output: <result>Perfect time to code then. Chai aur code — best combination hai.</result>

Input: hello sir !! welcome nahi karoge
Output: <result>hello sir !! welcome nahi karoge</result>

Input: s bhai ne mujhe redis smjh liya, cache me reels save kr rha tha
Output: <result>is bhai ne mujhe redis samajh liya, cache me reels save kar raha tha</result>

Input: Mere liye chai ek comfort zone hai. Chai peeke code likhna mera favorite hai.
Output: <result>Mere liye chai ek comfort zone hai. Chai peeke code likhna mera favorite hai.</result>`
          : `You are a strict phonetic transliteration tool for Text-to-Speech.
Your job is to convert Roman-script Hindi words (Hinglish) into native Devanagari script (Hindi characters), while preserving all English words exactly in English script.

Rules:
1. Keep ALL English words (including conversational words, technical terms, coding terms, adverbs, and nouns) exactly as they are written in the input text in English script. Do NOT translate them into Hindi (e.g., do NOT change "especially" to "especially", do NOT change "welcome" to "welcome", do NOT change "perfect" to "perfect", do NOT change "time" to "time").
2. Only transliterate Roman-script Hindi words phonetically into Devanagari script (e.g., "bhai" -> "भाई", "aayega" -> "आएगा", "rha" -> "रहा", "peete" -> "पीते", "hai" -> "है", "hoon" -> "हूँ").
3. Capitalized Hindi words at the start of a sentence (like 'Dekho', 'Hanji', 'Bhai', 'Acha', 'Maan', 'Keso') must be transliterated to Devanagari script. Do not leave them in English script just because they are capitalized.
4. Do not add, remove, or modify any words. The output must have the exact same sequence of words, with Hindi words in Devanagari script and English words in English script.
5. Use standard English punctuation (., !, ?, ,, -) in the output. Do NOT use the Devanagari full stop (।). Keep all original commas, hyphens, exclamation marks, and periods exactly where they were.
6. Under no circumstances should you add any explanation, notes, or introductory/trailing comments. You must output the final result wrapped in <result> and </result> tags.
7. NEVER include words like "Note:", "Explanation:", "I have", or any conversational comments anywhere inside the <result> and </result> tags. The content inside the tags must ONLY be the translated speech text itself.

Examples:
Input: Hanji, main Hitesh Choudhary hoon. Main ek software engineer hoon aur ab full-time educator ban gaya hoon.
Output: <result>हाँजी, मैं Hitesh Choudhary हूँ। मैं एक software engineer हूँ और ab full-time educator बन गया हूँ.</result>

Input: Perfect time to code then. Chai aur code — best combination hai.
Output: <result>Perfect time to code then. चाय और code — best combination है.</result>

Input: hello sir !! welcome nahi karoge
Output: <result>hello sir !! welcome नहीं करोगे</result>

Input: s bhai ne mujhe redis smjh liya, cache me reels save kr rha tha
Output: <result>इस भाई ने मुझे redis समझ लिया, cache में reels save कर रहा था</result>

Input: Dekho, ye question bahut deep hai! Especially jab coding kar raha hota hoon.
Output: <result>देखो, ye question बहुत deep है! Especially जब coding कर रहा होता हूँ.</result>`;

      const { text: translatedText } = await generateText({
        model: translationModel,
        temperature: 0.0,
        system: systemPrompt,
        prompt: `Input: ${text}\nOutput:`,
      });

      if (translatedText?.trim()) {
        const match = translatedText.match(/<result>([\s\S]*?)<\/result>/i);
        let extracted = match ? match[1].trim() : translatedText.trim();

        // Strip any LLM notes/explanations that may have leaked inside the result tags
        extracted = extracted
          .replace(/\s*\(?Note\s*:\s*[\s\S]*?\)?/gi, "")
          .replace(/\s*\(?I have (transliterated|kept|translated)[\s\S]*?\)?/gi, "")
          .trim();

        if (!match) {
          extracted = extracted
            .split(/\r?\n/)
            .filter(line => !/^\s*(note|explanation|here is|translation)\s*:/i.test(line))
            .join("\n")
            .trim();
        }

        if (extracted) {
          textToSynthesize = extracted;
          console.log(
            `[TTS Translation - ${scriptType}] Original: "${text}" -> Processed: "${textToSynthesize}"`
          );
        }
      }
    } catch (transError) {
      console.error(
        "Hinglish text processing failed, falling back to original text:",
        transError
      );
    }

    // Preprocess Hinglish phonetically using dictionary helper to guarantee proper native accent
    const processedText = preprocessPhoneticHinglish(textToSynthesize);

    // 5. Speech Synthesis
    const audioBuffer = await synthesizeSpeech({
      text: processedText,
      personaId,
    });

    return new Response(audioBuffer, {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Length": audioBuffer.byteLength.toString(),
        ...limitHeaders,
      },
    });
  } catch (error: unknown) {
    console.error("[/api/tts] error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
