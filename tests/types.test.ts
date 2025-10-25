import { describe, it, expect } from 'vitest';
import { 
  AIProvider, 
  AnalysisMode, 
  VeniceAICharacter, 
  VeniceAIStyle,
  TextAnalysisResult,
  ImageAnalysisResult,
  ImageGenerationResult,
  TTSResult,
  TranscriptionResult,
  SearchGroundingResult,
  StoredKey,
  CachedModels,
  AppSettings,
  LogEntry
} from '../types';

describe('Type Definitions', () => {
  it('should have correct AIProvider enum values', () => {
    expect(AIProvider.VENICE_AI).toBe('Venice.ai');
    expect(AIProvider.GEMINI).toBe('Google Gemini');
    expect(AIProvider.OPENAI_COMPATIBLE).toBe('OpenAI-Compatible');
    expect(AIProvider.PERPLEXITY).toBe('Perplexity');
    expect(AIProvider.XAI).toBe('xAI');
  });

  it('should have correct AnalysisMode enum values', () => {
    expect(AnalysisMode.WEB).toBe('web');
    expect(AnalysisMode.IMAGE_ANALYSIS).toBe('image_analysis');
    expect(AnalysisMode.VIDEO_ANALYSIS).toBe('video_analysis');
    expect(AnalysisMode.SEARCH_GROUNDING).toBe('search_grounding');
    expect(AnalysisMode.COMPLEX_QUERY).toBe('complex_query');
    expect(AnalysisMode.IMAGE_GENERATION).toBe('image_generation');
    expect(AnalysisMode.TTS).toBe('tts');
    expect(AnalysisMode.AUDIO_TRANSCRIPTION).toBe('audio_transcription');
  });

  it('should have correct VeniceAICharacter enum values', () => {
    expect(VeniceAICharacter.NONE).toBe('none');
    expect(VeniceAICharacter.ANNA).toBe('anna');
    expect(VeniceAICharacter.LUNA).toBe('luna');
    expect(VeniceAICharacter.CHLOE).toBe('chloe');
    expect(VeniceAICharacter.ARIA).toBe('aria');
  });

  it('should have correct VeniceAIStyle enum values', () => {
    expect(VeniceAIStyle.NONE).toBe('none');
    expect(VeniceAIStyle.CINEMATIC).toBe('cinematic');
    expect(VeniceAIStyle.ANIME).toBe('anime');
    expect(VeniceAIStyle.PHOTOGRAPHY).toBe('photography');
    expect(VeniceAIStyle.COMIC_BOOK).toBe('comic_book');
    expect(VeniceAIStyle.FANTASY_ART).toBe('fantasy_art');
  });

  it('should properly define TextAnalysisResult interface', () => {
    const mockResult: TextAnalysisResult = {
      sentiment: {
        overall: 'positive',
        score: 0.8
      },
      trends: ['trend1', 'trend2'],
      summary: 'Summary text',
      insights: 'Insight text',
      content_type: 'news'
    };

    expect(mockResult).toHaveProperty('sentiment');
    expect(mockResult).toHaveProperty('trends');
    expect(mockResult).toHaveProperty('summary');
    expect(mockResult).toHaveProperty('insights');
    expect(mockResult).toHaveProperty('content_type');
  });

  it('should properly define ImageAnalysisResult interface', () => {
    const mockResult: ImageAnalysisResult = {
      description: 'Image description',
      objects: ['object1', 'object2'],
      sentiment: 'positive'
    };

    expect(mockResult).toHaveProperty('description');
    expect(mockResult).toHaveProperty('objects');
    expect(mockResult).toHaveProperty('sentiment');
  });

  it('should properly define ImageGenerationResult interface', () => {
    const mockResult: ImageGenerationResult = {
      images: [{ base64: 'base64string' }]
    };

    expect(mockResult).toHaveProperty('images');
    expect(Array.isArray(mockResult.images)).toBe(true);
    expect(mockResult.images[0]).toHaveProperty('base64');
  });

  it('should properly define TTSResult interface', () => {
    const mockResult: TTSResult = {
      audioBase64: 'audioBase64String'
    };

    expect(mockResult).toHaveProperty('audioBase64');
  });

  it('should properly define TranscriptionResult interface', () => {
    const mockResult: TranscriptionResult = {
      text: 'Transcribed text'
    };

    expect(mockResult).toHaveProperty('text');
  });

  it('should properly define SearchGroundingResult interface', () => {
    const mockResult: SearchGroundingResult = {
      text: 'Response text',
      citations: []
    };

    expect(mockResult).toHaveProperty('text');
    expect(mockResult).toHaveProperty('citations');
  });

  it('should properly define StoredKey interface', () => {
    const mockKey: StoredKey = {
      id: 1,
      provider: AIProvider.GEMINI,
      label: 'Test Key',
      encKey: new ArrayBuffer(16),
      iv: new Uint8Array(12),
      createdAt: Date.now()
    };

    expect(mockKey).toHaveProperty('id');
    expect(mockKey).toHaveProperty('provider');
    expect(mockKey).toHaveProperty('label');
    expect(mockKey).toHaveProperty('encKey');
    expect(mockKey).toHaveProperty('iv');
    expect(mockKey).toHaveProperty('createdAt');
  });

  it('should properly define CachedModels interface', () => {
    const mockModels: CachedModels = {
      provider: AIProvider.VENICE_AI,
      list: ['model1', 'model2'],
      fetchedAt: Date.now()
    };

    expect(mockModels).toHaveProperty('provider');
    expect(mockModels).toHaveProperty('list');
    expect(mockModels).toHaveProperty('fetchedAt');
  });

  it('should properly define AppSettings interface', () => {
    const mockSettings: AppSettings = {
      rateLimits: { 'Venice.ai': { rpm: 100, burst: 10 } },
      allowlist: ['example.com']
    };

    expect(mockSettings).toHaveProperty('rateLimits');
    expect(mockSettings).toHaveProperty('allowlist');
  });

  it('should properly define LogEntry interface', () => {
    const mockLog: LogEntry = {
      id: 'log-id-123',
      at: Date.now(),
      provider: AIProvider.GEMINI,
      op: 'chat',
      status: 200,
      tokens: 150
    };

    expect(mockLog).toHaveProperty('id');
    expect(mockLog).toHaveProperty('at');
    expect(mockLog).toHaveProperty('provider');
    expect(mockLog).toHaveProperty('op');
    expect(mockLog).toHaveProperty('status');
    expect(mockLog).toHaveProperty('tokens');
  });
});