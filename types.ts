/**
 * Enum representing the supported AI providers in the application
 * Each provider has a display name used in the UI
 */
export enum AIProvider {
  VENICE_AI = 'Venice.ai',
  GEMINI = 'Google Gemini',
  OPENAI_COMPATIBLE = 'OpenAI-Compatible',
  PERPLEXITY = 'Perplexity',
  XAI = 'xAI',
}

/**
 * Enum for Venice AI character options
 * These characters provide different personality styles for AI interactions
 */
export enum VeniceAICharacter {
    NONE = 'none',
    ANNA = 'anna',
    LUNA = 'luna',
    CHLOE = 'chloe',
    ARIA = 'aria',
}

/**
 * Enum for Venice AI style options
 * These styles affect the visual output of generated content
 */
export enum VeniceAIStyle {
    NONE = 'none',
    CINEMATIC = 'cinematic',
    ANIME = 'anime',
    PHOTOGRAPHY = 'photography',
    COMIC_BOOK = 'comic_book',
    FANTASY_ART = 'fantasy_art',
}

/**
 * Enum representing different analysis modes available in the application
 * Each mode corresponds to a specific type of content analysis or generation
 */
export enum AnalysisMode {
  WEB = 'web',
  IMAGE_ANALYSIS = 'image_analysis',
  VIDEO_ANALYSIS = 'video_analysis',
  SEARCH_GROUNDING = 'search_grounding',
  COMPLEX_QUERY = 'complex_query',
  IMAGE_GENERATION = 'image_generation',
  TTS = 'tts',
  AUDIO_TRANSCRIPTION = 'audio_transcription',
}

/**
 * Interface representing the data scraped from a web page
 * Contains structured information extracted from HTML content
 */
export interface ScrapedData {
  /** Array of all heading text found on the page (h1, h2, h3) */
  titles: string[];
  /** Array of all links found on the page */
  links: string[];
  /** Plain text content of the page body */
  text: string;
}

/**
 * Interface representing the result of text analysis
 * Contains structured insights about the content's sentiment, trends, and other properties
 */
export interface TextAnalysisResult {
  /** Sentiment analysis results */
  sentiment: {
    /** Overall sentiment classification */
    overall: 'positive' | 'negative' | 'neutral';
    /** Sentiment score from 0 to 1 */
    score: number;
  };
  /** Key trends identified in the content */
  trends: string[];
  /** Summary of the content */
  summary: string;
  /** Actionable insights derived from the content */
  insights: string;
  /** Classification of content type */
  content_type: 'news' | 'blog' | 'ecommerce' | 'forum' | 'other';
}

/**
 * Interface representing the result of image analysis
 * Contains description and objects identified in the image
 */
export interface ImageAnalysisResult {
    /** Natural language description of the image content */
    description: string;
    /** List of objects detected in the image */
    objects: string[];
    /** Overall sentiment of the image */
    sentiment: 'positive' | 'negative' | 'neutral';
}

/**
 * Interface representing the result of image generation
 * Contains base64 encoded image data
 */
export interface ImageGenerationResult {
  /** Array of generated images in base64 format */
  images: { base64: string }[];
}

/**
 * Interface representing the result of text-to-speech conversion
 * Contains base64 encoded audio data
 */
export interface TTSResult {
  /** Base64 encoded audio data */
  audioBase64: string;
}

/**
 * Interface representing the result of audio transcription
 * Contains the transcribed text from audio content
 */
export interface TranscriptionResult {
  /** Transcribed text from the audio */
  text: string;
}

/**
 * Interface representing a single grounding chunk for search results
 * Contains metadata about the source of information
 */
export interface GroundingChunk {
  /** Web source information (when available) */
  web?: {
    uri: string;
    title: string;
  };
}

/**
 * Interface representing the result of grounded search
 * Contains both the response text and citation information
 */
export interface SearchGroundingResult {
  /** Response text from the search */
  text: string;
  /** Citations for the information provided */
  citations: GroundingChunk[];
}

/** Video Analysis Result is identical to Text Analysis Result */
export type VideoAnalysisResult = TextAnalysisResult;


/**
 * Union type representing all possible analysis result types
 * Used to handle different return types from AI analysis operations
 */
export type AnalysisResult =
  | TextAnalysisResult
  | ImageAnalysisResult
  | ImageGenerationResult
  | TTSResult
  | TranscriptionResult
  | SearchGroundingResult
  | VideoAnalysisResult;

/**
 * Interface representing a single part of a chat message
 * Can contain either text or inline data (like images)
 */
export interface ChatPart {
    /** Text content of the part (optional) */
    text?: string;
    /** Inline data (e.g., images) content of the part (optional) */
    inlineData?: {
        /** Base64 encoded data */
        data: string;
        /** MIME type of the data */
        mimeType: string;
    };
}

/**
 * Interface representing a single chat message in a conversation
 * Used for conversational AI interactions
 */
export interface ChatMessage {
    /** Role of the message sender (user, model, or tool) */
    role: 'user' | 'model' | 'tool';
    /** Array of parts that make up the message content */
    parts: ChatPart[];
    /** Tool calls made by the model (when available) */
    tool_calls?: any[]; 
    /** ID of the tool call (when this message is a tool response) */
    tool_call_id?: string;
    /** Name of the tool called (for tool responses) */
    name?: string; // For tool call responses
}

// --- Local Database Types ---

/**
 * Interface representing an encrypted API key stored in the local database
 * API keys are encrypted client-side before storage
 */
export interface StoredKey {
    /** Unique identifier for the key */
    id: number;
    /** Provider this key is associated with */
    provider: AIProvider;
    /** User-defined label for the key */
    label: string;
    /** Encrypted key data (ArrayBuffer) */
    encKey: ArrayBuffer;
    /** Initialization vector for decryption */
    iv: Uint8Array;
    /** Salt used for key derivation */
    salt: Uint8Array;
    /** Unix timestamp when the key was created */
    createdAt: number;
}

/**
 * Interface representing cached model lists for a provider
 * Used to avoid frequently fetching model lists from remote APIs
 */
export interface CachedModels {
    /** Provider whose models are cached */
    provider: AIProvider;
    /** Array of available model IDs */
    list: string[];
    /** Unix timestamp when the cache was updated */
    fetchedAt: number;
}

/**
 * Interface representing application settings stored in the local database
 * Contains configuration options for various app behaviors
 */
export interface AppSettings {
    /** Primary key for settings (fixed value of 1) */
    id?: 1;
    /** Rate limiting configuration for different providers */
    rateLimits: Record<string, { rpm: number; burst: number }>;
    /** Domain allowlist for safe web fetching operations */
    allowlist: string[];
}

/**
 * Interface representing a log entry for API operations
 * Used for tracking and debugging API usage
 */
export interface LogEntry {
    /** Unique identifier for the log entry */
    id: string;
    /** Unix timestamp when the operation occurred */
    at: number;
    /** Provider involved in the operation */
    provider: AIProvider;
    /** Operation type (e.g., 'chat', 'image_generation') */
    op: string; // e.g., 'chat', 'image_generation'
    /** HTTP status code of the API response */
    status: number; // e.g., 200, 500
    /** Number of tokens consumed (when available) */
    tokens?: number;
}
