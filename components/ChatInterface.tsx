
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
    // Basic JSON detection for pretty printing
    if (content.startsWith('```json')) {
      try {
        const jsonString = content.replace(/```json\n|```/g, '');
        const jsonObj = JSON.parse(jsonString);
        return <pre className="bg-black/20 p-3 rounded-lg text-[#bdbdbd] text-sm max-h-60 overflow-y-auto border border-[#424242]">{JSON.stringify(jsonObj, null, 2)}</pre>;
      } catch (e) {
        // Fallback for invalid JSON
        return <p className="text-[#fafafa] whitespace-pre-wrap">{content}</p>;
      }
    }
    return <p className="text-[#fafafa] whitespace-pre-wrap">{content}</p>;
  };

  return (
    <div className="glassmorphic p-6 rounded-2xl">
      <h2 className="text-2xl font-bold mb-4 text-[#fbc02d]">Refine Analysis</h2>
      <div className="h-80 overflow-y-auto pr-4 space-y-4 mb-4">
        {history.map((msg, index) => (
          <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`p-3 rounded-lg max-w-lg ${msg.role === 'user' ? 'bg-[#1976d2] text-white' : 'bg-[#424242] text-[#fafafa]'}`}>
              {renderMessageContent(msg.parts.map(p => p.text).join(''))}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="p-3 rounded-lg max-w-lg bg-[#424242]">
                <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-[#f75060] rounded-full animate-pulse delay-75"></div>
                    <div className="w-2 h-2 bg-[#f75060] rounded-full animate-pulse delay-150"></div>
                    <div className="w-2 h-2 bg-[#f75060] rounded-full animate-pulse delay-300"></div>
                </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSubmit}>
        <div className="flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a follow-up question to refine the results..."
            className="w-full p-3 bg-[#1e1e1e]/70 text-[#fafafa] rounded-l-lg border border-[#424242] focus:ring-2 focus:ring-[#f75060] focus:border-[#f75060] transition duration-200 placeholder-[#616161] disabled:opacity-50"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading}
            className="bg-[#d32f2f] hover:bg-[#f75060] text-white font-bold py-3 px-6 rounded-r-lg transition-colors disabled:bg-[#424242]"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatInterface;