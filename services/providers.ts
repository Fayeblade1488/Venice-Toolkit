// services/providers.ts
import { AIProvider } from '../types';

export interface ProviderAdapter {
  verify: (apiKey: string) => Promise<{ ok: boolean; who?: string }>;
  listModels: (apiKey: string) => Promise<string[]>;
}

// This function will be implemented elsewhere, as it needs to call Gemini.
// The provider registry will depend on it being passed in.
export type ModelListScraper = (urls: string[]) => Promise<string[]>;

export const createProviderRegistry = (listModelsViaUrlContext: ModelListScraper): Record<Exclude<AIProvider, typeof AIProvider.GEMINI | typeof AIProvider.OPENAI_COMPATIBLE>, ProviderAdapter> => ({
  [AIProvider.VENICE_AI]: {
    async verify(k) {
      const r = await fetch("https://api.venice.ai/api/v1/models", { headers: { Authorization: `Bearer ${k}` }});
      return { ok: r.ok };
    },
    async listModels(k) {
      const r = await fetch("https://api.venice.ai/api/v1/models", { headers: { Authorization: `Bearer ${k}` }});
      if (!r.ok) throw new Error(`Venice /models responded with ${r.status}`);
      const j = await r.json();
      const arr = (j.data ?? j.models ?? []).map((m: any) => m.id ?? m.name).filter(Boolean);
      return [...new Set<string>(arr)];
    },
  },
  [AIProvider.PERPLEXITY]: {
    async verify(k) {
      const r = await fetch("https://api.perplexity.ai/chat/completions", {
        method: "POST",
        headers: { "Authorization": `Bearer ${k}`, "Content-Type": "application/json" },
        body: JSON.stringify({ model: "sonar-small-32k-chat", messages: [{ role: "user", content: "ping" }], max_tokens: 1 })
      });
      return { ok: r.ok };
    },
    async listModels(k) {
      const tryOpenAIEndpoint = async () => {
        const r = await fetch("https://api.perplexity.ai/v1/models", { headers: { "Authorization": `Bearer ${k}` } });
        if (r.ok) { 
            const j = await r.json(); 
            return (j.data ?? []).map((m:any) => m.id); 
        }
        // Perplexity docs say 404 is expected for this endpoint, so treat it as a trigger for fallback.
        if (r.status === 404) return null;
        throw new Error(`Perplexity /v1/models API error: ${r.status}`);
      };

      try {
        const models = await tryOpenAIEndpoint();
        if (models && models.length > 0) return models;
      } catch (e) {
        console.warn("Perplexity /v1/models endpoint failed, preparing to scrape docs.", e);
      }

      // Fallback: ask Gemini to extract current model names from Perplexity’s docs page.
      const urls = ["https://docs.perplexity.ai/docs/model-cards"];
      return await listModelsViaUrlContext(urls);
    },
  },
  [AIProvider.XAI]: {
    async verify(k) {
      const r = await fetch("https://api.x.ai/v1/models", { headers: { Authorization: `Bearer ${k}` }});
      return { ok: r.ok };
    },
    async listModels(k) {
      const r = await fetch("https://api.x.ai/v1/models", { headers: { Authorization: `Bearer ${k}` }});
      if (!r.ok) throw new Error(`xAI /v1/models responded with ${r.status}`);
      const j = await r.json();
      return (j.data ?? []).map((m:any) => m.id);
    },
  },
});
