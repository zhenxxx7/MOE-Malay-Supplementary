"use client";

import AudioSync, { LyricSegment } from "./AudioSync";
import { useState, useRef, useEffect } from "react";

type PoemPageProps = {
  id?: string;
  voiceOverSrc: string;
  backgroundMusicSrc?: string;
  segments: LyricSegment[];
  gifSrc?: string;
  backgroundImage?: string;
  gifBySegment?: Record<string, string>;
  backgroundGif?: string;
  onDone?: () => void;
  isMuted?: boolean;
  isPlaying?: boolean;
  showOnlyBackground?: boolean;
};

export default function PoemPage({
  id,
  voiceOverSrc,
  backgroundMusicSrc,
  segments,
  gifSrc,
  backgroundImage,
  gifBySegment,
  backgroundGif,
  onDone,
  isMuted = false,
  isPlaying = true,
  showOnlyBackground = false,
}: PoemPageProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const bgMusicRef = useRef<HTMLAudioElement | null>(null);

  const currentGif = (activeId && gifBySegment?.[activeId]) || gifSrc;

  // Reset active ID when isPlaying becomes false
  useEffect(() => {
    if (!showOnlyBackground && !activeId && segments && segments.length > 0) {
      setActiveId(segments[0].id);
    }
  }, [showOnlyBackground, segments, activeId]);

  // Background music mute control
  useEffect(() => {
    if (bgMusicRef.current) {
      bgMusicRef.current.volume = isMuted ? 0 : 1;
    }
  }, [isMuted]);

  // Background music play / pause control
  useEffect(() => {
    if (!bgMusicRef.current) return;
    const audio = bgMusicRef.current;

    if (isPlaying && audio.paused) {
      void audio.play().catch(() => {});
    } else if (!isPlaying && !audio.paused) {
      audio.pause();
    }
  }, [isPlaying]);

  // State activeId tetap terakhir kalau AudioSync null
  const setActiveIdWithHold = (id: string | null) => {
    if (id === null && segments.length > 0) {
      setActiveId(segments[segments.length - 1].id);
    } else {
      setActiveId(id);
    }
  };

  return (
    <div className="relative flex h-full flex-col items-center justify-between overflow-hidden text-center">
      {backgroundImage && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={backgroundImage}
          alt="Background Page"
          className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-90"
        />
      )}

      {!showOnlyBackground && (
        <div className="relative z-20 mx-auto flex h-full w-full max-w-2xl flex-col items-center justify-start gap-6 p-4 pt-32">
          {/* Background GIF, only when active */}
          {backgroundGif && (
            <div className="absolute bottom-0 left-1/2 z-10 w-full -translate-x-1/2 flex justify-center pointer-events-none">
              <img
                src={backgroundGif}
                alt="Background GIF"
                className="w-full max-w-none object-contain opacity-80"
              />
            </div>
          )}

          <AudioSync
            key={`${id || voiceOverSrc}`}
            voiceOverSrc={voiceOverSrc}
            segments={segments}
            autoPlay={true}
            className="mt-2"
            onReady={() => {}}
            onDone={onDone}
            onActiveChange={setActiveIdWithHold}
            isMuted={isMuted}
            isPlaying={isPlaying}
          />

          {currentGif && (
            <div className="absolute bottom-0 left-1/2 z-30 w-full -translate-x-1/2 flex justify-center pointer-events-none">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                key={activeId || "default"}
                src={currentGif}
                alt="Illustration"
                className="w-full max-w-none object-contain"
              />
            </div>
          )}

          {backgroundMusicSrc && (
            <audio
              ref={bgMusicRef}
              src={backgroundMusicSrc}
              loop
              autoPlay
              className="hidden"
            />
          )}
        </div>
      )}
    </div>
  );
}
