import { useState, useEffect, useCallback, useRef } from 'react';
import { useApp } from '@/contexts/AppContext';

// Web Speech API types
interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  onstart: ((this: SpeechRecognition, ev: Event) => void) | null;
  onend: ((this: SpeechRecognition, ev: Event) => void) | null;
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => void) | null;
  onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => void) | null;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

export type VoiceCommand = 
  | 'capture' 
  | 'add' 
  | 'details' 
  | 'cart' 
  | 'help' 
  | 'start' 
  | 'stop'
  | 'undo';

interface UseVoiceCommandsOptions {
  onCommand?: (command: VoiceCommand) => void;
  onCapture?: () => void;
  onAdd?: () => void;
  onDetails?: () => void;
  onCart?: () => void;
  onHelp?: () => void;
  onStart?: () => void;
  onStop?: () => void;
  onUndo?: () => void;
}

export function useVoiceCommands(options: UseVoiceCommandsOptions = {}) {
  const { speak, announce } = useApp();
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [lastCommand, setLastCommand] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  // Check for browser support
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    setIsSupported(!!SpeechRecognition);
  }, []);

  // Process recognized speech
  const processCommand = useCallback((transcript: string) => {
    const lowerTranscript = transcript.toLowerCase().trim();
    console.log('Voice command received:', lowerTranscript);
    
    // Command matching with variations
    const commands: { patterns: string[]; command: VoiceCommand; handler?: () => void }[] = [
      { patterns: ['capture', 'take photo', 'snap', 'photograph', 'picture'], command: 'capture', handler: options.onCapture },
      { patterns: ['add', 'add to cart', 'add item', 'buy'], command: 'add', handler: options.onAdd },
      { patterns: ['details', 'more info', 'information', 'tell me more', 'what is this'], command: 'details', handler: options.onDetails },
      { patterns: ['cart', 'go to cart', 'view cart', 'shopping cart', 'my cart'], command: 'cart', handler: options.onCart },
      { patterns: ['help', 'assist', 'assistance', 'tutorial'], command: 'help', handler: options.onHelp },
      { patterns: ['start', 'start camera', 'open camera', 'begin'], command: 'start', handler: options.onStart },
      { patterns: ['stop', 'stop camera', 'close camera', 'end'], command: 'stop', handler: options.onStop },
      { patterns: ['undo', 'cancel', 'remove last', 'go back'], command: 'undo', handler: options.onUndo },
    ];

    for (const { patterns, command, handler } of commands) {
      if (patterns.some(pattern => lowerTranscript.includes(pattern))) {
        setLastCommand(command);
        announce(`Command recognized: ${command}`);
        
        if (handler) {
          handler();
        }
        
        if (options.onCommand) {
          options.onCommand(command);
        }
        
        return command;
      }
    }

    // No command recognized
    announce('Command not recognized. Try: capture, add, cart, help.');
    return null;
  }, [options, announce]);

  // Start listening
  const startListening = useCallback(() => {
    if (!isSupported) {
      speak('Voice commands are not supported in this browser.');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
      announce('Voice commands activated. Say a command like capture, add, or cart.');
    };

    recognition.onend = () => {
      setIsListening(false);
      // Auto-restart if still supposed to be listening
      if (recognitionRef.current === recognition) {
        try {
          recognition.start();
        } catch (e) {
          console.log('Recognition ended');
        }
      }
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const result = event.results[event.resultIndex];
      if (result.isFinal) {
        const transcript = result[0].transcript;
        processCommand(transcript);
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('Speech recognition error:', event.error);
      if (event.error === 'not-allowed') {
        speak('Microphone permission denied. Please allow microphone access.');
        setIsListening(false);
      } else if (event.error !== 'no-speech' && event.error !== 'aborted') {
        announce(`Voice error: ${event.error}`);
      }
    };

    recognitionRef.current = recognition;
    
    try {
      recognition.start();
    } catch (e) {
      console.error('Failed to start recognition:', e);
    }
  }, [isSupported, speak, announce, processCommand]);

  // Stop listening
  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      const recognition = recognitionRef.current;
      recognitionRef.current = null;
      recognition.stop();
      setIsListening(false);
      announce('Voice commands deactivated.');
    }
  }, [announce]);

  // Toggle listening
  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        recognitionRef.current = null;
      }
    };
  }, []);

  return {
    isListening,
    isSupported,
    lastCommand,
    startListening,
    stopListening,
    toggleListening,
  };
}
