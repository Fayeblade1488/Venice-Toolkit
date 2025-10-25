
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
    <div className="glassmorphic p-6 rounded-2xl">
      <h2 className="text-2xl font-bold mb-4 text-[#fbc02d]">Grounded Search Result</h2>
      <div className="space-y-4">
        <div>
          <h3 className="font-semibold text-lg text-[#fafafa] mb-2">Answer</h3>
          <p className="text-[#fafafa] whitespace-pre-wrap">{result.text}</p>
        </div>
        {result.citations && result.citations.length > 0 && (
          <div>
            <h3 className="font-semibold text-lg text-[#fafafa] mb-2">Sources</h3>
            <ul className="list-decimal list-inside space-y-2">
              {result.citations.map((citation, index) => (
                citation.web && (
                    <li key={index} className="text-[#bdbdbd]">
                        <a 
                            href={citation.web.uri} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-[#1976d2] hover:underline hover:text-[#42a5f5] transition-colors"
                        >
                            {citation.web.title || citation.web.uri}
                        </a>
                    </li>
                )
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchGroundingResultDisplay;