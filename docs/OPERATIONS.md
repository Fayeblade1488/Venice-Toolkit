# Operations

## Deployment

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn package manager
- API keys for desired AI providers

### Local Development
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Environment Configuration
Create a `.env.local` file in the project root with your API keys:
```
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```

Note: Venice-ToolKit uses client-side key storage with encryption, so API keys are only required for initial setup and provider verification.

## Monitoring

### Client-Side Logging
The application implements a local logging system that tracks:
- API call success/failure rates
- Response times for different providers
- Error patterns and frequency

### Performance Metrics
Key performance indicators to monitor:
- Page load times
- API response times
- Memory usage during analysis tasks
- IndexedDB operation latency

## Configuration

### API Provider Settings
The application supports multiple AI providers with different configuration options:

#### Venice.ai
- Model selection from cached model lists
- Character selection (Anna, Luna, Chloe, Aria, or none)
- Image generation with various aspect ratios

#### Google Gemini
- Video analysis (Gemini 2.5 Pro)
- Search grounding with web citations
- Audio transcription and TTS
- Complex query analysis

#### Other Providers
- Perplexity, xAI, and OpenAI-compatible APIs
- Custom API base URLs supported for self-hosted services

### Security Settings
- Domain allowlist for web fetching operations
- Rate limiting configuration (planned feature)
- Client-side encryption with user-defined passphrases

## Troubleshooting

### Common Issues

#### API Connection Failures
1. Verify API key is valid and properly encrypted
2. Check network connectivity
3. Ensure provider is correctly selected
4. Confirm API endpoint is accessible

#### Web Fetching Errors
1. Verify target domain is on the allowlist
2. Check proxy service availability (`api.allorigins.win`)
3. Ensure URL is properly formatted

#### Client-Side Encryption Issues
1. Confirm passphrase is correct when accessing stored keys
2. Verify encryption/decryption operations are successful
3. Check browser support for Web Crypto API

### Debugging Tools
- Browser developer tools for network and console inspection
- IndexedDB browser storage viewer
- Network proxy for API traffic inspection

## Backup and Recovery

### Local Data
All application data is stored locally in the browser's IndexedDB:
- Encrypted API keys
- Cached model lists
- Application settings
- Operation logs

This data is not synchronized across devices and is cleared when browser data is cleared.

### Data Export
Analysis results can be exported as JSON files directly from the UI for backup and sharing purposes.