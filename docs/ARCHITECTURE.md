# Architecture

## Overview

The Venice-ToolKit is a React-based application that provides AI-powered content analysis and generation capabilities. It supports multiple AI providers and offers various analysis modes through a unified interface.

## System Design

### Components Structure
```
components/
├── AnalysisResultDisplay.tsx        # Displays text analysis results
├── AudioRecorder.tsx               # Handles audio recording functionality
├── ChatInterface.tsx               # Interactive chat interface for refining analysis
├── ImageAnalysisResultDisplay.tsx  # Displays image analysis results
├── ScrapedDataDisplay.tsx          # Shows scraped web data
├── SearchGroundingResultDisplay.tsx # Displays search grounding results
└── Spinner.tsx                     # Loading indicator component
```

### Services Structure
```
services/
├── aiService.ts           # Main AI provider integration and adapters
├── crypto.ts              # Client-side encryption utilities
├── db.ts                  # IndexedDB wrapper for local data storage
├── geminiFeatures.ts      # Google Gemini-specific API functions
└── providers.ts           # Provider registry and configuration
```

## Core Concepts

### AI Provider Abstraction
The application uses a unified interface to interact with multiple AI providers (Venice.ai, Google Gemini, Perplexity, xAI, OpenAI-Compatible). This allows users to switch between providers while maintaining consistent functionality.

### Security Model
- API keys are encrypted client-side using PBKDF2 and AES-GCM
- Keys are stored in IndexedDB instead of plain text
- Web fetching is restricted to a user-configured allowlist

### Data Flow
1. User inputs content (URL, image, video, etc.)
2. Content is processed and prepared for analysis
3. Appropriate AI provider is called with structured prompt
4. Results are parsed and validated against schema
5. Results are displayed in the UI with export capability
6. Optional chat interface allows for result refinement

## Technology Stack

### Frontend
- **React 19.2.0** - Component-based UI framework
- **TypeScript 5.8.2** - Type safety and development experience
- **Vite 6.2.0** - Build tool and development server
- **IndexedDB** - Client-side data persistence

### AI Integration
- **Google GenAI SDK** - Gemini API integration
- **OpenAI-compatible APIs** - Multi-provider support
- **JSON Schema validation** - Structured response format

## Component Relationships

The application follows a unidirectional data flow with the App component as the central state manager. Components communicate with services through props and callbacks, while services handle the actual API interactions and data persistence.