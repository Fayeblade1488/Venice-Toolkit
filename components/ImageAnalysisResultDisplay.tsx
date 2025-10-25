
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
      case 'positive': return 'text-[#388e3c]';
      case 'negative': return 'text-[#d32f2f]';
      default: return 'text-[#fbc02d]';
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

  const Card = ({ children }: { children: React.ReactNode }) => (
    <div className="bg-[#1e1e1e]/70 p-4 rounded-xl border border-[#424242]/80">{children}</div>
  );


  return (
    <div className="glassmorphic p-6 rounded-2xl">
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-2xl font-bold text-[#fbc02d]">{provider} Image Analysis</h2>
        <button
          onClick={handleExport}
          className="px-4 py-2 bg-[#d32f2f] text-white text-sm font-semibold rounded-lg hover:bg-[#f75060] transition-colors focus:outline-none focus:ring-2 focus:ring-[#f75060] focus:ring-offset-2 focus:ring-offset-[#121212]"
        >
          Export JSON
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <img src={imageUrl} alt="Analyzed" className="rounded-lg object-cover w-full h-full" />
        </div>
        <div className="md:col-span-2 space-y-4">
          <Card>
            <h3 className="font-semibold text-lg mb-2 text-[#fafafa]">Description</h3>
            <p className="text-[#bdbdbd]">{analysis.description}</p>
          </Card>
          <Card>
            <h3 className="font-semibold text-lg mb-2 text-[#fafafa]">Detected Objects</h3>
            <div className="flex flex-wrap gap-2">
              {analysis.objects.map((obj, i) => (
                <span key={i} className="bg-[#7b1fa2]/30 text-[#ce93d8] text-sm font-medium px-2.5 py-0.5 rounded-full capitalize">{obj}</span>
              ))}
            </div>
          </Card>
          <Card>
            <h3 className="font-semibold text-lg mb-2 text-[#fafafa]">Sentiment</h3>
            <p className={`capitalize font-bold ${getSentimentColor(analysis.sentiment)}`}>
              {analysis.sentiment}
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ImageAnalysisResultDisplay;