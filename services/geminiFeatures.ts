import { GoogleGenAI, Type, HarmCategory, HarmBlockThreshold, Modality } from "@google/genai";
import { TextAnalysisResult, GroundingChunk, SearchGroundingResult, TranscriptionResult, VideoAnalysisResult, TTSResult } from '../types';

/**
 * Helper function to get the Gemini API key from various sources
 * @returns string - The Gemini API key
 * @throws Error if no API key is found
 */
function getGeminiApiKey(): string {
  // Try to get the API key from environment variables (for Vite)
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY as string;
  
  if (!apiKey) {
    throw new Error("Gemini API key not found. Please set VITE_GEMINI_API_KEY in your environment variables.");
  }
  
  return apiKey;
}

/**
 * Safety settings for Gemini API calls
 * These settings disable content filtering to allow all types of content
 */
const GEMINI_SAFETY_SETTINGS = [
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
];

/**
 * Schema definition for text analysis results
 * Ensures consistent structure for analysis outputs
 */
const GEMINI_TEXT_ANALYSIS_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    sentiment: { type: Type.OBJECT, properties: { overall: { type: Type.STRING, enum: ["positive", "negative", "neutral"] }, score: { type: Type.NUMBER } }, required: ["overall", "score"] },
    trends: { type: Type.ARRAY, items: { type: Type.STRING } },
    summary: { type: Type.STRING },
    insights: { type: Type.STRING },
    content_type: { type: Type.STRING, enum: ["news", "blog", "ecommerce", "forum", "other"] }
  },
  required: ["sentiment", "trends", "summary", "insights", "content_type"]
};

/**
 * Creates a prompt for video analysis based on user input
 * @param customPrompt - User-provided prompt or instructions for analysis
 * @returns string - Formatted prompt for video analysis
 */
const createVideoPrompt = (customPrompt: string): string => {
  const userInstruction = customPrompt || 'Provide a general analysis of this video, focusing on sentiment, key trends, a summary, and actionable insights.';
  return `Analyze this video's content according to the user's instructions and provide the result in a JSON format that strictly adheres to the required schema.\n\nUser instructions:\n${userInstruction}`;
};

export async function getGeminiVideoAnalysis(videoData: string, mimeType: string, customPrompt: string, temperature: number): Promise<VideoAnalysisResult> {
    const apiKey = getGeminiApiKey();
    const ai = new GoogleGenAI({ apiKey });
    const prompt = createVideoPrompt(customPrompt);
    const videoPart = { inlineData: { data: videoData, mimeType } };
    const textPart = { text: prompt };
    
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: [{ parts: [videoPart, textPart] }],
        config: {
            responseMimeType: "application/json",
            responseSchema: GEMINI_TEXT_ANALYSIS_SCHEMA,
            safetySettings: GEMINI_SAFETY_SETTINGS,
            temperature,
        },
    });
    const text = response.text;
    if (!text || typeof text !== 'string') throw new Error("The AI model did not return any text content for the video analysis.");
    return JSON.parse(text.trim()) as VideoAnalysisResult;
}

export async function getGeminiSearchGrounding(customPrompt: string): Promise<SearchGroundingResult> {
    const apiKey = getGeminiApiKey();
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: customPrompt,
        config: {
            tools: [{ googleSearch: {} }],
            safetySettings: GEMINI_SAFETY_SETTINGS,
        },
    });

    const groundingMetadata = response.candidates?.[0]?.groundingMetadata;
    const citations = groundingMetadata?.groundingChunks?.filter(c => c.web) as GroundingChunk[] || [];

    return { text: response.text, citations };
}

export async function transcribeGeminiAudio(audioData: string, mimeType: string): Promise<TranscriptionResult> {
    const apiKey = getGeminiApiKey();
    const ai = new GoogleGenAI({ apiKey });
    const audioPart = { inlineData: { data: audioData, mimeType } };
    const textPart = { text: "Transcribe this audio recording." };

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [{ parts: [audioPart, textPart] }],
        config: { safetySettings: GEMINI_SAFETY_SETTINGS },
    });
    
    return { text: response.text };
}

export async function runGeminiComplexQuery(customPrompt: string, temperature: number): Promise<TextAnalysisResult> {
    const apiKey = getGeminiApiKey();
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
        model: "gemini-2.5-pro",
        contents: `Analyze the following user query and provide a structured analysis in JSON format that strictly adheres to the required schema.\n\nUser query: ${customPrompt}`,
        config: {
            responseMimeType: "application/json",
            responseSchema: GEMINI_TEXT_ANALYSIS_SCHEMA,
            safetySettings: GEMINI_SAFETY_SETTINGS,
            temperature,
            thinkingConfig: { thinkingBudget: 32768 }
        },
    });

    const text = response.text;
    if (!text || typeof text !== 'string') throw new Error("The AI model did not return any text content for the complex query.");
    return JSON.parse(text.trim()) as TextAnalysisResult;
}

export async function generateGeminiTTS(prompt: string): Promise<TTSResult> {
    const apiKey = getGeminiApiKey();
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: prompt }] }],
        config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: {
                voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } },
            },
        },
    });
    
    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) throw new Error("TTS generation failed, no audio data returned.");
    return { audioBase64: base64Audio };
}
