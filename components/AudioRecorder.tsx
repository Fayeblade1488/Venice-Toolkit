
import React, { useState, useRef } from 'react';

interface AudioRecorderProps {
  onRecordingComplete: (audioBlob: Blob) => void;
  disabled: boolean;
}

const AudioRecorder: React.FC<AudioRecorderProps> = ({ onRecordingComplete, disabled }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    setError(null);
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorderRef.current = new MediaRecorder(stream);
        mediaRecorderRef.current.ondataavailable = (event) => {
          audioChunksRef.current.push(event.data);
        };
        mediaRecorderRef.current.onstop = () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          onRecordingComplete(audioBlob);
          audioChunksRef.current = [];
          // Stop all tracks to release the microphone
          stream.getTracks().forEach(track => track.stop());
        };
        mediaRecorderRef.current.start();
        setIsRecording(true);
      } catch (err) {
        console.error("Error accessing microphone:", err);
        setError("Could not access microphone. Please ensure permission is granted.");
      }
    } else {
      setError("Audio recording is not supported by your browser.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleButtonClick = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-4 bg-black/20 rounded-lg border border-[#424242]">
      <button
        onClick={handleButtonClick}
        disabled={disabled}
        className={`px-6 py-3 rounded-full text-white font-semibold transition-all duration-300 flex items-center space-x-2 ${
          isRecording 
            ? 'bg-[#d32f2f] hover:bg-[#f75060]' 
            : 'bg-[#1976d2] hover:bg-[#42a5f5]'
        } disabled:bg-[#424242] disabled:cursor-not-allowed`}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isRecording ? "M21 12V3H3v9m18 4a9 9 0 11-18 0 9 9 0 0118 0z" : "M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"} />
        </svg>
        <span>{isRecording ? 'Stop Recording' : 'Start Recording'}</span>
      </button>
      {isRecording && <p className="text-sm text-[#bdbdbd] mt-3 animate-pulse">Recording in progress...</p>}
      {error && <p className="text-[#d32f2f] text-sm mt-3">{error}</p>}
    </div>
  );
};

export default AudioRecorder;