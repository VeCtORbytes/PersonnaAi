import { NextRequest, NextResponse } from "next/server";
import { generateText } from "ai";
import { getModel } from "@/lib/ai/provider";
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
    const cleanPunctuation = (str: string) => {
      return str
        .replace(/[—–-]/g, ", ") // Convert hyphens/dashes to commas for soft pauses
        .replace(/\s*,\s*/g, ", ") // Ensure single trailing space
        .replace(/\s*\.\s*/g, ". ") // Ensure single trailing space
        .replace(/\s*!\s*/g, "! ") // Ensure single trailing space
        .replace(/\s*\?\s*/g, "? ") // Ensure single trailing space
        .replace(/\s+/g, " ") // Clean multiple spaces
        .trim();
    };

    let textToSynthesize = cleanPunctuation(text);
    try {
      // Using gpt-4o-mini for highly accurate phonetic Hinglish-to-Devanagari translations
      const translationModel = getModel("gpt-4o-mini");
      
      const systemPrompt =
        scriptType === "roman"
          ? `You are a strict phonetic romanization normalizer for a Text-to-Speech system.
Your only job is to clean up, simplify, and normalize Roman-script Hinglish text into a clean standard Roman script (Latin script). Do NOT convert any words to Devanagari script (Hindi characters). Keep the text entirely in English script.

Rules:
1. Normalize texting shortcuts and casual typos into standard Hinglish spellings (e.g. "smjh" -> "samajh", "kr" -> "kar", "rha" -> "raha", "s" -> "is", "ne" -> "ne", "me" -> "me", "hu" -> "hoon").
2. Keep English words exactly as they are written in the input text in English script (e.g., "redis", "cache", "save", "video", "youtube", "welcome").
3. The output must be written 100% in English/Latin script. No Devanagari characters allowed.
4. Do not add, remove, or modify the meaning of any words.
5. Replace all hyphens (-), em-dashes (—), and double dashes (--) with standard commas (,) or periods (.) depending on the sentence flow. Ensure there is a single space after every punctuation mark (.,!?,).
6. Under no circumstances should you add any explanation, notes, or introductory/trailing comments. You must output the final result wrapped in <result> and </result> tags.
7. NEVER include words like "Note:", "Explanation:", "I have", or any conversational comments anywhere inside the <result> and </result> tags. The content inside the tags must ONLY be the translated speech text itself.

Examples:
Input: Perfect time to code then. Chai aur code, best combination hai.
Output: <result>Perfect time to code then. Chai aur code, best combination hai.</result>

Input: hello sir !! welcome nahi karoge
Output: <result>hello sir !! welcome nahi karoge</result>

Input: s bhai ne mujhe redis smjh liya, cache me reels save kr rha tha
Output: <result>is bhai ne mujhe redis samajh liya, cache me reels save kar raha tha</result>

Input: Mere liye chai ek comfort zone hai. Chai peeke code likhna mera favorite hai.
Output: <result>Mere liye chai ek comfort zone hai. Chai peeke code likhna mera favorite hai.</result>`
          : `You are a top-tier Hinglish-to-Devanagari translation and transliteration engine optimized for a Hindi Text-to-Speech (TTS) voice model.
Your task is to convert Hinglish text into a clean, natural Devanagari-focused script that a native Hindi voice model can read with perfect flow, meaning, and accent.

Rules:
1. Translate all Hindi words written in Roman letters into correct Devanagari script (e.g., "bhai" -> "भाई", "aayega" -> "आएगा", "rha" -> "रहा", "peete" -> "पीते", "hai" -> "है", "hoon" -> "हूँ", "se" -> "से", "ko" -> "को", "ye" -> "यह", "ab" -> "अब").
2. Transliterate general, conversational English words and fillers phonetically into Devanagari script so the Hindi voice model can pronounce them naturally without changing its script delivery mode (e.g., "actually" -> "एक्चुअली", "basically" -> "बेसिकली", "especially" -> "एस्पेशली", "welcome" -> "वेलकम", "perfect" -> "परफेक्ट", "time" -> "टाइम", "question" -> "क्वेश्चन", "simple" -> "सिंपल", "start" -> "स्टार्ट", "worst" -> "वर्स्ट", "year" -> "इयर", "best" -> "बेस्ट", "combination" -> "कॉम्बिनेशन", "design" -> "डिजाइन").
3. Keep ONLY core technical acronyms, coding terms, technologies, and specific brand names in standard English letters (e.g., "API", "AWS", "React", "Node", "Docker", "database", "code", "Redis", "Kafka", "Next.js"). These should remain in English script.
4. Replace all hyphens (-), em-dashes (—), and double dashes (--) with standard commas (,) or periods (.) to create natural pauses for the voice engine.
5. Always ensure there is a single space after every punctuation mark (.,!?,). Do NOT use the Devanagari full stop (।).
6. Under no circumstances should you add any explanation, notes, or introductory/trailing comments. You must output the final result wrapped in <result> and </result> tags.

Examples:
Input: Hanji, main Hitesh Choudhary hoon. Main ek software engineer hoon aur ab full-time educator ban gaya hoon.
Output: <result>हाँजी, मैं Hitesh Choudhary हूँ. मैं एक सॉफ्टवेयर इंजीनियर हूँ और अब फुल-टाइम एजुकेटर बन गया हूँ.</result>

Input: Perfect time to code then. Chai aur code, best combination hai.
Output: <result>परफेक्ट टाइम टू code करने का. चाय और code, बेस्ट कॉम्बिनेशन है.</result>

Input: hello sir !! welcome nahi karoge
Output: <result>हेलो सर! वेलकम नहीं करोगे?</result>

Input: s bhai ne mujhe redis smjh liya, cache me reels save kr rha tha
Output: <result>इस भाई ने मुझे Redis समझ लिया, cache में reels save कर रहा था.</result>

Input: Dekho, ye question bahut deep hai! Especially jab coding kar raha hota hoon.
Output: <result>देखो, यह क्वेश्चन बहुत डीप है! एस्पेशली जब coding कर रहा होता हूँ.</result>`;

      const { text: translatedText } = await generateText({
        model: translationModel,
        temperature: 0.0,
        system: systemPrompt,
        prompt: `Input: ${textToSynthesize}\nOutput:`,
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
          textToSynthesize = cleanPunctuation(extracted);
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
