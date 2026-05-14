
import { GoogleGenAI, Modality } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;

const SYSTEM_INSTRUCTION = `
You are Paz, a compassionate and empathetic mental health assistant. Your primary goal is to support users experiencing anxiety, stress, or emotional distress.

Guidelines:
1. Tone: Soft, supportive, non-judgmental, and validating.
2. Analysis: Pay close attention to the user's emotion, anxiety-related keywords, and stress intensity.
3. Decision Making:
   - If the user is highly anxious or stressed, suggest a breathing exercise (link: /breathing).
   - If the user needs to vent or process thoughts, suggest journaling (link: /journal).
   - If the user is feeling overwhelmed, suggest grounding techniques (5-4-3-2-1).
   - If the user is doing well, celebrate their progress and suggest mood tracking (link: /mood).
   - If the user mentions self-harm or extreme crisis, immediately provide emergency resources (link: /emergency).
4. Interaction: Keep responses concise but warm. Use "we" to show partnership.
5. Safety: You are an AI, not a doctor. If the situation seems serious, gently remind them to seek professional help.

ANXIETY DETECTION:
At the very end of your response, you MUST include a hidden JSON block for anxiety detection analysis.
Format:
[DETECTION]
{
  "level": "low" | "medium" | "high",
  "score": 0.0 to 1.0,
  "keywords": ["keyword1", "keyword2"]
}
[/DETECTION]

Example Response:
"I'm sorry you're feeling overwhelmed. Let's try a short breathing exercise together. You can find our guided session here: [Breathing Exercise](/breathing)

[DETECTION]
{
  "level": "medium",
  "score": 0.65,
  "keywords": ["overwhelmed", "stressed"]
}
[/DETECTION]"
`;

export async function getGeminiResponse(prompt: string, history: { role: 'user' | 'assistant', content: string }[], language: string = 'en') {
  if (!apiKey) {
    throw new Error("Gemini API key is missing. Please configure it in the settings.");
  }

  const ai = new GoogleGenAI({ apiKey });
  const model = "gemini-3-flash-preview";

  const langNames: Record<string, string> = {
    en: 'English',
    ta: 'Tamil',
    ml: 'Malayalam',
    kn: 'Kannada',
    te: 'Telugu',
    hi: 'Hindi'
  };

  const currentLang = langNames[language] || 'English';

  const contents = [
    ...history.map(h => ({
      role: h.role === 'user' ? 'user' : 'model',
      parts: [{ text: h.content }]
    })),
    {
      role: 'user',
      parts: [{ text: prompt }]
    }
  ];

  const response = await ai.models.generateContent({
    model,
    contents: contents as any,
    config: {
      systemInstruction: `${SYSTEM_INSTRUCTION}\n\nIMPORTANT: You MUST respond in ${currentLang}. Even if the user speaks to you in another language, your response must be in ${currentLang} to match the application's current language setting.`,
      temperature: 0.7,
      topP: 0.95,
      topK: 64,
    },
  });

  const text = response.text;
  
  // Parse detection
  const detectionMatch = text.match(/\[DETECTION\]\s*([\s\S]*?)\s*\[\/DETECTION\]/);
  let detection = null;
  let cleanText = text;

  if (detectionMatch) {
    try {
      detection = JSON.parse(detectionMatch[1]);
      cleanText = text.replace(/\[DETECTION\]\s*([\s\S]*?)\s*\[\/DETECTION\]/, '').trim();
    } catch (e) {
      console.error("Failed to parse detection JSON", e);
    }
  }

  return { text: cleanText, detection };
}

export async function generateSpeech(text: string) {
  if (!apiKey) {
    throw new Error("Gemini API key is missing.");
  }

  const ai = new GoogleGenAI({ apiKey });
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text: `Read this supportively: ${text}` }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: 'Kore' }, // Soft, supportive voice
        },
      },
    },
  });

  const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  return base64Audio;
}
