
import React from 'react';
import { SearchGroundingResult } from '../types';

interface SearchGroundingResultDisplayProps {
  result: SearchGroundingResult;
}

const SearchGroundingResultDisplay: React.FC<SearchGroundingResultDisplayProps> = ({ result }) => {
  if (!result) {
    return null;
  }

  return (
    <div className="glass p-6 rounded-[var(--md-shape-radius-xl)]">
      <div className="flex items-center gap-3 mb-6">
        <span className="text-3xl">🔍</span>
        <h2 className="text-2xl font-bold text-[#fffbfe]">Grounded Search Result</h2>
      </div>

      <div className="space-y-6">
        {/* Answer */}
        <div className="glass p-4 rounded-[var(--md-shape-radius-lg)] border border-[rgba(255,255,255,0.1)]">
          <h3 className="font-semibold text-lg text-[#fffbfe] mb-3 flex items-center gap-2">
            <span className="text-xl">💡</span> Answer
          </h3>
          <p className="text-[#cac7d0] whitespace-pre-wrap leading-relaxed">{result.text}</p>
        </div>

        {/* Citations/Sources */}
        {result.citations && result.citations.length > 0 && (
          <div>
            <h3 className="font-semibold text-lg text-[#fffbfe] mb-3 flex items-center gap-2">
              <span className="text-xl">📚</span> Sources
              <span className="text-xs bg-[rgba(139,92,246,0.2)] px-2 py-1 rounded-full ml-auto">{result.citations.length}</span>
            </h3>
            <div className="space-y-2">
              {result.citations.map((citation, index) => (
                citation.web && (
                  <a 
                    key={index}
                    href={citation.web.uri} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="glass p-3 rounded-[var(--md-shape-radius-lg)] border border-[rgba(255,255,255,0.1)] hover:border-[rgba(139,92,246,0.3)] smooth-transition block group"
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-lg mt-0.5">🔗</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-[#8b5cf6] group-hover:text-[#a78bfa] smooth-transition font-medium">
                          {citation.web.title || 'Untitled Source'}
                        </p>
                        <p className="text-xs text-[#cac7d0] truncate">
                          {citation.web.uri}
                        </p>
                      </div>
                      <span className="text-xs text-[#cac7d0] flex-shrink-0">↗</span>
                    </div>
                  </a>
                )
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchGroundingResultDisplay;