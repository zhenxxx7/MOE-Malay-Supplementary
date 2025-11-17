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
    if (!isPlaying) {
      setActiveId(null);
    }
  }, [isPlaying]);

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
        <div className="relative z-10 mx-auto flex h-full w-full max-w-2xl flex-col items-center justify-center gap-6 p-4">
          <AudioSync
            key={`${id || voiceOverSrc}`}
            voiceOverSrc={voiceOverSrc}
            segments={segments}
            autoPlay={true}
            className="mt-2"
            onReady={() => {}}
            onDone={onDone}
            onActiveChange={setActiveId}
            isMuted={isMuted}
            isPlaying={isPlaying}
          />

          {currentGif && (
            <div className="mt-6 -mb-[200px]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                key={activeId || "default"}
                src={currentGif}
                alt="Illustration"
                className="h-[50vh] w-auto -mt-[200px] transition-opacity duration-300"
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
