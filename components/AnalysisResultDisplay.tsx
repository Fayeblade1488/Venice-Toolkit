
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
      case 'positive': return 'text-[#388e3c]';
      case 'negative': return 'text-[#d32f2f]';
      default: return 'text-[#fbc02d]';
    }
  };

  const Card = ({ children }: { children: React.ReactNode }) => (
    <div className="bg-[#1e1e1e]/70 p-4 rounded-xl border border-[#424242]/80">{children}</div>
  );

  return (
    <div className="glassmorphic p-6 rounded-2xl">
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-2xl font-bold text-[#fbc02d]">{provider} Analysis</h2>
        <button
          onClick={handleExport}
          className="px-4 py-2 bg-[#d32f2f] text-white text-sm font-semibold rounded-lg hover:bg-[#f75060] transition-colors focus:outline-none focus:ring-2 focus:ring-[#f75060] focus:ring-offset-2 focus:ring-offset-[#121212]"
        >
          Export JSON
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[#fafafa]">
        <Card>
          <h3 className="font-semibold text-lg mb-2 text-[#fafafa]">Sentiment</h3>
          <p><strong className={getSentimentColor(analysis.sentiment.overall)}>{analysis.sentiment.overall.charAt(0).toUpperCase() + analysis.sentiment.overall.slice(1)}</strong> (Score: {analysis.sentiment.score.toFixed(2)})</p>
        </Card>
        <Card>
          <h3 className="font-semibold text-lg mb-2 text-[#fafafa]">Content Type</h3>
          <p className="capitalize">{analysis.content_type}</p>
        </Card>
        <div className="md:col-span-2">
            <Card>
              <h3 className="font-semibold text-lg mb-2 text-[#fafafa]">Key Trends</h3>
              <div className="flex flex-wrap gap-2">
                {analysis.trends.map((trend, i) => (
                  <span key={i} className="bg-[#7b1fa2]/30 text-[#ce93d8] text-sm font-medium px-2.5 py-0.5 rounded-full">{trend}</span>
                ))}
              </div>
            </Card>
        </div>
        <div className="md:col-span-2">
            <Card>
              <h3 className="font-semibold text-lg mb-2 text-[#fafafa]">Summary</h3>
              <p className="text-[#bdbdbd]">{analysis.summary}</p>
            </Card>
        </div>
        <div className="md:col-span-2">
            <Card>
              <h3 className="font-semibold text-lg mb-2 text-[#fafafa]">Insights</h3>
              <p className="text-[#bdbdbd] whitespace-pre-wrap">{analysis.insights}</p>
            </Card>
        </div>
      </div>
    </div>
  );
};

export default TextAnalysisResultDisplay;