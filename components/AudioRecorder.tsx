
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
    <div className="flex flex-col items-center justify-center p-6 glass rounded-[var(--md-shape-radius-lg)] border border-[rgba(255,255,255,0.1)]">
      <button
        onClick={handleButtonClick}
        disabled={disabled}
        className={`px-6 py-3 rounded-[var(--md-shape-radius-lg)] text-white font-semibold smooth-transition flex items-center gap-3 ${
          isRecording 
            ? 'bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700' 
            : 'bg-gradient-to-br from-[#8b5cf6] to-[#6d28d9] hover:from-[#a78bfa] hover:to-[#7c3aed]'
        } disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        <span className="text-xl">{isRecording ? '⏹️' : '🎤'}</span>
        <span>{isRecording ? 'Stop Recording' : 'Start Recording'}</span>
      </button>
      {isRecording && (
        <div className="mt-4 flex items-center gap-2">
          <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
          <p className="text-sm text-[#fffbfe]">Recording in progress...</p>
        </div>
      )}
      {error && (
        <div className="mt-4 text-sm text-red-400 text-center">
          <p>⚠️ {error}</p>
        </div>
      )}
    </div>
  );
};

export default AudioRecorder;