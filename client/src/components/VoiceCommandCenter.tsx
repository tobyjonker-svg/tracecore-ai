/**
 * VoiceCommandCenter
 * Handles voice input, command recognition, and execution
 * Uses Web Speech API for browser-based speech recognition
 */

import { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { parseCommand, executeCommand } from '@/lib/aiCommands';
import { cn } from '@/lib/utils';

interface VoiceCommandCenterProps {
  isOpen: boolean;
  onClose: () => void;
  customCommands?: any[];
}

export function VoiceCommandCenter({ isOpen, onClose, customCommands = [] }: VoiceCommandCenterProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { state, dispatch } = useApp() as any;
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [lastResult, setLastResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);
  const [isBrowserSupported, setIsBrowserSupported] = useState(true);

  // Initialize Web Speech API
  useEffect(() => {
    if (!isOpen) return;

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      setIsBrowserSupported(false);
      setError('Speech Recognition not supported in your browser');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
      setTranscript('');
      setError(null);
    };

    recognition.onresult = (event: any) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;

        if (event.results[i].isFinal) {
          finalTranscript += transcript + ' ';
        } else {
          interimTranscript += transcript;
        }
      }

      setTranscript(finalTranscript || interimTranscript);

      // Process final transcript
      if (finalTranscript) {
        processVoiceCommand(finalTranscript.trim());
      }
    };

    recognition.onerror = (event: any) => {
      setError(`Error: ${event.error}`);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [isOpen]);

  const processVoiceCommand = (input: string) => {
    try {
      // Parse the voice input
      const parsed = parseCommand(input);

      if (parsed.type === 'UNKNOWN') {
        setError(`Command not recognized: "${input}"`);
        setLastResult(null);
        return;
      }

      // Execute the command
      const result = executeCommand(parsed, state);

      if (result.success && result.action) {
        // Dispatch the action to update app state
        dispatch(result.action as any);
        setLastResult({
          success: true,
          message: result.message,
          command: input,
        });
        setError(null);

        // Speak the result
        speakResult(result.message);
      } else {
        setError(result.message);
        setLastResult(null);
        speakResult(result.message);
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error processing command';
      setError(errorMsg);
      setLastResult(null);
    }
  };

  const speakResult = (message: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(message);
      utterance.rate = 1;
      utterance.pitch = 1;
      window.speechSynthesis.speak(utterance);
    }
  };

  const startListening = () => {
    if (recognitionRef.current && isBrowserSupported) {
      recognitionRef.current.start();
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.abort();
      setIsListening(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-lg bg-card p-6 shadow-lg">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-card-foreground">Voice Command</h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
          >
            ✕
          </button>
        </div>

        {/* Browser Support Check */}
        {!isBrowserSupported && (
          <div className="mb-4 rounded-lg bg-destructive/10 p-4 text-destructive">
            <div className="flex items-start gap-3">
              <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0" />
              <div>
                <p className="font-medium">Speech Recognition Not Supported</p>
                <p className="text-sm">Please use Chrome, Edge, or Safari browser</p>
              </div>
            </div>
          </div>
        )}

        {/* Voice Input Section */}
        <div className="mb-6 rounded-lg bg-muted p-6 text-center">
          <div className="mb-4 flex justify-center">
            <button
              onClick={isListening ? stopListening : startListening}
              disabled={!isBrowserSupported}
              className={cn(
                'rounded-full p-4 transition-all',
                isListening
                  ? 'bg-red-500 hover:bg-red-600'
                  : 'bg-blue-500 hover:bg-blue-600',
                !isBrowserSupported && 'cursor-not-allowed opacity-50'
              )}
            >
              {isListening ? (
                <MicOff className="h-8 w-8 text-white" />
              ) : (
                <Mic className="h-8 w-8 text-white" />
              )}
            </button>
          </div>

          {/* Transcript Display */}
          <div className="min-h-12 rounded bg-background p-3 text-left">
            {isListening && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Listening...</span>
              </div>
            )}
            {transcript && (
              <p className="text-sm text-foreground">{transcript}</p>
            )}
            {!isListening && !transcript && (
              <p className="text-sm text-muted-foreground">
                {isBrowserSupported ? 'Click the microphone to start speaking' : 'Browser not supported'}
              </p>
            )}
          </div>

          <p className="mt-2 text-xs text-muted-foreground">
            {isListening ? 'Speak your command...' : 'Ready to listen'}
          </p>
        </div>

        {/* Result Display */}
        {lastResult && (
          <div className="mb-4 rounded-lg bg-green-500/10 p-4 text-green-600">
            <div className="flex items-start gap-3">
              <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0" />
              <div>
                <p className="font-medium">Command Executed</p>
                <p className="text-sm">{lastResult.message}</p>
                <p className="mt-1 text-xs text-green-600/70">"{lastResult.command}"</p>
              </div>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="mb-4 rounded-lg bg-destructive/10 p-4 text-destructive">
            <div className="flex items-start gap-3">
              <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0" />
              <div>
                <p className="font-medium">Error</p>
                <p className="text-sm">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Help Section */}
        <div className="border-t border-border pt-4">
          <p className="mb-2 text-xs font-medium text-muted-foreground">Example Commands:</p>
          <ul className="space-y-1 text-xs text-muted-foreground">
            <li>• "Create product lion's mane"</li>
            <li>• "Add 20 stock to lion's mane"</li>
            <li>• "Create supplier glass bottles"</li>
            <li>• "Log production run of 30 cordyceps"</li>
            <li>• "Create order for john with 5 lion's mane"</li>
          </ul>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="mt-6 w-full rounded-lg bg-muted px-4 py-2 text-sm font-medium text-foreground hover:bg-muted/80"
        >
          Close
        </button>
      </div>
    </div>
  );
}
