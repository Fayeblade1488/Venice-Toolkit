# API Reference

## Overview

The Venice-ToolKit provides a unified interface to multiple AI providers through a consistent set of functions. The application uses both direct API integrations and OpenAI-compatible adapters to support different providers.

## AI Provider Integration

### Supported Providers

#### Google Gemini
- **Models:** `gemini-2.5-flash`, `gemini-2.5-pro`, `imagen-4.0-generate-001`
- **Features:** Text analysis, video analysis, search grounding, audio transcription, TTS
- **Safety Settings:** All content filtering disabled (BLOCK_NONE)

#### Venice.ai
- **Models:** User-configurable via model discovery
- **Features:** Image generation with character options
- **Endpoints:** `https://api.venice.ai/api/v1/image/generate`

#### OpenAI-Compatible Providers
- **Perplexity API**
- **xAI API** 
- **Custom endpoints** via user configuration
- **Features:** Chat completion, image generation

## Core Functions

### Content Analysis

#### `analyzeContent()`
Analyzes text or image content using the specified provider.

**Parameters:**
- `provider`: AIProvider enum value
- `config`: Object with apiKey, baseUrl, model, temperature
- `contentType`: "text" | "image"
- `content`: Object containing URL/scraped data or image data
- `customPrompt`: User's analysis instructions

**Returns:** `TextAnalysisResult` or `ImageAnalysisResult`

**Example:**
```typescript
const result = await analyzeContent(
  AIProvider.GEMINI,
  config,
  "text",
  { url: "https://example.com", data: scrapedData },
  "Analyze sentiment and extract key points"
);
```

### Image Operations

#### `generateImage()`
Generates images using the specified provider.

**Parameters:**
- `provider`: AIProvider enum value
- `config`: Object with apiKey, baseUrl, model, character
- `prompt`: Text description of desired image
- `aspectRatio`: "1:1", "16:9", or "9:16"
- `numberOfImages`: Number of images to generate (1-4 for Gemini, 1 for others)

**Returns:** `ImageGenerationResult`

**Example:**
```typescript
const result = await generateImage(
  AIProvider.VENICE_AI,
  { apiKey: "key", model: "flux-dev-uncensored" },
  "A cyberpunk cityscape at night",
  "16:9",
  1
);
```

### Chat Operations

#### `runChatTurn()`
Executes a single chat interaction with the specified provider.

**Parameters:**
- `provider`: AIProvider enum value
- `config`: Object with apiKey, baseUrl, model, temperature
- `history`: Array of ChatMessage objects
- `tools`: Optional array of tool definitions
- `systemInstruction`: Optional system message
- `imagePayload`: Optional image data for multimodal requests

**Returns:** Provider-specific response object

**Example:**
```typescript
const response = await runChatTurn(
  AIProvider.OPENAI_COMPATIBLE,
  config,
  chatHistory,
  [REFINE_ANALYSIS_TOOL_OPENAI],
  "You are a helpful AI assistant."
);
```

## Schema Definitions

### Text Analysis Schema
All text analysis results conform to this schema:
- `sentiment`: Object with `overall` (positive/negative/neutral) and `score` (0-1)
- `trends`: Array of string trends
- `summary`: String summary
- `insights`: String insights 
- `content_type`: Type classification (news/blog/ecommerce/forum/other)

### Image Analysis Schema
Image analysis results include:
- `description`: String description of the image
- `objects`: Array of detected objects
- `sentiment`: Positive, negative, or neutral sentiment

## Tool Definitions

### REFINE_ANALYSIS_TOOL_OPENAI
Allows users to modify existing analysis results with new instructions.

### WEB_FETCH_TOOL_OPENAI
Safely retrieves content from allowed domains for grounding.

## Error Handling

All API functions return structured errors that include:
- Provider-specific error messages
- HTTP status codes where applicable
- Context about what operation failed
- Suggestions for resolution when possible

## Configuration Options

### API Configuration
Each provider supports these configuration options:
- `apiKey`: Authentication key (required for most providers)
- `baseUrl`: API endpoint (for OpenAI-compatible providers)
- `model`: Specific model identifier 
- `temperature`: Creativity parameter (0.0-1.0)

### Security Configuration
- Domain allowlist for web operations
- Client-side encryption for stored API keys
- Safety setting overrides (all set to BLOCK_NONE for full content access)