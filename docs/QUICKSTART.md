# Quickstart Guide

## Prerequisites

- Node.js (v18 or higher)
- npm package manager
- API keys for AI services you plan to use

## Installation

1. **Clone the repository:**
```bash
git clone https://github.com/Fayeblade1488/Venice-ToolKit.git
cd Venice-ToolKit
```

2. **Install dependencies:**
```bash
npm install
```

3. **Set up your API keys:**
Create a `.env.local` file in the project root with your Gemini API key:
```
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```

## First Run

1. **Start the development server:**
```bash
npm run dev
```

2. **Open your browser and navigate to:**
```
http://localhost:5173
```

## Adding API Keys

1. Navigate to the "Settings & Keys" panel in the UI
2. Click "Add New Key" and select your provider
3. Enter a label for the key (e.g., "My Venice Key")
4. Enter your API key value
5. Create a passphrase to encrypt the key locally (this passphrase will be required to use the key)
6. Click "Verify" to confirm the key works

## Your First Analysis

1. **Web Page Analysis:**
   - Select "Web Page Analysis" from the task dropdown
   - Enter a URL in the input field
   - Optionally add a custom prompt (e.g., "Analyze the sentiment of this article")
   - Choose your preferred AI provider
   - Click "Run Task"

2. **Image Analysis:**
   - Select "Image Analysis" 
   - Upload an image file
   - Add a custom prompt if desired
   - Choose your provider
   - Click "Run Task"

3. **Image Generation:**
   - Select "Image Generation"
   - Enter a prompt describing the image you want to generate
   - Select aspect ratio and number of images
   - Choose your provider (Venice.ai recommended for image generation)
   - Click "Run Task"

## Configuration Options

### Model Selection
- After selecting a provider, available models will appear in the model dropdown
- For Venice.ai and other providers, models are cached after first fetch
- To refresh models, use the verify function in Settings

### Safety Settings
- By default, all content filtering is disabled (BLOCK_NONE settings)
- This allows processing of all types of content
- These settings are configured in the service files

## Security Features

- API keys are encrypted in your browser's IndexedDB using PBKDF2 and AES-GCM
- Web fetching is restricted to domains in your allowlist
- All content is sanitized using DOMPurify before display

## Next Steps

- Explore different analysis modes
- Add multiple API providers to compare results
- Use the chat interface to refine analysis results
- Export JSON results for further processing
- Review the Architecture and API documentation for advanced usage