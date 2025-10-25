
import React from 'react';
import { ScrapedData } from '../types';

interface ScrapedDataDisplayProps {
  data: ScrapedData;
}

const ScrapedDataDisplay: React.FC<ScrapedDataDisplayProps> = ({ data }) => {
  if (!data || data.titles.length === 0) {
    return null;
  }

  return (
    <div className="glassmorphic p-6 rounded-2xl">
      <h2 className="text-2xl font-bold mb-4 text-[#fbc02d]">Scraped Data</h2>
      <div className="space-y-5">
        <div>
          <h3 className="font-semibold text-lg text-[#fafafa] mb-2">Titles Found</h3>
          <ul className="list-disc list-inside space-y-1 text-[#bdbdbd] max-h-40 overflow-y-auto pr-2">
            {data.titles.slice(0, 10).map((title, i) => <li key={i}>{title}</li>)}
             {data.titles.length > 10 && <li className="text-[#616161]">... and {data.titles.length - 10} more</li>}
          </ul>
        </div>
        <div>
          <h3 className="font-semibold text-lg text-[#fafafa] mb-2">Links Found (Top 10)</h3>
          <ul className="list-disc list-inside space-y-1 text-[#bdbdbd] max-h-40 overflow-y-auto pr-2">
            {data.links.slice(0, 10).map((link, i) => (
              <li key={i} className="truncate">
                <a href={link} target="_blank" rel="noopener noreferrer" className="text-[#1976d2] hover:underline hover:text-[#42a5f5] transition-colors">
                  {link}
                </a>
              </li>
            ))}
             {data.links.length > 10 && <li className="text-[#616161]">... and {data.links.length - 10} more</li>}
          </ul>
        </div>
        <div>
          <h3 className="font-semibold text-lg text-[#fafafa] mb-2">Text Snippet</h3>
          <p className="bg-[#1e1e1e]/70 p-3 rounded-lg text-[#bdbdbd] text-sm max-h-48 overflow-y-auto border border-[#424242]">
            {data.text.substring(0, 1000) || "No text content found."}
            {data.text.length > 1000 && '...'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ScrapedDataDisplay;