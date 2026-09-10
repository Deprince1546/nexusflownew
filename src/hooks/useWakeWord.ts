import { useCallback, useEffect, useRef, useState } from "react";

type Recognition = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  onresult: ((event: { resultIndex: number; results: ArrayLike<ArrayLike<{ transcript: string }> & { isFinal: boolean }> }) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
};

const WAKE_WORD = "nexusflow";

function normalize(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9 ]/g, "").replace(/nexus flow/g, "nexusflow");
}

/**
 * Continuously listens for the wake word "NexusFlow" and captures the instruction
 * that follows it. Ignores everything else the microphone hears.
 */
export function useWakeWord(options: {
  enabled: boolean;
  onWake: () => void;
  onCommand: (text: string) => void;
}) {
  const { enabled, onWake, onCommand } = options;
  const [supported, setSupported] = useState(true);
  const [listening, setListening] = useState(false);
  const [awake, setAwake] = useState(false);
  const [heard, setHeard] = useState("");

  const recognitionRef = useRef<Recognition | null>(null);
  const awakeRef = useRef(false);
  const bufferRef = useRef("");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const callbacks = useRef({ onWake, onCommand });
  callbacks.current = { onWake, onCommand };

  const finish = useCallback(() => {
    const command = bufferRef.current.trim();
    bufferRef.current = "";
    awakeRef.current = false;
    setAwake(false);
    setHeard("");
    if (command) callbacks.current.onCommand(command);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const Ctor =
      (window as unknown as { SpeechRecognition?: new () => Recognition; webkitSpeechRecognition?: new () => Recognition })
        .SpeechRecognition ??
      (window as unknown as { webkitSpeechRecognition?: new () => Recognition }).webkitSpeechRecognition;

    if (!Ctor) {
      setSupported(false);
      return;
    }
    if (!enabled) return;

    let stopped = false;
    const recognition = new Ctor();
    recognitionRef.current = recognition;
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event) => {
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const transcript = normalize(result[0]?.transcript ?? "");
        if (!transcript) continue;

        if (!awakeRef.current) {
          const index = transcript.indexOf(WAKE_WORD);
          if (index === -1) continue;
          awakeRef.current = true;
          setAwake(true);
          callbacks.current.onWake();
          bufferRef.current = transcript.slice(index + WAKE_WORD.length).trim();
        } else if (result.isFinal) {
          bufferRef.current = `${bufferRef.current} ${transcript}`.trim();
        }

        setHeard(bufferRef.current);
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(finish, 2200);
      }
    };

    recognition.onerror = (event) => {
      if (event.error === "not-allowed" || event.error === "service-not-allowed") {
        setSupported(false);
        stopped = true;
      }
    };

    recognition.onend = () => {
      setListening(false);
      if (!stopped) {
        try {
          recognition.start();
          setListening(true);
        } catch {
          /* restart race — ignored */
        }
      }
    };

    try {
      recognition.start();
      setListening(true);
    } catch {
      /* already started */
    }

    return () => {
      stopped = true;
      if (timerRef.current) clearTimeout(timerRef.current);
      recognition.onend = null;
      recognition.onresult = null;
      try {
        recognition.stop();
      } catch {
        /* ignore */
      }
      recognitionRef.current = null;
      setListening(false);
    };
  }, [enabled, finish]);

  return { supported, listening, awake, heard };
}
