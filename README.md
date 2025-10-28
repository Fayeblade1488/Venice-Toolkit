# Venice-ToolKit

> AI-Powered Content Analysis & Generation Toolkit - Web Scraping, AI Analysis, and Multi-Modal Content Creation

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](legal/LICENSE)
[![React](https://img.shields.io/badge/React-19.2.0-61DAFB?logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.2-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.2.0-646CFF?logo=vite)](https://vitejs.dev/)

## Features

- **Web Content Analysis** — Scrape and analyze web pages with AI-powered insights
- **Multi-Modal AI Support** — Image analysis, video analysis, and generation across multiple providers
- **Cross-Provider Integration** — Supports Venice.ai, Google Gemini, Perplexity, xAI, and OpenAI-compatible APIs
- **Secure Key Management** — Client-side encryption for API keys using PBKDF2 and AES-GCM
- **Advanced Content Tools** — Text-to-speech, audio transcription, grounded search, and image generation
- **Real-Time Chat Interface** — Interactive refining of analysis results through conversational AI

## Quickstart

```bash
# Development setup
npm install
npm run dev

# Production build
npm run build
npm run preview
```

## Architecture

The application follows a modular architecture with clear separation of concerns:

- **UI Components** — React components in `/components` for different analysis modes
- **Service Layer** — API integrations in `/services` with AI providers and utilities
- **Type Definitions** — Centralized TypeScript interfaces in `/types.ts`
- **Database Abstraction** — IndexedDB wrapper for client-side storage in `/services/db.ts`

## Configuration

- **Environment variables:** `VITE_GEMINI_API_KEY` in `.env.local` for Gemini API access
- **API Key Management:** Securely stored in IndexedDB with PBKDF2 encryption
- **Model Selection:** Dynamic model lists with caching for supported providers
- **Content Filtering:** Domain allowlist for safe web fetching operations

## Documentation

- [Architecture](docs/ARCHITECTURE.md) — System design and component relationships
- [Operations](docs/OPERATIONS.md) — Deployment and monitoring
- [API Reference](docs/API.md) — Provider integration and endpoints
- [Contributing](CONTRIBUTING.md) — Development workflow
- [Security](SECURITY.md) — Vulnerability reporting and security practices

## API Providers

The application supports multiple AI providers with a unified interface:
- **Venice.ai** — Uncensored image generation and chat capabilities
- **Google Gemini** — Video analysis, search grounding, transcription, TTS
- **Perplexity** — OpenAI-compatible search and analysis
- **xAI** — OpenAI-compatible chat operations
- **OpenAI-Compatible** — Generic API support for other providers

## Security Features

- Client-side encryption of API keys using industry-standard algorithms
- Domain allowlist for web fetching operations
- Secure IndexedDB storage with PBKDF2-derived AES-GCM keys
- Runtime sanitization of fetched content with DOMPurify

## License

See [legal/LICENSE](legal/LICENSE). Third-party notices in [legal/NOTICE.md](legal/NOTICE.md).

## Support

See [SUPPORT.md](SUPPORT.md) for help channels and SLAs.
