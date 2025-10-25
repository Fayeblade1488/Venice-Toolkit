
import React from 'react';

interface SpinnerProps {
  message: string;
}

const Spinner: React.FC<SpinnerProps> = ({ message }) => {
  return (
    <div className="text-center py-10 flex flex-col items-center justify-center">
      <div className="relative h-12 w-12">
        <div className="absolute top-0 left-0 h-full w-full border-4 border-[#424242] rounded-full"></div>
        <div className="absolute top-0 left-0 h-full w-full border-t-4 border-[#f75060] rounded-full animate-spin"></div>
      </div>
      <p className="text-lg font-medium text-[#bdbdbd] mt-4">{message}</p>
    </div>
  );
};

export default Spinner;