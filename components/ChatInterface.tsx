
import React, { useRef, useEffect } from 'react';
import { ChatMessage } from '../types';

interface ChatInterfaceProps {
  history: ChatMessage[];
  onSubmit: (message: string) => void;
  isLoading: boolean;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ history, onSubmit, isLoading }) => {
  const [input, setInput] = React.useState('');
  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [history, isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSubmit(input.trim());
      setInput('');
    }
  };

  const renderMessageContent = (content: string) => {
    if (content.startsWith('```json')) {
      try {
        const jsonString = content.replace(/```json\n|```/g, '');
        const jsonObj = JSON.parse(jsonString);
        return <pre className="bg-black/40 p-3 rounded-[var(--md-shape-radius-lg)] text-[#cac7d0] text-xs max-h-60 overflow-y-auto border border-[rgba(255,255,255,0.1)] font-mono">{JSON.stringify(jsonObj, null, 2)}</pre>;
      } catch (_e) {
        return <p className="text-[#fffbfe] whitespace-pre-wrap">{content}</p>;
      }
    }
    return <p className="text-[#fffbfe] whitespace-pre-wrap text-sm leading-relaxed">{content}</p>;
  };

  return (
    <div className="glass p-6 rounded-[var(--md-shape-radius-xl)]">
      <div className="flex items-center gap-3 mb-4">
        <span className="text-2xl">💬</span>
        <h2 className="text-2xl font-bold text-[#fffbfe]">Refine Analysis</h2>
      </div>

      <div className="h-96 overflow-y-auto pr-2 space-y-3 mb-4">
        {history.map((msg, index) => (
          <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-sm rounded-[var(--md-shape-radius-lg)] p-4 ${
              msg.role === 'user' 
                ? 'bg-gradient-to-br from-[#8b5cf6] to-[#6d28d9] text-white' 
                : 'glass text-[#fffbfe]'
            }`}>
              {renderMessageContent(msg.parts.map(p => p.text).join(''))}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="glass p-4 rounded-[var(--md-shape-radius-lg)]">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-[#8b5cf6] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-[#8b5cf6] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-[#8b5cf6] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a follow-up question..."
          className="flex-1 px-4 py-3 bg-[rgba(255,255,255,0.05)] text-[#fffbfe] placeholder-[#cac7d0] rounded-[var(--md-shape-radius-lg)] border border-[rgba(255,255,255,0.1)] focus:border-[#8b5cf6] focus:ring-2 focus:ring-[#8b5cf6]/30 smooth-transition disabled:opacity-50"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading}
          className="bg-gradient-to-br from-[#8b5cf6] to-[#6d28d9] hover:from-[#a78bfa] hover:to-[#7c3aed] text-white font-semibold py-3 px-6 rounded-[var(--md-shape-radius-lg)] smooth-transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? '⏳' : '➤'}
        </button>
      </form>
    </div>
  );
};

export default ChatInterface;