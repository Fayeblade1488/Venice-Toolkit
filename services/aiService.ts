import {
  Content,
  FunctionDeclaration,
  GenerateContentResponse,
  GoogleGenAI,
  HarmBlockThreshold,
  HarmCategory,
  Part,
  Type,
} from "@google/genai";
import {
  AIProvider,
  ChatMessage,
  ImageAnalysisResult,
  ImageGenerationResult,
  ScrapedData,
  TextAnalysisResult,
  VeniceAICharacter,
} from "../types";

/**
 * Safety settings for Gemini API calls
 * These settings disable content filtering to allow all types of content
 */
const GEMINI_SAFETY_SETTINGS = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
];

// --- Universal Tool Definitions (OpenAI JSON Schema Format) ---

/**
 * Tool definition for refining analysis results
 * Allows users to modify or improve existing analysis through conversational interface
 */
export const REFINE_ANALYSIS_TOOL_OPENAI = {
  type: "function",
  function: {
    name: "refine_analysis",
    description:
      "Re-runs the analysis on the original content with new instructions. Use this when the user wants to alter, refine, or change the existing analysis results.",
    parameters: {
      type: "object",
      properties: {
        new_instructions: {
          type: "string",
          description:
            'The new, specific instructions from the user for how to refine the analysis. For example: "Focus on the financial aspects" or "Extract all names mentioned".',
        },
      },
      required: ["new_instructions"],
    },
  },
};

/**
 * Tool definition for fetching web content
 * Safely retrieves and sanitizes content from allowed domains
 */
export const WEB_FETCH_TOOL_OPENAI = {
  type: "function",
  function: {
    name: "web_fetch",
    description:
      "Fetch and sanitize text content from a single URL. Only allowed domains from the user's allowlist can be used.",
    parameters: {
      type: "object",
      properties: {
        url: {
          type: "string",
          description:
            "The URL to fetch, which must be on the configured allowlist.",
        },
        purpose: {
          type: "string",
          enum: ["model_list", "analysis", "cite"],
          description: "The reason for fetching the URL.",
        },
      },
      required: ["url", "purpose"],
    },
  },
};

/**
 * Tool definition for verifying API keys
 * Checks if an API key is valid without exposing the actual key
 */
export const VERIFY_API_KEY_TOOL_OPENAI = {
  type: "function",
  function: {
    name: "verify_api_key",
    description:
      "Verify the entered API key for a given provider without leaking the key.",
    parameters: {
      type: "object",
      properties: {
        provider: { type: "string", enum: Object.values(AIProvider) },
        keyRef: {
          type: "string",
          description: "Opaque handle of encrypted key in IndexedDB.",
        },
      },
      required: ["provider", "keyRef"],
    },
  },
};

/**
 * Tool definition for listing available AI models
 * Retrieves model IDs available for a specific provider
 */
export const LIST_MODELS_TOOL_OPENAI = {
  type: "function",
  function: {
    name: "list_models",
    description:
      "Return the current model IDs for a provider. Prefer official endpoints; otherwise extract from docs via URL Context and cache locally.",
    parameters: {
      type: "object",
      properties: {
        provider: { type: "string", enum: Object.values(AIProvider) },
        keyRef: { type: "string" },
      },
      required: ["provider"],
    },
  },
};

// --- Tool Implementations ---

/**
 * Fetches and sanitizes content from a specified URL
 * Only allows URLs from the provided allowlist for security
 * 
 * @param url - The URL to fetch content from
 * @param purpose - The purpose of the fetch (for logging/analysis)
 * @param allowlist - Array of allowed domains
 * @returns Promise<string> - The fetched and sanitized content, or an error message
 */
export async function performWebFetch(
  { url, purpose }: { url: string; purpose: string },
  allowlist: string[]
): Promise<string> {
  try {
    const parsedUrl = new URL(url);
    if (!allowlist.includes(parsedUrl.hostname)) {
      return `Error: Domain '${parsedUrl.hostname}' is not on the allowlist.`;
    }
  } catch (e) {
    return `Error: Invalid URL provided.`;
  }

  const PROXIES = ["https://api.allorigins.win/raw?url="];
  const proxy = PROXIES[0];

  try {
    const response = await fetch(`${proxy}${encodeURIComponent(url)}`);
    if (!response.ok)
      return `Error: Failed to fetch URL with status ${response.status}.`;
    const html = await response.text();
    const sanitizedHtml = (window as any).DOMPurify.sanitize(html, {
      FORBID_TAGS: ["script", "iframe", "style", "object", "embed", "form", "input", "button", "link", "meta", "base"],
      FORBID_ATTR: ["src", "href", "background", "ping", "on*"]
    });
    const doc = new DOMParser().parseFromString(sanitizedHtml, "text/html");
    const textContent =
      doc.body.textContent?.replace(/\s\s+/g, " ").trim() || "";
    return textContent.substring(0, 200000); // Cap at 200k chars
  } catch (err: any) {
    return `Error: An exception occurred while trying to fetch the URL: ${err.message}`;
  }
}

/**
 * Extracts AI model IDs from provided URLs using Gemini AI
 * This function helps discover available models when official APIs don't provide lists
 * 
 * @param urls - Array of URLs to analyze for model IDs
 * @returns Promise<string[]> - Array of unique model IDs found in the URLs
 */
export async function listModelsViaUrlContext(
  urls: string[]
): Promise<string[]> {
  const ai = new GoogleGenAI({ apiKey: getDefaultApiKey() });
  const model = ai.models.generateContent;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: `Review the content of the following URLs and extract a simple list of all unique AI model ID strings mentioned. The model IDs often look like 'model-name-v1', 'gemma-7b', 'llama-3-sonar-large-32k-chat', etc. Return only a JSON array of these strings.\n\nURLs:\n- ${urls.join(
      "\n- "
    )}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: { type: Type.ARRAY, items: { type: Type.STRING } },
    },
  });

  try {
    const result = JSON.parse(response.text.trim());
    return Array.isArray(result) ? [...new Set<string>(result)] : [];
  } catch (e) {
    console.error("Failed to parse model list from URL context:", e);
    return [];
  }
}

// --- Adapters and Converters ---

/**
 * Converts OpenAI-style tool definitions to Gemini format
 * This adapter allows using the same tool definitions across different AI providers
 * 
 * @param openAITool - OpenAI format tool definition to convert
 * @returns FunctionDeclaration - Gemini format tool definition
 */
function openAIToolToGemini(openAITool: any): FunctionDeclaration {
  const func = openAITool.function;
  const geminiParams: { type: any; properties: any; required: string[] } = {
    type: Type.OBJECT,
    properties: {},
    required: func.parameters.required || [],
  };

  for (const [key, value] of Object.entries(func.parameters.properties)) {
    const param = value as any;
    geminiParams.properties[key] = {
      type: (param.type as string).toUpperCase() as Type, // 'string' -> 'STRING'
      description: param.description,
    };
  }

  return {
    name: func.name,
    description: func.description,
    parameters: geminiParams,
  };
}

/**
 * Maps chat history to OpenAI message format
 * Converts internal ChatMessage format to OpenAI API format
 * 
 * @param history - Array of internal ChatMessage objects
 * @returns Array of OpenAI format message objects
 */
function mapHistoryToOpenAI(history: ChatMessage[]) {
  return history.map((msg) => {
    if (msg.role === "tool") {
      return {
        role: msg.role,
        content: msg.parts.map((p) => p.text).join(""),
        tool_call_id: msg.tool_call_id,
      };
    }
    return { role: msg.role, content: msg.parts.map((p) => p.text).join("") };
  });
}

/**
 * Maps chat history to Gemini message format
 * Converts internal ChatMessage format to Gemini API format
 * 
 * @param history - Array of internal ChatMessage objects
 * @returns Array of Gemini format Content objects
 */
function mapHistoryToGemini(history: ChatMessage[]): Content[] {
  return history.map((msg) => {
    const role =
      msg.role === "tool" ? "tool" : msg.role === "model" ? "model" : "user";
    return {
      role,
      parts: msg.parts.map((p) => {
        if (role === "tool") {
          return {
            functionResponse: { name: msg.name!, response: { result: p.text } },
          };
        }
        return p.text ? { text: p.text } : { inlineData: p.inlineData };
      }) as Part[],
    };
  });
}

// --- Schemas ---

const TEXT_ANALYSIS_SCHEMA_OPENAI = {
  type: "object",
  properties: {
    sentiment: {
      type: "object",
      properties: {
        overall: { type: "string", enum: ["positive", "negative", "neutral"] },
        score: { type: "number" },
      },
      required: ["overall", "score"],
    },
    trends: { type: "array", items: { type: "string" } },
    summary: { type: "string" },
    insights: { type: "string" },
    content_type: {
      type: "string",
      enum: ["news", "blog", "ecommerce", "forum", "other"],
    },
  },
  required: ["sentiment", "trends", "summary", "insights", "content_type"],
};

// --- Central API Adapter ---

/**
 * Runs a single chat turn with the specified AI provider
 * Handles both Gemini-specific and OpenAI-compatible APIs
 * 
 * @param provider - The AI provider to use for this chat turn
 * @param config - Configuration object containing API key, base URL, model, and temperature
 * @param history - Chat history to provide context for the response
 * @param tools - Array of tools available to the model (if any)
 * @param systemInstruction - System instruction to guide the model's behavior (optional)
 * @param imagePayload - Image data to include with the message (optional)
 * @returns Promise<GenerateContentResponse | any> - The API response from the chosen provider
 * @throws Error if the API call fails
 */
export const runChatTurn = async (
  provider: AIProvider,
  config: {
    apiKey: string;
    baseUrl: string;
    model: string;
    temperature: number;
  },
  history: ChatMessage[],
  tools: any[] | null,
  systemInstruction?: string,
  imagePayload?: { data: string; mimeType: string }
): Promise<GenerateContentResponse | any> => {
  switch (provider) {
    case AIProvider.GEMINI: {
      const ai = new GoogleGenAI({
        apiKey: config.apiKey || getDefaultApiKey(),
      });
      const geminiHistory = mapHistoryToGemini(history.slice(0, -1));
      const latestUserMessage = history[history.length - 1];
      const latestParts = latestUserMessage.parts.map((p) =>
        p.text ? { text: p.text } : { inlineData: p.inlineData }
      ) as Part[];

      if (imagePayload) {
        latestParts.push({
          inlineData: {
            data: imagePayload.data,
            mimeType: imagePayload.mimeType,
          },
        });
      }

      const chat = ai.chats.create({
        model: config.model,
        history: geminiHistory,
        config: {
          systemInstruction,
          tools: tools
            ? [{ functionDeclarations: tools.map(openAIToolToGemini) }]
            : undefined,
          safetySettings: GEMINI_SAFETY_SETTINGS,
          temperature: config.temperature,
        },
      });

      return await chat.sendMessage({ message: latestParts });
    }

    case AIProvider.VENICE_AI:
    case AIProvider.OPENAI_COMPATIBLE:
    case AIProvider.PERPLEXITY:
    case AIProvider.XAI: {
      const baseUrl = config.baseUrl;
      const apiKey = config.apiKey;

      const messages: {
        role: "system" | "user" | "model" | "tool";
        content: any;
        tool_call_id?: string;
      }[] = mapHistoryToOpenAI(history) as any;
      if (systemInstruction && !messages.some((m) => m.role === "system")) {
        messages.unshift({ role: "system", content: systemInstruction });
      }

      if (imagePayload) {
        const lastUserMsg = [...messages]
          .reverse()
          .find((m) => m.role === "user");
        if (lastUserMsg) {
          lastUserMsg.content = [
            { type: "text", text: lastUserMsg.content as string },
            {
              type: "image_url",
              image_url: {
                url: `data:${imagePayload.mimeType};base64,${imagePayload.data}`,
              },
            },
          ];
        }
      }

      const body = {
        model: config.model,
        messages,
        temperature: config.temperature,
        tools: tools || undefined,
        tool_choice: tools ? "auto" : undefined,
      };

      const response = await fetch(
        new URL("/v1/chat/completions", baseUrl).href,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...getAuthHeader(apiKey),
          },
          body: JSON.stringify(body),
        }
      );

      if (!response.ok) {
        const errorBody = await response
          .json()
          .catch(() => ({ error: { message: response.statusText } }));
        throw new Error(
          `API error (${response.status}): ${
            errorBody.error?.message || "Unknown error"
          }`
        );
      }
      const result = await response.json();
      return result.choices[0].message;
    }
  }
};

// --- Task-Specific Functions ---

export async function analyzeContent(
  provider: AIProvider,
  config: {
    apiKey: string;
    baseUrl: string;
    model: string;
    temperature: number;
  },
  contentType: "text" | "image",
  content: {
    url?: string;
    data?: ScrapedData | { data: string; mimeType: string };
  },
  customPrompt: string
): Promise<TextAnalysisResult | ImageAnalysisResult> {
  const isText =
    contentType === "text" && content.data && "text" in content.data;
  const isImage =
    contentType === "image" && content.data && "mimeType" in content.data;

  let systemInstruction =
    "Analyze the provided content according to the user's instructions and provide a structured analysis in JSON format that strictly adheres to the required schema.";
  let userMessage = customPrompt;
  let imagePayload;

  if (isText) {
    userMessage = `URL: "${
      content.url
    }"\nInstructions: ${customPrompt}\n\nContent:\n${(
      content.data as ScrapedData
    ).text.substring(0, 6000)}`;
  } else if (isImage) {
    imagePayload = content.data as { data: string; mimeType: string };
  } else {
    throw new Error("Invalid content for analysis");
  }

  if (provider === AIProvider.GEMINI) {
    const ai = new GoogleGenAI({ apiKey: config.apiKey || getDefaultApiKey() });
    const parts: Part[] = [{ text: userMessage }];
    if (isImage && imagePayload) parts.unshift({ inlineData: imagePayload });

    const response = await ai.models.generateContent({
      model: config.model,
      contents: [{ parts }],
      config: {
        responseMimeType: "application/json",
        responseSchema: TEXT_ANALYSIS_SCHEMA_OPENAI,
        safetySettings: GEMINI_SAFETY_SETTINGS,
        temperature: config.temperature,
      },
    });
    return JSON.parse(response.text.trim());
  } else {
    // Venice.ai and other OpenAI-Compatible
    const baseUrl = config.baseUrl;
    const apiKey = config.apiKey;

    const body: {
      model: string;
      messages: { role: "user"; content: string | object[] }[];
      temperature: number;
      response_format: object;
    } = {
      model: config.model,
      messages: [{ role: "user", content: userMessage }],
      temperature: config.temperature,
      response_format: {
        type: "json_schema",
        json_schema: TEXT_ANALYSIS_SCHEMA_OPENAI,
      },
    };
    if (isImage && imagePayload) {
      body.messages[0].content = [
        { type: "text", text: customPrompt },
        {
          type: "image_url",
          image_url: {
            url: `data:${imagePayload.mimeType};base64,${imagePayload.data}`,
          },
        },
      ];
    }

    const response = await fetch(
      new URL("/v1/chat/completions", baseUrl).href,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(body),
      }
    );
    if (!response.ok) {
      const errorBody = await response
        .json()
        .catch(() => ({ error: { message: response.statusText } }));
      throw new Error(
        `API error (${response.status}): ${
          errorBody.error?.message || "Unknown error"
        }`
      );
    }
    const result = await response.json();
    return JSON.parse(result.choices[0].message.content.trim());
  }
}

export async function generateImage(
  provider: AIProvider,
  config: {
    apiKey: string;
    baseUrl: string;
    model: string;
    character?: VeniceAICharacter;
  },
  prompt: string,
  aspectRatio: string,
  numberOfImages: number
): Promise<ImageGenerationResult> {
  const images: { base64: string }[] = [];

  for (let i = 0; i < numberOfImages; i++) {
    switch (provider) {
      case AIProvider.GEMINI: {
        const ai = new GoogleGenAI({
          apiKey: config.apiKey || getDefaultApiKey(),
        });
        const response = await ai.models.generateImages({
          model: "imagen-4.0-generate-001",
          prompt: prompt,
          config: {
            numberOfImages: 1,
            outputMimeType: "image/png",
            aspectRatio: aspectRatio as any,
          },
        });
        images.push({ base64: response.generatedImages[0].image.imageBytes });
        break;
      }
      case AIProvider.VENICE_AI: {
        const sizeMap: { [key: string]: { width: number; height: number } } = {
          "1:1": { width: 1024, height: 1024 },
          "16:9": { width: 1280, height: 720 },
          "9:16": { width: 720, height: 1280 },
        };
        const body = {
          model: config.model,
          prompt: prompt,
          ...(sizeMap[aspectRatio] || sizeMap["1:1"]),
          character:
            config.character === VeniceAICharacter.NONE
              ? undefined
              : config.character,
          format: "png",
        };
        const response = await fetch(
          "https://api.venice.ai/api/v1/image/generate",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              ...getAuthHeader(config.apiKey),
            },
            body: JSON.stringify(body),
          }
        );
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(
            `Venice.ai API error (${response.status}): ${errorText}. Possible causes: invalid API key, unsupported model, or malformed prompt. Please verify your API key, model selection, and prompt format.`
          );
        }
        const result = await response.json();
        if (
          result.images &&
          Array.isArray(result.images) &&
          result.images.length > 0
        ) {
          images.push({ base64: result.images[0] });
        } else {
          throw new Error(
            "Venice.ai API error: No images returned in response."
          );
        }
        break;
      }
      case AIProvider.OPENAI_COMPATIBLE:
      case AIProvider.PERPLEXITY:
      case AIProvider.XAI: {
        const sizeMap: { [key: string]: string } = {
          "1:1": "1024x1024",
          "16:9": "1792x1024",
          "9:16": "1024x1792",
        };
        const body = {
          model: config.model,
          prompt: prompt,
          n: 1,
          size: sizeMap[aspectRatio] || "1024x1024",
          response_format: "b64_json",
        };
        const response = await fetch(
          new URL("/v1/images/generations", config.baseUrl).href,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${config.apiKey}`,
            },
            body: JSON.stringify(body),
          }
        );
        if (!response.ok) {
          const errorBody = await response
            .json()
            .catch(() => ({ error: { message: response.statusText } }));
          throw new Error(
            `Image Generation API error (${response.status}): ${
              errorBody.error?.message || "Unknown error"
            }`
          );
        }
        const result = await response.json();
        images.push({ base64: result.data[0].b64_json });
        break;
      }
    }
  }
  return { images };
}

// Add a safe helper to obtain an API key without referencing `process` directly
/**
 * Gets the default API key from environment variables
 * Used as a fallback when no specific key is provided
 * @returns string - The API key from environment or empty string if not found
 */
function getDefaultApiKey(): string {
  // Try Vite environment variable first, then fall back to other methods
  return (
    import.meta.env.VITE_GEMINI_API_KEY || 
    (globalThis as any).process?.env?.API_KEY || 
    (window as any).__API_KEY || 
    ""
  );
}

/**
 * Creates an Authorization header object for API requests
 * @param apiKey - The API key to use for authorization
 * @returns Object containing the Authorization header
 */
function getAuthHeader(apiKey: string): { Authorization: string } {
  return { Authorization: `Bearer ${apiKey}` };
}
