import { useEffect, useRef, useState } from "react";
import { Pause, Play, RotateCcw, Volume2 } from "lucide-react";

type Props = { title: string; description: string; sections: Array<{ heading: string; body: string[] }> };
type PlayerState = "loading" | "playing" | "paused" | "finished" | "unsupported";
const femaleVoiceNames = ["Microsoft Aria Online", "Microsoft Jenny Online", "Microsoft Sonia Online", "Google UK English Female", "Google US English", "Samantha", "Ava", "Karen", "Zira", "Moira", "Tessa"];

function chooseVoice(voices: SpeechSynthesisVoice[]) {
  const english = voices.filter((voice) => voice.lang.toLowerCase().startsWith("en"));
  const candidates = english.length ? english : voices;
  return femaleVoiceNames.map((name) => candidates.find((voice) => voice.name.includes(name))).find(Boolean) ?? candidates[0];
}

export function ArticleNarrator({ title, description, sections }: Props) {
  const segments = [title, description, ...sections.flatMap((section) => [section.heading, ...section.body])];
  const segmentsRef = useRef(segments);
  const indexRef = useRef(0);
  const voiceRef = useRef<SpeechSynthesisVoice | undefined>(undefined);
  const mountedRef = useRef(false);
  const [state, setState] = useState<PlayerState>("loading");
  const [progress, setProgress] = useState(0);

  useEffect(() => { segmentsRef.current = segments; }, [title, description, sections]);

  const speakFrom = (startIndex: number) => {
    if (!("speechSynthesis" in window)) { setState("unsupported"); return; }
    const synth = window.speechSynthesis;
    synth.cancel();
    indexRef.current = startIndex;
    const speakNext = () => {
      if (!mountedRef.current || indexRef.current >= segmentsRef.current.length) {
        if (mountedRef.current) { setProgress(100); setState("finished"); }
        return;
      }
      const utterance = new SpeechSynthesisUtterance(segmentsRef.current[indexRef.current]);
      utterance.voice = voiceRef.current ?? null;
      utterance.lang = voiceRef.current?.lang ?? "en-US";
      utterance.rate = 0.92;
      utterance.pitch = 1.02;
      utterance.onend = () => {
        indexRef.current += 1;
        setProgress(Math.round((indexRef.current / segmentsRef.current.length) * 100));
        speakNext();
      };
      utterance.onerror = (event) => {
        if (event.error !== "canceled" && event.error !== "interrupted") setState("paused");
      };
      synth.speak(utterance);
      setState("playing");
    };
    speakNext();
  };

  useEffect(() => {
    mountedRef.current = true;
    if (!("speechSynthesis" in window)) { setState("unsupported"); return () => { mountedRef.current = false; }; }
    const synth = window.speechSynthesis;
    let started = false;
    const start = () => {
      if (started || !mountedRef.current) return;
      const voices = synth.getVoices();
      if (!voices.length) return;
      started = true;
      voiceRef.current = chooseVoice(voices);
      speakFrom(0);
    };
    start();
    synth.addEventListener("voiceschanged", start);
    const timer = window.setTimeout(() => { if (!started && mountedRef.current) { started = true; speakFrom(0); } }, 1200);
    return () => { mountedRef.current = false; clearTimeout(timer); synth.removeEventListener("voiceschanged", start); synth.cancel(); };
  }, []);

  const toggle = () => {
    const synth = window.speechSynthesis;
    if (state === "playing") { synth.pause(); setState("paused"); }
    else if (state === "paused" && synth.paused) { synth.resume(); setState("playing"); }
    else speakFrom(state === "finished" ? 0 : indexRef.current);
  };

  const status = { loading: "Preparing your audio…", playing: "Now reading this article", paused: "Audio paused", finished: "Finished reading", unsupported: "Audio is not supported in this browser" }[state];
  return (
    <aside className="article-narrator" aria-label="Listen to this article">
      <div className="narrator-icon" aria-hidden="true"><Volume2 size={22} /></div>
      <div className="narrator-copy"><strong>Listen instead</strong><span aria-live="polite">{status}</span><div className="narrator-progress" aria-hidden="true"><span style={{ width: `${progress}%` }} /></div></div>
      <div className="narrator-actions">
        <button type="button" className="narrator-button narrator-button-primary" onClick={toggle} disabled={state === "loading" || state === "unsupported"} aria-label={state === "playing" ? "Pause article" : "Play article"}>{state === "playing" ? <Pause size={19} /> : <Play size={19} />}<span>{state === "playing" ? "Pause" : "Play"}</span></button>
        <button type="button" className="narrator-button" onClick={() => speakFrom(0)} disabled={state === "loading" || state === "unsupported"} aria-label="Restart article"><RotateCcw size={18} /></button>
      </div>
    </aside>
  );
}
