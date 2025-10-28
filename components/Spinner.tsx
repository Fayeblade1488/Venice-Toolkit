
import React from 'react';

interface SpinnerProps {
  message: string;
}

const Spinner: React.FC<SpinnerProps> = ({ message }) => {
  return (
    <div className="text-center py-12 flex flex-col items-center justify-center gap-6">
      <div className="relative">
        {/* Outer ring - Static */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 border-2 border-[rgba(139,92,246,0.2)] rounded-full"></div>
        
        {/* Middle ring - Slow spin */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 border-2 border-transparent border-t-[#8b5cf6] border-r-[#8b5cf6]/50 rounded-full animate-spin" style={{ animationDuration: '3s' }}></div>
        
        {/* Inner ring - Fast spin (opposite) */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-12 h-12 border-2 border-transparent border-b-[#6d28d9] border-l-[#6d28d9]/50 rounded-full animate-spin" style={{ animationDuration: '1.5s', animationDirection: 'reverse' }}></div>
        
        {/* Dot in center */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-gradient-to-r from-[#8b5cf6] to-[#6d28d9] rounded-full"></div>
      </div>
      
      <div className="space-y-2">
        <p className="text-lg font-600 text-[#fffbfe]">{message}</p>
        <p className="text-xs text-[#cac7d0]">Processing...</p>
      </div>
    </div>
  );
};

export default Spinner;