
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
    <div className="glass p-6 rounded-[var(--md-shape-radius-xl)]">
      <div className="flex items-center gap-3 mb-6">
        <span className="text-3xl">🌐</span>
        <h2 className="text-2xl font-bold text-[#fffbfe]">Scraped Data</h2>
        <span className="ml-auto text-sm font-medium text-[#cac7d0]">{data.titles.length} items found</span>
      </div>

      <div className="space-y-5">
        {/* Titles */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xl">📋</span>
            <h3 className="font-semibold text-lg text-[#fffbfe]">Titles</h3>
            <span className="text-xs bg-[rgba(139,92,246,0.2)] px-2 py-1 rounded-full text-[#fffbfe]">{data.titles.length}</span>
          </div>
          <div className="bg-[rgba(0,0,0,0.2)] p-4 rounded-[var(--md-shape-radius-lg)] max-h-40 overflow-y-auto space-y-1">
            {data.titles.slice(0, 10).map((title, i) => (
              <p key={i} className="text-sm text-[#cac7d0]">• {title}</p>
            ))}
            {data.titles.length > 10 && <p className="text-xs text-[#cac7d0]/50">+ {data.titles.length - 10} more titles</p>}
          </div>
        </div>

        {/* Links */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xl">🔗</span>
            <h3 className="font-semibold text-lg text-[#fffbfe]">Links</h3>
            <span className="text-xs bg-[rgba(139,92,246,0.2)] px-2 py-1 rounded-full text-[#fffbfe]">{data.links.length}</span>
          </div>
          <div className="bg-[rgba(0,0,0,0.2)] p-4 rounded-[var(--md-shape-radius-lg)] max-h-40 overflow-y-auto space-y-1">
            {data.links.slice(0, 10).map((link, i) => (
              <p key={i} className="truncate">
                <a 
                  href={link} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-sm text-[#8b5cf6] hover:text-[#a78bfa] smooth-transition"
                >
                  {link.length > 60 ? link.substring(0, 60) + '...' : link}
                </a>
              </p>
            ))}
            {data.links.length > 10 && <p className="text-xs text-[#cac7d0]/50">+ {data.links.length - 10} more links</p>}
          </div>
        </div>

        {/* Text Snippet */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xl">📄</span>
            <h3 className="font-semibold text-lg text-[#fffbfe]">Text Snippet</h3>
            <span className="text-xs text-[#cac7d0]">{Math.round(data.text.length / 100) * 100} chars</span>
          </div>
          <div className="bg-[rgba(0,0,0,0.2)] p-4 rounded-[var(--md-shape-radius-lg)] max-h-48 overflow-y-auto border border-[rgba(255,255,255,0.05)]">
            <p className="text-[#cac7d0] text-sm leading-relaxed">
              {data.text.substring(0, 1000) || "No text content found."}
              {data.text.length > 1000 && '...'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScrapedDataDisplay;