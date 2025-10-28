import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { AIProvider, ScrapedData, AnalysisResult, AnalysisMode, TextAnalysisResult, ImageAnalysisResult, ChatMessage, ImageGenerationResult, TTSResult, SearchGroundingResult, TranscriptionResult, VideoAnalysisResult, VeniceAICharacter, StoredKey, AppSettings, CachedModels } from './types';
import { analyzeContent, runChatTurn, WEB_FETCH_TOOL_OPENAI, REFINE_ANALYSIS_TOOL_OPENAI, performWebFetch, generateImage, listModelsViaUrlContext } from './services/aiService';
import { getGeminiVideoAnalysis, getGeminiSearchGrounding, transcribeGeminiAudio, runGeminiComplexQuery, generateGeminiTTS } from './services/geminiFeatures';
import { db } from './services/db';
import { deriveKey, encrypt, decrypt } from './services/crypto';
import { createProviderRegistry } from './services/providers';
import Spinner from './components/Spinner';
import ScrapedDataDisplay from './components/ScrapedDataDisplay';
import TextAnalysisResultDisplay from './components/AnalysisResultDisplay';
import ImageAnalysisResultDisplay from './components/ImageAnalysisResultDisplay';
import ChatInterface from './components/ChatInterface';
import AudioRecorder from './components/AudioRecorder';
import SearchGroundingResultDisplay from './components/SearchGroundingResultDisplay';

declare global {
  interface Window {
    DOMPurify: any;
  }
}

const PROXIES = ["https://api.allorigins.win/raw?url="];
const USER_AGENTS = ["Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36"];
const DEBOUNCE_DELAY = 500;

const toBase64 = (file: File): Promise<string> => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve((reader.result as string).split(',')[1]);
    reader.onerror = error => reject(error);
});

// Material You Design System Classes
const inputClasses = "w-full px-4 py-3 bg-[rgba(255,255,255,0.05)] text-[#fffbfe] placeholder-[#cac7d0] rounded-[var(--md-shape-radius-md)] border border-[rgba(255,255,255,0.1)] focus:border-[#8b5cf6] focus:ring-2 focus:ring-[#8b5cf6]/30 smooth-transition-fast";
const labelClasses = "block text-sm font-500 text-[#cac7d0] mb-3 smooth-transition-fast";
const cardClasses = "glass rounded-[var(--md-shape-radius-xl)] p-6 smooth-transition elevation-1 hover:elevation-2";
const buttonPrimaryClasses = "w-full bg-gradient-to-br from-[#8b5cf6] to-[#6d28d9] hover:from-[#a78bfa] hover:to-[#7c3aed] text-white font-600 py-3 px-4 rounded-[var(--md-shape-radius-lg)] smooth-transition elevation-1 hover:elevation-3 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center";
const buttonSecondaryClasses = "w-full bg-[rgba(255,255,255,0.1)] hover:bg-[rgba(255,255,255,0.15)] text-[#fffbfe] font-600 py-3 px-4 rounded-[var(--md-shape-radius-lg)] smooth-transition border border-[rgba(255,255,255,0.1)]";
const chipClasses = "inline-flex items-center gap-2 px-4 py-2 bg-[rgba(139,92,246,0.15)] text-[#fffbfe] rounded-[var(--md-shape-radius-lg)] text-sm font-500 border border-[rgba(139,92,246,0.3)]";

// Type guards
const isTextResult = (r: any): r is TextAnalysisResult => r && 'summary' in r;
const isImageAnalysisResult = (r: any): r is ImageAnalysisResult => r && 'description' in r && 'objects' in r;
const isImageGenerationResult = (r: any): r is ImageGenerationResult => r && Array.isArray(r.images);
const isTTSResult = (r: any): r is TTSResult => r && 'audioBase64' in r;
const isSearchGroundingResult = (r: any): r is SearchGroundingResult => r && 'citations' in r;
const isTranscriptionResult = (r: any): r is TranscriptionResult => r && typeof r.text === 'string' && !('citations' in r) && !('summary' in r);

const providerRegistry = createProviderRegistry(listModelsViaUrlContext);
const PROVIDER_CONFIG: Record<AIProvider, { baseUrl: string; requiresKey: boolean; isGeneric: boolean }> = {
    [AIProvider.GEMINI]: { baseUrl: '', requiresKey: false, isGeneric: false },
    [AIProvider.VENICE_AI]: { baseUrl: 'https://api.venice.ai', requiresKey: true, isGeneric: false },
    [AIProvider.PERPLEXITY]: { baseUrl: 'https://api.perplexity.ai', requiresKey: true, isGeneric: false },
    [AIProvider.XAI]: { baseUrl: 'https://api.x.ai', requiresKey: true, isGeneric: false },
    [AIProvider.OPENAI_COMPATIBLE]: { baseUrl: '', requiresKey: true, isGeneric: true },
};


const App: React.FC = () => {
  const [analysisMode, setAnalysisMode] = useState<AnalysisMode>(AnalysisMode.WEB);
  const [url, setUrl] = useState<string>('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [recordedAudio, setRecordedAudio] = useState<Blob | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [customPrompt, setCustomPrompt] = useState<string>('');
  const [temperature, setTemperature] = useState<number>(0.5);
  const [aspectRatio, setAspectRatio] = useState<string>('1:1');
  const [numberOfImages, setNumberOfImages] = useState<number>(1);
  const [veniceCharacter, setVeniceCharacter] = useState<VeniceAICharacter>(VeniceAICharacter.NONE);
  
  // API Settings
  const [aiProvider, setAiProvider] = useState<AIProvider>(AIProvider.GEMINI);
  const [storedKeys, setStoredKeys] = useState<StoredKey[]>([]);
  const [activeKeyId, setActiveKeyId] = useState<number | null>(null);
  const [appSettings, setAppSettings] = useState<AppSettings | null>(null);
  const [genericApiBaseUrl, setGenericApiBaseUrl] = useState<string>('https://api.openai.com');
  const [modelName, setModelName] = useState<string>('gemini-2.5-flash');
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [scrapedData, setScrapedData] = useState<ScrapedData | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [chatIsLoading, setChatIsLoading] = useState<boolean>(false);

  // Clean up object URLs to prevent memory leaks
  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  // Load initial data from DB
  useEffect(() => {
    Promise.all([db.getAllKeys(), db.getSettings()]).then(([keys, settings]) => {
      setStoredKeys(keys);
      if (settings) {
        setAppSettings(settings);
      } else {
        const defaultSettings: AppSettings = { rateLimits: {}, allowlist: ['docs.perplexity.ai'] };
        setAppSettings(defaultSettings);
        db.saveSettings(defaultSettings);
      }
    });
  }, []);
  
  // Debounced settings save
  useEffect(() => {
    if (!appSettings) return;
    const handler = setTimeout(() => {
        db.saveSettings(appSettings);
    }, DEBOUNCE_DELAY);
    return () => clearTimeout(handler);
  }, [appSettings]);


  const fetchAndCacheModels = useCallback(async (key: StoredKey, passphrase?: string) => {
    setLoadingMessage(`Fetching models for ${key.provider}...`);
    setError(null);
    try {
        const cached = await db.getCachedModels(key.provider);
        if (cached && (Date.now() - cached.fetchedAt < 24 * 60 * 60 * 1000)) { // 24hr cache
            setAvailableModels(cached.list);
            setModelName(cached.list[0] || '');
            return;
        }

        if (!passphrase) {
            passphrase = window.prompt(`Enter passphrase for key "${key.label}" to fetch models:`) ?? '';
            if (!passphrase) throw new Error("Passphrase required.");
        }
        
        const apiKey = await decrypt(key.encKey, key.iv, key.salt || new Uint8Array(16), passphrase);
        
        const adapter = providerRegistry[key.provider as keyof typeof providerRegistry];
        const models = await adapter.listModels(apiKey);
        
        await db.cacheModels({ provider: key.provider, list: models, fetchedAt: Date.now() });
        setAvailableModels(models);
        setModelName(models[0] || '');
    } catch (e: any) {
        setError(`Failed to fetch models: ${e.message}`);
        setAvailableModels([]);
    } finally {
        setLoadingMessage('');
    }
  }, []);

  useEffect(() => {
    if (aiProvider === AIProvider.GEMINI) {
        setAvailableModels(['gemini-2.5-flash', 'gemini-2.5-pro']);
        setModelName('gemini-2.5-flash');
        setActiveKeyId(null);
    } else if (aiProvider === AIProvider.OPENAI_COMPATIBLE) {
        setAvailableModels([]); // User enters model manually
        const key = storedKeys.find(k => k.provider === aiProvider);
        setActiveKeyId(key?.id ?? null);
    } else {
        const key = storedKeys.find(k => k.provider === aiProvider);
        setActiveKeyId(key?.id ?? null);
        if (key) {
            fetchAndCacheModels(key);
        } else {
            setAvailableModels([]);
        }
    }
    resetState();
  }, [aiProvider, storedKeys, fetchAndCacheModels]);
  
  useEffect(() => { resetState(); }, [analysisMode]);

  const resetState = () => {
    setError(null);
    setScrapedData(null);
    setAnalysisResult(null);
    setChatHistory([]);
  };

  const getDecryptedActiveKey = async (): Promise<string> => {
    if (!activeKeyId) throw new Error("No active API key selected.");
    const key = storedKeys.find(k => k.id === activeKeyId);
    if (!key) throw new Error("Stored key not found.");

    const passphrase = window.prompt(`Enter passphrase for key "${key.label}":`) ?? '';
    if (!passphrase) throw new Error("Passphrase required to use key.");

    return decrypt(key.encKey, key.iv, key.salt, passphrase);
  }
  
  const currentConfig = useMemo(() => {
      const config = {
          apiKey: '', // Will be populated on-demand
          baseUrl: '',
          model: modelName,
          temperature,
          character: veniceCharacter,
      };
      
      const providerInfo = PROVIDER_CONFIG[aiProvider];
      if (providerInfo) {
          config.baseUrl = providerInfo.isGeneric ? genericApiBaseUrl : providerInfo.baseUrl;
      }
      
      return config;
  }, [aiProvider, modelName, temperature, veniceCharacter, genericApiBaseUrl]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    resetState();

    const providerInfo = PROVIDER_CONFIG[aiProvider];
    let apiKey = '';
    if (providerInfo.requiresKey) {
        try {
            apiKey = await getDecryptedActiveKey();
        } catch (err: any) {
            setError(err.message);
            return;
        }
    }
    
    setLoading(true);
    const finalConfig = { ...currentConfig, apiKey };

    try {
        switch(analysisMode) {
            case AnalysisMode.WEB: await handleWebAnalysis(finalConfig); break;
            case AnalysisMode.IMAGE_ANALYSIS: await handleImageAnalysis(finalConfig); break;
            case AnalysisMode.VIDEO_ANALYSIS: await handleVideoAnalysis(); break; // Uses gemini env key
            case AnalysisMode.SEARCH_GROUNDING: await handleSearchGrounding(finalConfig); break;
            case AnalysisMode.COMPLEX_QUERY: await handleComplexQuery(); break; // Uses gemini env key
            case AnalysisMode.IMAGE_GENERATION: await handleImageGeneration(finalConfig); break;
            case AnalysisMode.TTS: await handleTTS(); break; // Uses gemini env key
            case AnalysisMode.AUDIO_TRANSCRIPTION: await handleAudioTranscription(); break; // Uses gemini env key
        }
    } catch (err: any) {
        setError(`An error occurred: ${err.message}`);
    } finally {
        setLoading(false);
        setLoadingMessage('');
    }
  };

  const startChatSession = (initialPrompt: string, firstModelResponse: AnalysisResult) => {
      const analysisText = JSON.stringify(firstModelResponse, null, 2);
      const modelMessageContent = `Here is the initial analysis:\n\n\`\`\`json\n${analysisText}\n\`\`\`\nHow can I help you refine this?`;
      setChatHistory([
          { role: 'user', parts: [{ text: initialPrompt }] },
          { role: 'model', parts: [{ text: modelMessageContent }] },
      ]);
  };
  
  const handleWebAnalysis = async (config: typeof currentConfig) => {
      setLoadingMessage('Fetching URL content...');
      const proxy = PROXIES[0];
      const userAgent = USER_AGENTS[0];

      let response;
      try { response = await fetch(`${proxy}${encodeURIComponent(url)}`, { headers: { 'User-Agent': userAgent } }); }
      catch (err: any) { throw new Error(`Network error fetching URL via proxy.`); }

      if (!response.ok) { throw new Error(`Proxy failed to fetch URL. Status: ${response.status}`); }
      const html = await response.text();

      setLoadingMessage('Parsing HTML content...');
      const sanitizedHtml = window.DOMPurify.sanitize(html);
      const doc = new DOMParser().parseFromString(sanitizedHtml, 'text/html');
      const data: ScrapedData = {
          titles: Array.from(doc.querySelectorAll('h1, h2, h3')).map(el => el.textContent?.trim() || '').filter(Boolean),
          links: Array.from(doc.querySelectorAll('a[href]')).map(el => (el as HTMLAnchorElement).href),
          text: doc.body.textContent?.replace(/\s\s+/g, ' ').trim() || ''
      };
      setScrapedData(data);

      setLoadingMessage(`Analyzing with ${aiProvider}...`);
      const analysis = await analyzeContent(aiProvider, config, 'text', { url, data }, customPrompt);
      setAnalysisResult(analysis);
      startChatSession(customPrompt || `Analyze this page: ${url}`, analysis);
  };
  
  const handleImageAnalysis = async (config: typeof currentConfig) => {
    if (!imageFile) return;
    setLoadingMessage('Processing image...');
    const base64Data = await toBase64(imageFile);
    setLoadingMessage(`Analyzing with ${aiProvider}...`);
    const analysis = await analyzeContent(aiProvider, config, 'image', { data: { data: base64Data, mimeType: imageFile.type } }, customPrompt);
    setAnalysisResult(analysis);
    startChatSession(customPrompt || 'Analyze this image', analysis);
  };

  const handleVideoAnalysis = async () => {
    if (!videoFile) return;
    setLoadingMessage('Processing video with Gemini...');
    const base64Data = await toBase64(videoFile);
    const analysis = await getGeminiVideoAnalysis(base64Data, videoFile.type, customPrompt, temperature);
    setAnalysisResult(analysis);
    startChatSession(customPrompt || `Analyze this video`, analysis);
  };
  
  const handleSearchGrounding = async (config: typeof currentConfig) => {
    if (aiProvider === AIProvider.GEMINI) {
        setLoadingMessage('Searching with Gemini 2.5 Flash...');
        const analysis = await getGeminiSearchGrounding(customPrompt);
        setAnalysisResult(analysis);
        startChatSession(customPrompt, analysis);
    } else {
        setLoadingMessage('Processing query with model...');
        let currentHistory: ChatMessage[] = [{ role: 'user', parts: [{ text: customPrompt }] }];
        const systemInstruction = "You are a helpful assistant. When you need real-time information to answer a question, you must use the 'web_fetch' tool. Do not invent URLs.";

        for (let i = 0; i < 3; i++) {
            const response = await runChatTurn(aiProvider, config, currentHistory, [WEB_FETCH_TOOL_OPENAI], systemInstruction);
            const toolCalls = response.tool_calls;
            
            if (!toolCalls || toolCalls.length === 0) {
                const text = response.content;
                const result = { text: text || "No response text.", citations: [] };
                setAnalysisResult(result);
                startChatSession(customPrompt, result);
                return;
            }
            
            currentHistory.push({ role: 'model', parts: [], tool_calls: toolCalls });
            setLoadingMessage('Model requested a web search. Fetching...');
            const toolResults: ChatMessage[] = [];
            for (const call of toolCalls) {
                const func = call.function;
                const args = JSON.parse(func.arguments);

                if (func.name === 'web_fetch') {
                    const searchResult = await performWebFetch(args, appSettings?.allowlist || []);
                    toolResults.push({ role: 'tool', tool_call_id: call.id, name: func.name, parts: [{ text: searchResult }] });
                }
            }
            currentHistory.push(...toolResults);
            setLoadingMessage('Sending search results back to model...');
        }
        setError("Search process took too many steps and was halted.");
    }
  };

  const handleComplexQuery = async () => {
    setLoadingMessage('Processing complex query with Gemini 2.5 Pro...');
    const analysis = await runGeminiComplexQuery(customPrompt, temperature);
    setAnalysisResult(analysis);
    startChatSession(customPrompt, analysis);
  };

  const handleImageGeneration = async (config: typeof currentConfig) => {
    setLoadingMessage(`Generating ${numberOfImages} image(s) with ${aiProvider}...`);
    const result = await generateImage(aiProvider, config, customPrompt, aspectRatio, numberOfImages);
    setAnalysisResult(result);
  };
  
  const handleTTS = async () => {
    setLoadingMessage('Generating speech with Gemini TTS...');
    const result = await generateGeminiTTS(customPrompt);
    setAnalysisResult(result);
  };

  const handleAudioTranscription = async () => {
    if (!recordedAudio) { throw new Error("No recorded audio to transcribe."); }
    setLoadingMessage('Transcribing audio with Gemini...');
    const base64Data = await toBase64(new File([recordedAudio], "audio.webm", {type: recordedAudio.type}));
    const result = await transcribeGeminiAudio(base64Data, recordedAudio.type);
    setAnalysisResult(result);
  };
  
  const refineAnalysis = async (new_instructions: string): Promise<string> => {
    setLoadingMessage(`Refining analysis with: "${new_instructions}"`);
    setLoading(true);
    let apiKey = '';
    if (PROVIDER_CONFIG[aiProvider].requiresKey) {
        try { apiKey = await getDecryptedActiveKey(); } 
        catch (e: any) { setError(e.message); setLoading(false); return `Error: ${e.message}`; }
    }
    const finalConfig = { ...currentConfig, apiKey };

    try {
      let newAnalysis;
      if (analysisMode === AnalysisMode.WEB && scrapedData) {
        newAnalysis = await analyzeContent(aiProvider, finalConfig, 'text', { url, data: scrapedData }, new_instructions);
      } else if (analysisMode === AnalysisMode.IMAGE_ANALYSIS && imageFile) {
        const base64Data = await toBase64(imageFile);
        newAnalysis = await analyzeContent(aiProvider, finalConfig, 'image', { data: { data: base64Data, mimeType: imageFile.type } }, new_instructions);
      } else {
        throw new Error("No context available to refine analysis.");
      }
      setAnalysisResult(newAnalysis);
      return `OK, I've updated the analysis above based on your new instructions.`;
    } catch (e: any) {
      setError(`Failed to refine analysis: ${e.message}`);
      return `I encountered an error trying to refine the analysis: ${e.message}`;
    } finally {
      setLoading(false);
      setLoadingMessage('');
    }
  };

  const handleChatSubmit = async (message: string) => {
    setChatIsLoading(true);
    const updatedHistory: ChatMessage[] = [...chatHistory, { role: 'user', parts: [{ text: message }] }];
    setChatHistory(updatedHistory);

    let apiKey = '';
    if (PROVIDER_CONFIG[aiProvider].requiresKey) {
        try { apiKey = await getDecryptedActiveKey(); } 
        catch (e: any) {
            setError(e.message);
            setChatHistory([...updatedHistory, { role: 'model', parts: [{ text: `Error: ${e.message}` }] }]);
            setChatIsLoading(false);
            return;
        }
    }
    const finalConfig = { ...currentConfig, apiKey };

    try {
        const systemInstruction = `You are an AI assistant helping a user analyze content. Your primary tool is 'refine_analysis'. When the user asks to change, alter, or get different information from the content, you must call this tool with their new instructions. For general conversation, respond normally.`;
        let imagePayload = undefined;
        if (analysisMode === AnalysisMode.IMAGE_ANALYSIS && imageFile) { imagePayload = { data: await toBase64(imageFile), mimeType: imageFile.type }; }

        let response = await runChatTurn(aiProvider, finalConfig, updatedHistory, [REFINE_ANALYSIS_TOOL_OPENAI], systemInstruction, imagePayload);
        
        let toolCalls;
        if (aiProvider === AIProvider.GEMINI) {
            toolCalls = response.candidates?.[0]?.content?.parts.filter((p: any) => p.functionCall).map((p: any) => p.functionCall);
        } else {
            toolCalls = response.tool_calls;
        }
        
        if (toolCalls && toolCalls.length > 0) {
            const modelResponseMessage: ChatMessage = { role: 'model', parts: [], tool_calls: toolCalls };
            const newHistoryWithToolCall = [...updatedHistory, modelResponseMessage];
            
            const toolResults: ChatMessage[] = [];
            for (const call of toolCalls) {
                const funcName = aiProvider === AIProvider.GEMINI ? call.name : call.function.name;
                const args = aiProvider === AIProvider.GEMINI ? call.args : JSON.parse(call.function.arguments);

                if (funcName === 'refine_analysis') {
                    const resultText = await refineAnalysis(args.new_instructions);
                    const toolCallId = aiProvider === AIProvider.GEMINI ? `tool-call-${Date.now()}` : call.id; 
                    toolResults.push({ role: 'tool', name: funcName, tool_call_id: toolCallId, parts: [{ text: resultText }]});
                }
            }

            const finalBotMessage: ChatMessage = { role: 'model', parts: [{ text: toolResults.map(r => r.parts[0].text).join('\n') }]};
            setChatHistory([...newHistoryWithToolCall, ...toolResults, finalBotMessage]);

        } else {
            const responseText = aiProvider === AIProvider.GEMINI ? response.text : response.content;
            setChatHistory([...updatedHistory, { role: 'model', parts: [{ text: responseText || "I'm sorry, I didn't get a valid response." }] }]);
        }
    } catch (err: any) {
        const errorMsg = `Chat error: ${err.message}`;
        setError(errorMsg);
        setChatHistory([...updatedHistory, { role: 'model', parts: [{ text: errorMsg }] }]);
    } finally {
        setChatIsLoading(false);
    }
  };

  const SettingsPanel = () => {
      const [newKeyProvider, setNewKeyProvider] = useState<AIProvider>(AIProvider.VENICE_AI);
      const [newKeyLabel, setNewKeyLabel] = useState('');
      const [newKeyValue, setNewKeyValue] = useState('');
      const [newKeyPassphrase, setNewKeyPassphrase] = useState('');
      const [verificationStatus, setVerificationStatus] = useState<Record<number, { ok: boolean; message: string }>>({});
      const [verifyingKeyId, setVerifyingKeyId] = useState<number | null>(null);
      const [allowlistText, setAllowlistText] = useState(appSettings?.allowlist.join('\n') || '');

      const handleAddKey = async (e: React.FormEvent) => {
          e.preventDefault();
          if (!newKeyLabel || !newKeyValue || !newKeyPassphrase) {
              alert("All fields are required to add a key.");
              return;
          }
          try {
              const { cipher, iv, salt } = await encrypt(newKeyValue, newKeyPassphrase);
              const newKey: Omit<StoredKey, 'id'> = {
                  provider: newKeyProvider,
                  label: newKeyLabel,
                  encKey: cipher,
                  iv,
                  salt,
                  createdAt: Date.now(),
              };
              const id = await db.addKey(newKey);
              setStoredKeys([...storedKeys, { ...newKey, id }]);
              setNewKeyLabel('');
              setNewKeyValue('');
              setNewKeyPassphrase('');
          } catch (err: any) {
              alert(`Error adding key: ${err.message}`);
          }
      };

      const handleVerifyKey = async (key: StoredKey) => {
        setVerifyingKeyId(key.id);

        const passphrase = window.prompt(`Enter passphrase for "${key.label}" to verify:`);
        if (!passphrase) {
            setVerificationStatus(prev => ({ ...prev, [key.id]: { ok: false, message: 'Cancelled' } }));
            setVerifyingKeyId(null);
            return;
        }

        setVerificationStatus(prev => ({ ...prev, [key.id]: { ok: false, message: 'Verifying...' } }));

        try {
            const apiKey = await decrypt(key.encKey, key.iv, key.salt, passphrase);
            const adapter = providerRegistry[key.provider as keyof typeof providerRegistry];
            if (!adapter) throw new Error("No adapter for this provider.");
            const result = await adapter.verify(apiKey);
            setVerificationStatus(prev => ({ ...prev, [key.id]: { ok: result.ok, message: result.ok ? '✅ Valid' : '❌ Invalid' } }));
        } catch (err: any) {
             setVerificationStatus(prev => ({ ...prev, [key.id]: { ok: false, message: `⚠️ ${err.message}` } }));
        } finally {
            setVerifyingKeyId(null);
        }
      };

      const handleAllowlistChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
          setAllowlistText(e.target.value);
          if (appSettings) {
              setAppSettings({ ...appSettings, allowlist: e.target.value.split('\n').map(l => l.trim()).filter(Boolean) });
          }
      };

      return (
        <div className={`${cardClasses} space-y-6`}>
            <div className="flex items-center gap-2">
              <span className="text-2xl">⚙️</span>
              <h2 className="text-2xl font-bold text-[#fffbfe]">Settings</h2>
            </div>

            <div className='space-y-6 divide-y divide-[rgba(255,255,255,0.05)]'>
                {/* API Key Management */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-[#fffbfe] flex items-center gap-2">
                      🔐 API Keys
                    </h3>
                    
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                        {storedKeys.length === 0 ? (
                          <p className="text-sm text-[#cac7d0]">No API keys stored yet</p>
                        ) : (
                          storedKeys.map(key => (
                            <div key={key.id} className="glass p-3 rounded-[var(--md-shape-radius-lg)] border border-[rgba(255,255,255,0.1)] hover:border-[rgba(139,92,246,0.3)] smooth-transition">
                              <div className="flex items-center justify-between gap-2">
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-white truncate">{key.label}</p>
                                  <p className="text-xs text-[#cac7d0]">{key.provider}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className={`text-xs font-mono px-2 py-1 rounded-full ${verificationStatus[key.id]?.ok ? 'bg-green-500/20 text-green-300' : 'bg-yellow-500/20 text-yellow-300'}`}>
                                    {verificationStatus[key.id]?.message || '?'}
                                  </span>
                                  <button onClick={() => handleVerifyKey(key)} disabled={verifyingKeyId === key.id} className={`text-xs font-semibold py-1 px-3 rounded-[var(--md-shape-radius-md)] smooth-transition ${verifyingKeyId === key.id ? 'opacity-50 cursor-wait' : 'bg-[rgba(139,92,246,0.2)] hover:bg-[rgba(139,92,246,0.3)] text-[#fffbfe]'}`}>
                                    {verifyingKeyId === key.id ? '...' : '✓'}
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                    </div>

                    {/* Add Key Form */}
                    <div className="pt-2 border-t border-[rgba(255,255,255,0.05)]">
                      <p className="text-xs text-[#cac7d0] mb-3">➕ Add new key</p>
                      <form onSubmit={handleAddKey} className="space-y-3">
                          <div className="grid grid-cols-1 gap-3">
                              <select value={newKeyProvider} onChange={e => setNewKeyProvider(e.target.value as AIProvider)} className={inputClasses}>
                                {Object.values(AIProvider).filter(p => p !== AIProvider.GEMINI).map(p => <option key={p} value={p}>{p}</option>)}
                              </select>
                              <input type="text" value={newKeyLabel} onChange={e => setNewKeyLabel(e.target.value)} placeholder="Label (e.g., 'My Venice Key')" className={inputClasses} />
                              <input type="password" value={newKeyValue} onChange={e => setNewKeyValue(e.target.value)} placeholder="API Key" className={inputClasses} />
                              <input type="password" value={newKeyPassphrase} onChange={e => setNewKeyPassphrase(e.target.value)} placeholder="Local Passphrase" className={inputClasses} />
                          </div>
                          <button type="submit" className={buttonPrimaryClasses}>
                            🔒 Add & Encrypt
                          </button>
                      </form>
                    </div>
                </div>

                {/* Allowlist */}
                <div className="space-y-3 pt-4">
                    <h3 className="text-lg font-semibold text-[#fffbfe] flex items-center gap-2">
                      🌐 Web Fetch Allowlist
                    </h3>
                    <textarea value={allowlistText} onChange={handleAllowlistChange} placeholder="Enter one domain per line&#10;e.g., en.wikipedia.org&#10;github.com" className={`${inputClasses} resize-none`} rows={3} />
                    <p className="text-xs text-[#cac7d0]">Only these domains can be accessed by the web fetch tool.</p>
                </div>
            </div>
        </div>
      );
  };
  
  const CHAT_ENABLED_MODES = [AnalysisMode.WEB, AnalysisMode.IMAGE_ANALYSIS, AnalysisMode.VIDEO_ANALYSIS, AnalysisMode.COMPLEX_QUERY, AnalysisMode.SEARCH_GROUNDING];

  const renderInputs = () => {
    switch(analysisMode) {
      case AnalysisMode.WEB: return <input type="url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://example.com" className={inputClasses} required />;
      case AnalysisMode.IMAGE_ANALYSIS: return <input type="file" accept="image/*" onChange={(e) => {
        if (imagePreview) URL.revokeObjectURL(imagePreview);
        const f = e.target.files?.[0]; 
        if(f){
          setImageFile(f); 
          setImagePreview(URL.createObjectURL(f));
        }
      }} className="w-full text-sm text-[#cac7d0] file:mr-3 file:py-2 file:px-4 file:rounded-[var(--md-shape-radius-md)] file:border-0 file:text-sm file:font-semibold file:bg-[rgba(139,92,246,0.2)] file:text-[#fffbfe] hover:file:bg-[rgba(139,92,246,0.3)] smooth-transition" required />;
      case AnalysisMode.VIDEO_ANALYSIS: return <input type="file" accept="video/*" onChange={(e) => {
        const f = e.target.files?.[0]; 
        if(f){
          setVideoFile(f);
        }
      }} className="w-full text-sm text-[#cac7d0] file:mr-3 file:py-2 file:px-4 file:rounded-[var(--md-shape-radius-md)] file:border-0 file:text-sm file:font-semibold file:bg-[rgba(139,92,246,0.2)] file:text-[#fffbfe] hover:file:bg-[rgba(139,92,246,0.3)] smooth-transition" required />;
      case AnalysisMode.IMAGE_GENERATION: return <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'><select value={aspectRatio} onChange={(e) => setAspectRatio(e.target.value)} className={inputClasses}><option value="1:1">📐 Square (1:1)</option><option value="16:9">🖼️ Landscape (16:9)</option><option value="9:16">📱 Portrait (9:16)</option></select><input type="number" min="1" max={aiProvider === AIProvider.GEMINI ? "4" : "1"} value={numberOfImages} onChange={e => setNumberOfImages(parseInt(e.target.value) || 1)} className={inputClasses} placeholder="Number of images" /></div>;
      case AnalysisMode.AUDIO_TRANSCRIPTION: return <AudioRecorder onRecordingComplete={setRecordedAudio} disabled={loading} />;
      default: return null;
    }
  };

  const renderResults = () => {
    if (!analysisResult) return null;
    if (isTextResult(analysisResult)) return <TextAnalysisResultDisplay analysis={analysisResult} provider={aiProvider} />;
    if (isImageAnalysisResult(analysisResult)) return <ImageAnalysisResultDisplay analysis={analysisResult} imageUrl={imagePreview} provider={aiProvider} />;
    if (isSearchGroundingResult(analysisResult)) return <SearchGroundingResultDisplay result={analysisResult} />;
    if (isImageGenerationResult(analysisResult)) return (
      <div className={cardClasses}>
        <div className="flex items-center gap-2 mb-6">
          <span className="text-2xl">🎨</span>
          <h2 className="text-2xl font-bold text-[#fffbfe]">Generated Images</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {analysisResult.images.map((image, index) => (
            <div key={`gen-${index}`} className="group space-y-2">
              <img src={`data:image/png;base64,${image.base64}`} alt={`Generated ${index + 1}`} className="rounded-[var(--md-shape-radius-lg)] w-full smooth-transition group-hover:shadow-lg group-hover:shadow-[#8b5cf6]/20" />
              <p className="text-sm text-[#cac7d0]">Image {index + 1}</p>
            </div>
          ))}
        </div>
      </div>
    );
    if (isTTSResult(analysisResult)) return (
      <div className={cardClasses}>
        <div className="flex items-center gap-2 mb-6">
          <span className="text-2xl">🔊</span>
          <h2 className="text-2xl font-bold text-[#fffbfe]">Generated Speech</h2>
        </div>
        <div className="bg-[rgba(139,92,246,0.1)] p-4 rounded-[var(--md-shape-radius-lg)] border border-[rgba(139,92,246,0.2)]">
          <audio controls src={`data:audio/wav;base64,${analysisResult.audioBase64}`} className="w-full"></audio>
        </div>
      </div>
    );
    if (isTranscriptionResult(analysisResult)) return (
      <div className={cardClasses}>
        <div className="flex items-center gap-2 mb-6">
          <span className="text-2xl">🎤</span>
          <h2 className="text-2xl font-bold text-[#fffbfe]">Transcription</h2>
        </div>
        <p className="text-[#fffbfe] whitespace-pre-wrap bg-[rgba(0,0,0,0.3)] p-4 rounded-[var(--md-shape-radius-lg)] border border-[rgba(255,255,255,0.1)]">{analysisResult.text}</p>
      </div>
    );
    return null;
  }

  const showPromptTextarea = ![AnalysisMode.WEB, AnalysisMode.IMAGE_ANALYSIS, AnalysisMode.VIDEO_ANALYSIS, AnalysisMode.AUDIO_TRANSCRIPTION].includes(analysisMode);

  return (
    <div className="min-h-screen backdrop-blur-sm">
      {/* Header */}
      <div className="border-b border-[rgba(255,255,255,0.1)] sticky top-0 z-40 glass">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-[var(--md-shape-radius-lg)] bg-gradient-to-br from-[#8b5cf6] to-[#6d28d9] flex items-center justify-center">
                <span className="text-white font-bold">✨</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-[#fffbfe]">Venice Toolkit</h1>
                <p className="text-xs text-[#cac7d0]">AI Content Analysis</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="min-h-[calc(100vh-64px)] p-4 sm:p-6 lg:p-8 font-sans">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Panel - Controls */}
          <div className="lg:col-span-1 space-y-6">
            <div className={`${cardClasses} space-y-6`}>
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Task Selection */}
                <div>
                  <label className={labelClasses}>📋 Task</label>
                  <select value={analysisMode} onChange={(e) => setAnalysisMode(e.target.value as AnalysisMode)} className={inputClasses}>
                    <option value={AnalysisMode.WEB}>🌐 Web Page Analysis</option>
                    <option value={AnalysisMode.IMAGE_ANALYSIS}>🖼️ Image Analysis</option>
                    <option value={AnalysisMode.IMAGE_GENERATION}>🎨 Image Generation</option>
                    <option value={AnalysisMode.VIDEO_ANALYSIS}>🎬 Video Analysis</option>
                    <option value={AnalysisMode.SEARCH_GROUNDING}>🔍 Grounded Search</option>
                    <option value={AnalysisMode.COMPLEX_QUERY}>💡 Complex Query</option>
                    <option value={AnalysisMode.TTS}>🔊 Text-to-Speech</option>
                    <option value={AnalysisMode.AUDIO_TRANSCRIPTION}>🎤 Audio Transcription</option>
                  </select>
                </div>

                {renderInputs()}
                
                {/* Custom Prompt */}
                <div>
                  <label className={labelClasses}>{showPromptTextarea ? '✍️ Prompt' : '✍️ Custom Prompt (Optional)'}</label>
                  <textarea value={customPrompt} onChange={(e) => setCustomPrompt(e.target.value)} placeholder='Enter your prompt or instructions here...' className={`${inputClasses} resize-none`} rows={showPromptTextarea ? 4 : 2} required={showPromptTextarea} />
                </div>
                
                {/* Provider and Model */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClasses}>🤖 AI Provider</label>
                    <select value={aiProvider} onChange={(e) => setAiProvider(e.target.value as AIProvider)} 
                      disabled={[AnalysisMode.VIDEO_ANALYSIS, AnalysisMode.COMPLEX_QUERY, AnalysisMode.TTS, AnalysisMode.AUDIO_TRANSCRIPTION].includes(analysisMode)}
                      className={`${inputClasses} disabled:opacity-50 disabled:cursor-not-allowed`}>
                      {Object.values(AIProvider).map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelClasses}>⚙️ Model</label>
                    <input list="model-options" type="text" value={modelName} onChange={(e) => setModelName(e.target.value)} placeholder="Select or enter model" className={inputClasses} required />
                    <datalist id="model-options">
                      {availableModels.map(m => <option key={m} value={m} />)}
                    </datalist>
                  </div>
                </div>

                {aiProvider === AIProvider.OPENAI_COMPATIBLE && (
                  <div>
                    <label className={labelClasses}>🔗 API Base URL</label>
                    <input type="url" value={genericApiBaseUrl} onChange={(e) => setGenericApiBaseUrl(e.target.value)} className={inputClasses} required />
                  </div>
                )}
                
                {/* Temperature Control */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className={labelClasses}>🌡️ Creativity</label>
                    <span className="text-xs font-mono bg-[rgba(139,92,246,0.2)] px-2 py-1 rounded text-[#fffbfe]">{temperature.toFixed(2)}</span>
                  </div>
                  <input type="range" min="0" max="1" step="0.05" value={temperature} onChange={(e) => setTemperature(parseFloat(e.target.value))} className="w-full h-2 bg-[rgba(255,255,255,0.1)] rounded-full appearance-none cursor-pointer accent-[#8b5cf6]" />
                  <div className="flex justify-between text-xs text-[#cac7d0] mt-1">
                    <span>Precise</span>
                    <span>Creative</span>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="pt-4">
                  <button type="submit" disabled={loading} className={buttonPrimaryClasses}>
                    {loading ? (
                      <>
                        <span className="animate-spin mr-2">⏳</span>
                        Processing...
                      </>
                    ) : (
                      <>
                        <span className="mr-2">✨</span>
                        Analyze
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
            
            {/* Settings Panel */}
            <SettingsPanel />
          </div>

          {/* Right Panel - Results */}
          <div className="lg:col-span-2 space-y-6">
            {loading && <div className={cardClasses}><Spinner message={loadingMessage} /></div>}
            {error && (
              <div className="glass p-6 rounded-[var(--md-shape-radius-xl)] border-l-4 border-[#f2b8b5]">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">⚠️</span>
                  <div>
                    <h3 className="font-semibold text-[#f2b8b5]">Error</h3>
                    <p className="text-[#fffbfe] text-sm mt-1">{error}</p>
                  </div>
                </div>
              </div>
            )}
            {scrapedData && <ScrapedDataDisplay data={scrapedData} />}
            {renderResults()}
            {analysisResult && CHAT_ENABLED_MODES.includes(analysisMode) && <ChatInterface history={chatHistory} onSubmit={handleChatSubmit} isLoading={chatIsLoading} />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
