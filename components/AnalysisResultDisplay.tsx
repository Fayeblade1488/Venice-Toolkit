
import React from 'react';
import { TextAnalysisResult, AIProvider } from '../types';

interface TextAnalysisResultDisplayProps {
  analysis: TextAnalysisResult;
  provider: AIProvider;
}

const TextAnalysisResultDisplay: React.FC<TextAnalysisResultDisplayProps> = ({ analysis, provider }) => {
  if (!analysis) {
    return null;
  }

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(analysis, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'analysis_result.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  const getSentimentColor = (sentiment: string) => {
    switch(sentiment) {
      case 'positive': return 'text-green-400';
      case 'negative': return 'text-red-400';
      default: return 'text-yellow-400';
    }
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
          <span className="text-3xl">📊</span>
          <h2 className="text-2xl font-bold text-[#fffbfe]">{provider} Analysis</h2>
        </div>
        <button
          onClick={handleExport}
          className="px-4 py-2 bg-gradient-to-r from-[#8b5cf6]/20 to-[#6d28d9]/20 text-[#fffbfe] text-sm font-semibold rounded-[var(--md-shape-radius-md)] hover:from-[#8b5cf6]/30 hover:to-[#6d28d9]/30 smooth-transition border border-[rgba(139,92,246,0.3)]"
        >
          📥 Export JSON
        </button>
      </div>

      <div className="space-y-4">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card icon="😊">
            <h3 className="font-semibold text-lg mb-2 text-[#fffbfe]">Sentiment</h3>
            <div className="flex items-baseline gap-2">
              <p className={`text-2xl font-bold ${getSentimentColor(analysis.sentiment.overall)}`}>
                {analysis.sentiment.overall.charAt(0).toUpperCase() + analysis.sentiment.overall.slice(1)}
              </p>
              <span className="text-sm text-[#cac7d0]">Score: {analysis.sentiment.score.toFixed(2)}</span>
            </div>
          </Card>

          <Card icon="📁">
            <h3 className="font-semibold text-lg mb-2 text-[#fffbfe]">Content Type</h3>
            <p className="text-[#fffbfe] capitalize text-lg font-medium">{analysis.content_type}</p>
          </Card>
        </div>

        {/* Trends */}
        {analysis.trends.length > 0 && (
          <Card icon="📈">
            <h3 className="font-semibold text-lg mb-3 text-[#fffbfe]">Key Trends</h3>
            <div className="flex flex-wrap gap-2">
              {analysis.trends.map((trend, i) => (
                <span key={i} className="inline-flex items-center gap-1 bg-gradient-to-r from-[#8b5cf6]/30 to-[#6d28d9]/30 text-[#fffbfe] text-sm font-medium px-3 py-1.5 rounded-[var(--md-shape-radius-lg)] border border-[rgba(139,92,246,0.3)]">
                  ✨ {trend}
                </span>
              ))}
            </div>
          </Card>
        )}

        {/* Summary */}
        <Card icon="📝">
          <h3 className="font-semibold text-lg mb-3 text-[#fffbfe]">Summary</h3>
          <p className="text-[#cac7d0] leading-relaxed">{analysis.summary}</p>
        </Card>

        {/* Insights */}
        <Card icon="💡">
          <h3 className="font-semibold text-lg mb-3 text-[#fffbfe]">Insights</h3>
          <p className="text-[#cac7d0] whitespace-pre-wrap leading-relaxed">{analysis.insights}</p>
        </Card>
      </div>
    </div>
  );
};

export default TextAnalysisResultDisplay;