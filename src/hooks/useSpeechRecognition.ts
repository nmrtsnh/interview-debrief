"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";

function getSpeechRecognitionCtor() {
  if (typeof window === "undefined") return undefined;
  return window.SpeechRecognition ?? window.webkitSpeechRecognition;
}

function subscribeToSpeechSupport() {
  return () => {};
}

function getSpeechSupportSnapshot() {
  return Boolean(getSpeechRecognitionCtor());
}

function getSpeechSupportServerSnapshot() {
  return false;
}

export interface UseSpeechRecognitionOptions {
  onTranscript: (text: string, isFinal: boolean) => void;
}

export function useSpeechRecognition({
  onTranscript,
}: UseSpeechRecognitionOptions) {
  const isSupported = useSyncExternalStore(
    subscribeToSpeechSupport,
    getSpeechSupportSnapshot,
    getSpeechSupportServerSnapshot,
  );
  const [isListening, setIsListening] = useState(false);
  const [runtimeError, setRuntimeError] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const onTranscriptRef = useRef(onTranscript);

  const errorMessage = !isSupported
    ? "Voice input is not supported in this browser. You can type or paste your debrief below."
    : runtimeError;

  useEffect(() => {
    onTranscriptRef.current = onTranscript;
  }, [onTranscript]);

  useEffect(() => {
    const SpeechRecognitionCtor = getSpeechRecognitionCtor();
    if (!SpeechRecognitionCtor) return;

    const recognition = new SpeechRecognitionCtor();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interim = "";
      let finalText = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const text = result[0]?.transcript ?? "";
        if (result.isFinal) {
          finalText += text;
        } else {
          interim += text;
        }
      }

      if (finalText) {
        onTranscriptRef.current(finalText, true);
      } else if (interim) {
        onTranscriptRef.current(interim, false);
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      if (event.error === "aborted" || event.error === "no-speech") return;
      setIsListening(false);
      if (event.error === "not-allowed") {
        setRuntimeError(
          "Microphone access was denied. You can still type your debrief below.",
        );
      } else {
        setRuntimeError(
          "Voice input is temporarily unavailable. You can still type your debrief below.",
        );
      }
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.abort();
    };
  }, []);

  const startListening = useCallback(() => {
    const recognition = recognitionRef.current;
    if (!recognition) return;

    setRuntimeError(null);
    try {
      recognition.start();
      setIsListening(true);
    } catch {
      setRuntimeError(
        "Could not start voice input. You can still type your debrief below.",
      );
    }
  }, []);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    setIsListening(false);
  }, []);

  return {
    isListening,
    isSupported,
    errorMessage,
    startListening,
    stopListening,
  };
}
