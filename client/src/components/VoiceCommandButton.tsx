/**
 * TraceCore AI — Voice Command Button
 * Microphone button for voice command input.
 * Optimized for mobile Chrome.
 */

import React, { useRef, useEffect } from 'react';
import { Mic, Loader2 } from 'lucide-react';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { useAICommand } from '@/contexts/AICommandContext';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface VoiceCommandButtonProps {
  onTranscript: (text: string) => void;
  className?: string;
}

export function VoiceCommandButton({ onTranscript, className }: VoiceCommandButtonProps) {
  const { isSupported, isListening, transcript, error, startListening, stopListening, resetTranscript, getTranscript } =
    useSpeechRecognition();
  const { setIsListening } = useAICommand();
  const callbackRef = useRef(onTranscript);

  // Keep callback ref updated
  useEffect(() => {
    callbackRef.current = onTranscript;
  }, [onTranscript]);

  // Monitor when listening stops and send transcript
  useEffect(() => {
    if (!isListening && transcript) {
      console.log('[VoiceButton] Listening stopped, checking transcript');
      // Small delay to ensure speech recognition has fully processed
      const timer = setTimeout(() => {
        const finalTranscript = getTranscript();
        console.log('[VoiceButton] Final transcript:', finalTranscript);
        
        if (finalTranscript && finalTranscript.trim()) {
          console.log('[VoiceButton] Sending transcript to callback:', finalTranscript);
          callbackRef.current(finalTranscript);
        }
        
        resetTranscript();
      }, 200);

      return () => clearTimeout(timer);
    }
  }, [isListening, transcript, getTranscript, resetTranscript]);

  const handleClick = () => {
    if (isListening) {
      console.log('[VoiceButton] Stop clicked');
      stopListening();
      setIsListening(false);
    } else {
      console.log('[VoiceButton] Start clicked');
      startListening();
      setIsListening(true);
    }
  };

  if (!isSupported) {
    return null;
  }

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <Button
        onClick={handleClick}
        variant={isListening ? 'destructive' : 'outline'}
        size="sm"
        className="relative"
        title={isListening ? 'Stop listening' : 'Start voice command'}
      >
        {isListening ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
            Listening...
          </>
        ) : (
          <>
            <Mic className="w-4 h-4 mr-2" />
            Voice
          </>
        )}
      </Button>

      {isListening && transcript && (
        <div className="text-xs text-muted-foreground max-w-xs truncate">
          {transcript}
        </div>
      )}

      {error && (
        <div className="text-xs text-red-400">
          {error}
        </div>
      )}
    </div>
  );
}
