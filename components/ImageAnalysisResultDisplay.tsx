
import React from 'react';
import { ImageAnalysisResult, AIProvider } from '../types';

interface ImageAnalysisResultDisplayProps {
  analysis: ImageAnalysisResult;
  imageUrl: string;
  provider: AIProvider;
}

const ImageAnalysisResultDisplay: React.FC<ImageAnalysisResultDisplayProps> = ({ analysis, imageUrl, provider }) => {
  if (!analysis) {
    return null;
  }

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'text-green-400';
      case 'negative': return 'text-red-400';
      default: return 'text-yellow-400';
    }
  };

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(analysis, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'image_analysis_result.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const Card = ({ children, icon }: { children: React.ReactNode; icon?: string }) => (
    <div className="glass p-4 rounded-[var(--md-shape-radius-lg)] border border-[rgba(255,255,255,0.1)] smooth-transition hover:border-[rgba(139,92,246,0.3)]">
      {icon && <span className="text-2xl mb-2 block">{icon}</span>}
      {children}
    </div>
  );

  return (
    <div className="glass p-6 rounded-[var(--md-shape-radius-xl)]">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <span className="text-3xl">🖼️</span>
          <h2 className="text-2xl font-bold text-[#fffbfe]">{provider} Image Analysis</h2>
        </div>
        <button
          onClick={handleExport}
          className="px-4 py-2 bg-gradient-to-r from-[#8b5cf6]/20 to-[#6d28d9]/20 text-[#fffbfe] text-sm font-semibold rounded-[var(--md-shape-radius-md)] hover:from-[#8b5cf6]/30 hover:to-[#6d28d9]/30 smooth-transition border border-[rgba(139,92,246,0.3)]"
        >
          📥 Export JSON
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Image Preview */}
        <div className="md:col-span-1">
          <img src={imageUrl} alt="Analyzed" className="rounded-[var(--md-shape-radius-lg)] object-cover w-full h-full shadow-lg" />
        </div>

        {/* Analysis Data */}
        <div className="md:col-span-2 space-y-4">
          {/* Description */}
          <Card icon="📝">
            <h3 className="font-semibold text-lg mb-2 text-[#fffbfe]">Description</h3>
            <p className="text-[#cac7d0] leading-relaxed">{analysis.description}</p>
          </Card>

          {/* Detected Objects */}
          {analysis.objects.length > 0 && (
            <Card icon="🔍">
              <h3 className="font-semibold text-lg mb-3 text-[#fffbfe]">Detected Objects</h3>
              <div className="flex flex-wrap gap-2">
                {analysis.objects.map((obj, i) => (
                  <span key={i} className="inline-flex items-center gap-1 bg-gradient-to-r from-[#8b5cf6]/30 to-[#6d28d9]/30 text-[#fffbfe] text-sm font-medium px-3 py-1.5 rounded-[var(--md-shape-radius-lg)] border border-[rgba(139,92,246,0.3)] capitalize">
                    ✨ {obj}
                  </span>
                ))}
              </div>
            </Card>
          )}

          {/* Sentiment */}
          <Card icon="😊">
            <h3 className="font-semibold text-lg mb-2 text-[#fffbfe]">Sentiment</h3>
            <p className={`capitalize font-bold text-xl ${getSentimentColor(analysis.sentiment)}`}>
              {analysis.sentiment}
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ImageAnalysisResultDisplay;