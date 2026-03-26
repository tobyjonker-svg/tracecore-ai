/**
 * TraceCore AI — Voice Command Button
 * Microphone button for voice command input.
 */

import React, { useState } from 'react';
import { Mic, MicOff, Loader2 } from 'lucide-react';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { useAICommand } from '@/contexts/AICommandContext';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface VoiceCommandButtonProps {
  onTranscript: (text: string) => void;
  className?: string;
}

export function VoiceCommandButton({ onTranscript, className }: VoiceCommandButtonProps) {
  const { isSupported, isListening, transcript, error, startListening, stopListening, resetTranscript } =
    useSpeechRecognition();
  const { setIsListening } = useAICommand();

  const handleClick = () => {
    if (isListening) {
      stopListening();
      setIsListening(false);
      if (transcript) {
        onTranscript(transcript);
      }
      resetTranscript();
    } else {
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
