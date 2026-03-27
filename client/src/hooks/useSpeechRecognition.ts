/**
 * TraceCore AI — Speech Recognition Hook
 * Browser-based voice command capture using Web Speech API.
 * Optimized for mobile Chrome compatibility.
 */

import { useEffect, useState, useCallback, useRef } from 'react';

// Extend Window interface for Web Speech API
declare global {
  interface Window {
    SpeechRecognition?: any;
    webkitSpeechRecognition?: any;
  }
}

export interface SpeechRecognitionResult {
  transcript: string;
  isFinal: boolean;
  confidence: number;
}

export interface UseSpeechRecognitionReturn {
  isSupported: boolean;
  isListening: boolean;
  transcript: string;
  error: string | null;
  startListening: () => void;
  stopListening: () => void;
  resetTranscript: () => void;
  getTranscript: () => string;
}

export function useSpeechRecognition(): UseSpeechRecognitionReturn {
  const [isSupported, setIsSupported] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  // Keep refs to track the current state
  const recognitionRef = useRef<any>(null);
  const transcriptRef = useRef<string>('');
  const onResultCallbackRef = useRef<((transcript: string) => void) | null>(null);

  // Check for browser support
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition;
    setIsSupported(!!SpeechRecognition);
  }, []);

  const startListening = useCallback(() => {
    if (!isSupported) {
      setError('Speech Recognition not supported in this browser');
      return;
    }

    try {
      const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      transcriptRef.current = '';

      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        console.log('[Speech] Recognition started');
        setIsListening(true);
        setError(null);
        setTranscript('');
        transcriptRef.current = '';
      };

      recognition.onresult = (event: any) => {
        console.log('[Speech] onresult fired, results length:', event.results.length);
        
        let interimTranscript = '';
        
        // Process all results
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          console.log('[Speech] Result', i, ':', transcript, 'isFinal:', event.results[i].isFinal);
          
          if (event.results[i].isFinal) {
            // This is a final result - store it
            transcriptRef.current += transcript + ' ';
            console.log('[Speech] Final result stored, total:', transcriptRef.current);
          } else {
            // This is interim
            interimTranscript += transcript;
          }
        }
        
        // Update display
        const displayText = (transcriptRef.current + interimTranscript).trim();
        setTranscript(displayText);
        console.log('[Speech] Display text:', displayText);
      };

      recognition.onerror = (event: any) => {
        console.log('[Speech] Error event:', event.error);
        setError(`Speech recognition error: ${event.error}`);
        setIsListening(false);
      };

      recognition.onend = () => {
        console.log('[Speech] onend fired, final transcript:', transcriptRef.current);
        setIsListening(false);
        
        // Call the callback if one was registered
        if (onResultCallbackRef.current && transcriptRef.current.trim()) {
          console.log('[Speech] Calling onResultCallback with:', transcriptRef.current);
          onResultCallbackRef.current(transcriptRef.current.trim());
          onResultCallbackRef.current = null;
        }
      };

      recognition.start();
    } catch (err) {
      console.error('[Speech] Error starting recognition:', err);
      setError('Failed to start speech recognition');
      setIsListening(false);
    }
  }, [isSupported]);

  const stopListening = useCallback(() => {
    console.log('[Speech] stopListening called');
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
        // Don't abort - let it finish naturally
      } catch (err) {
        console.error('[Speech] Error stopping recognition:', err);
      }
    }
  }, []);

  const resetTranscript = useCallback(() => {
    console.log('[Speech] resetTranscript called');
    setTranscript('');
    transcriptRef.current = '';
    setError(null);
  }, []);

  const getTranscript = useCallback(() => {
    const result = transcriptRef.current.trim();
    console.log('[Speech] getTranscript returning:', result);
    return result;
  }, []);

  // Expose a way to set the result callback
  const setResultCallback = useCallback((callback: (transcript: string) => void) => {
    console.log('[Speech] setResultCallback registered');
    onResultCallbackRef.current = callback;
  }, []);

  return {
    isSupported,
    isListening,
    transcript,
    error,
    startListening,
    stopListening,
    resetTranscript,
    getTranscript,
  };
}
