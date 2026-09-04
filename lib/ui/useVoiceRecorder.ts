"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type VoiceState = "idle" | "recording" | "transcribing" | "error";

/** Max recording duration in seconds before auto-stop. */
const MAX_RECORDING_SECONDS = 120;

export interface UseVoiceRecorderOptions {
  onTranscript: (text: string) => void;
  transcribe: (blob: Blob) => Promise<string>;
}

export interface UseVoiceRecorderResult {
  state: VoiceState;
  error: string | null;
  /** Seconds elapsed since recording started (0 when not recording). */
  elapsed: number;
  /** Click to start recording; click again to stop and transcribe. */
  toggleRecording: () => void;
  clearError: () => void;
}

export function useVoiceRecorder({
  onTranscript,
  transcribe,
}: UseVoiceRecorderOptions): UseVoiceRecorderResult {
  const [state, setState] = useState<VoiceState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [elapsed, setElapsed] = useState(0);

  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const autoStopRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (autoStopRef.current) clearTimeout(autoStopRef.current);
    };
  }, []);

  const _clearTimers = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (autoStopRef.current) {
      clearTimeout(autoStopRef.current);
      autoStopRef.current = null;
    }
    setElapsed(0);
  }, []);

  const _stopAndTranscribe = useCallback(async () => {
    _clearTimers();

    const recorder = recorderRef.current;
    if (!recorder || recorder.state === "inactive") return;

    await new Promise<void>((resolve) => {
      recorder.onstop = () => resolve();
      recorder.stop();
      recorder.stream.getTracks().forEach((t) => t.stop());
    });

    const blob = new Blob(chunksRef.current, { type: "audio/webm" });
    chunksRef.current = [];
    recorderRef.current = null;

    if (blob.size < 100) {
      setState("idle");
      return;
    }

    setState("transcribing");
    try {
      const text = await transcribe(blob);
      if (text) onTranscript(text);
      setState("idle");
    } catch {
      setError("Transcription failed. Please try again.");
      setState("error");
    }
  }, [_clearTimers, transcribe, onTranscript]);

  const _startRecording = useCallback(async () => {
    setError(null);
    setElapsed(0);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
      chunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorderRef.current = recorder;
      recorder.start();
      setState("recording");

      // Elapsed seconds ticker
      timerRef.current = setInterval(() => {
        setElapsed((s) => s + 1);
      }, 1000);

      // Auto-stop at MAX_RECORDING_SECONDS
      autoStopRef.current = setTimeout(() => {
        void _stopAndTranscribe();
      }, MAX_RECORDING_SECONDS * 1000);
    } catch {
      setError("Microphone access denied.");
      setState("error");
    }
  }, [_stopAndTranscribe]);

  const toggleRecording = useCallback(() => {
    if (state === "recording") {
      void _stopAndTranscribe();
    } else if (state === "idle" || state === "error") {
      void _startRecording();
    }
    // no-op while transcribing
  }, [state, _startRecording, _stopAndTranscribe]);

  const clearError = useCallback(() => {
    setError(null);
    setState("idle");
  }, []);

  return { state, error, elapsed, toggleRecording, clearError };
}
