"use client";

import { useEffect, useState } from "react";

const TYPING_SPEED_MS = 60;

// Deutsche Anführungszeichen wie im ursprünglichen Markup (&bdquo; … &ldquo;).
const OPEN_QUOTE = "„";
const CLOSE_QUOTE = "“";

export default function ShimmerQuote({ text }: { text: string }) {
  const safeText = text ?? "";
  const fullText = `${OPEN_QUOTE}${safeText}${CLOSE_QUOTE}`;

  const [charCount, setCharCount] = useState(0);
  const [reduceMotion, setReduceMotion] = useState(false);

  // prefers-reduced-motion beobachten (inkl. Änderungen zur Laufzeit).
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduceMotion(mediaQuery.matches);

    const handleChange = (event: MediaQueryListEvent) => setReduceMotion(event.matches);
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  // Tipp-Animation: ein Zeichen alle TYPING_SPEED_MS.
  useEffect(() => {
    if (!safeText || reduceMotion) {
      setCharCount(fullText.length);
      return;
    }

    setCharCount(0);
    const interval = setInterval(() => {
      setCharCount((count) => {
        const next = count + 1;
        if (next >= fullText.length) {
          clearInterval(interval);
          return fullText.length;
        }
        return next;
      });
    }, TYPING_SPEED_MS);

    return () => clearInterval(interval);
  }, [safeText, fullText, reduceMotion]);

  const displayed = fullText.slice(0, charCount);
  const cursor = <span className="typing-cursor">|</span>;

  return (
    <div className="text-center max-w-4xl">
      <div className="accent-bar mx-auto mb-8" />
      <p className="relative text-3xl md:text-5xl lg:text-6xl font-bold leading-tight">
        {/* Für Screenreader: das vollständige Motto sofort, ohne Zeichen-für-Zeichen-Ansage. */}
        <span className="sr-only">{fullText}</span>

        {/* Unsichtbarer Platzhalter in voller Länge, reserviert den Platz und verhindert Layout-Sprünge. */}
        <span className="invisible" aria-hidden="true">
          {fullText}
          {cursor}
        </span>

        {/* Sichtbare, animierte Ausgabe – liegt exakt über dem Platzhalter. */}
        <span className="absolute inset-0 shimmer-text" aria-hidden="true">
          {displayed}
          {cursor}
        </span>
      </p>
      <div className="accent-bar mx-auto mt-8" />
    </div>
  );
}
