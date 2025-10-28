import { describe, it, expect, vi, beforeEach } from 'vitest';
import { analyzeContent, generateImage, runChatTurn } from '../services/aiService';
import { AIProvider } from '../types';

// Mock the GoogleGenAI module
vi.mock('@google/genai', async () => {
  const actual = await vi.importActual('@google/genai');
  return {
    ...actual,
    GoogleGenAI: vi.fn().mockImplementation(() => ({
      models: {
        generateContent: vi.fn().mockResolvedValue({
          text: () => '{"sentiment": {"overall": "positive", "score": 0.8}, "trends": ["trend1"], "summary": "summary", "insights": "insights", "content_type": "news"}'
        }),
        generateImages: vi.fn().mockResolvedValue({
          generatedImages: [{ image: { imageBytes: 'base64image' } }]
        })
      },
      chats: {
        create: vi.fn().mockReturnValue({
          sendMessage: vi.fn().mockResolvedValue({
            text: 'test response'
          })
        })
      }
    }))
  };
});

describe('AI Service', () => {
  const mockConfig = {
    apiKey: 'test-key',
    baseUrl: 'https://api.test.com',
    model: 'test-model',
    temperature: 0.7
  };

  beforeEach(() => {
    // Reset all mocks before each test
    vi.clearAllMocks();
  });

  describe('analyzeContent', () => {
    it('should analyze text content successfully', async () => {
      const content = {
        url: 'https://example.com',
        data: {
          titles: ['Title'],
          links: ['https://example.com'],
          text: 'This is test content for analysis'
        }
      };

      const result = await analyzeContent(
        AIProvider.GEMINI,
        mockConfig,
        'text',
        content,
        'Analyze this content'
      );

      expect(result).toBeDefined();
      expect(result).toHaveProperty('sentiment');
      expect(result).toHaveProperty('trends');
      expect(result).toHaveProperty('summary');
      expect(result).toHaveProperty('insights');
      expect(result).toHaveProperty('content_type');
    });

    it('should analyze image content successfully', async () => {
      const content = {
        data: {
          data: 'base64imagestring',
          mimeType: 'image/jpeg'
        }
      };

      const result = await analyzeContent(
        AIProvider.GEMINI,
        mockConfig,
        'image',
        content,
        'Describe this image'
      );

      expect(result).toBeDefined();
      expect(result).toHaveProperty('sentiment');
      expect(result).toHaveProperty('trends');
      expect(result).toHaveProperty('summary');
    });

    it('should throw error for invalid content type', async () => {
      const content = {
        url: 'https://example.com'
      };

      await expect(analyzeContent(
        AIProvider.GEMINI,
        mockConfig,
        'text' as any,
        content,
        'Analyze this content'
      )).rejects.toThrow('Invalid content for analysis');
    });
  });

  describe('generateImage', () => {
    it('should generate image with Venice.ai provider', async () => {
      const result = await generateImage(
        AIProvider.VENICE_AI,
        { ...mockConfig, character: undefined },
        'A beautiful landscape',
        '1:1',
        1
      );

      expect(result).toBeDefined();
      expect(result).toHaveProperty('images');
      expect(Array.isArray(result.images)).toBe(true);
      expect(result.images[0]).toHaveProperty('base64');
    });

    it('should generate image with Gemini provider', async () => {
      const result = await generateImage(
        AIProvider.GEMINI,
        mockConfig,
        'A beautiful landscape',
        '16:9',
        1
      );

      expect(result).toBeDefined();
      expect(result).toHaveProperty('images');
      expect(Array.isArray(result.images)).toBe(true);
      expect(result.images[0]).toHaveProperty('base64');
    });
  });

  describe('runChatTurn', () => {
    it('should run chat turn with Gemini provider', async () => {
      const result = await runChatTurn(
        AIProvider.GEMINI,
        mockConfig,
        [],
        null,
        'Test system instruction'
      );

      expect(result).toBeDefined();
    });

    it('should run chat turn with OpenAI-compatible provider', async () => {
      // Mock fetch for OpenAI-compatible API calls
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue({
          choices: [{ message: { content: 'Test response' } }]
        })
      });

      const result = await runChatTurn(
        AIProvider.OPENAI_COMPATIBLE,
        mockConfig,
        [{ role: 'user', parts: [{ text: 'Hello' }] }],
        null,
        'Test system instruction'
      );

      expect(result).toBeDefined();
      expect(result).toHaveProperty('content');
    });
  });
});