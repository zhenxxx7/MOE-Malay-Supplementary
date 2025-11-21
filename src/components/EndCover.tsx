"use client";

import { useEffect, useRef } from "react";

type EndCoverProps = {
  videoSrc: string;
  bgmSrc?: string;
  onReady?: () => void;
  onVideoEnd?: () => void;
  isMuted?: boolean;
  isPlaying?: boolean;
};

export default function EndCover({
  videoSrc,
  bgmSrc,
  onReady,
  onVideoEnd,
  isMuted = false,
  isPlaying = true,
}: EndCoverProps) {
  const bgmRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!bgmSrc) return;
    const audio = new Audio(bgmSrc);
    audio.loop = true;
    audio.volume = 1.0;
    bgmRef.current = audio;

    if (isMuted) {
      audio.volume = 0;
    }

    const tryPlay = async () => {
      if (isPlaying) {
        try {
          await audio.play();
        } catch {}
      }
    };
    const onClick = () => tryPlay();
    window.addEventListener("click", onClick, { once: true });
    return () => {
      audio.pause();
      window.removeEventListener("click", onClick);
    };
  }, [bgmSrc, isPlaying]);

  useEffect(() => {
    if (bgmRef.current) {
      bgmRef.current.volume = isMuted ? 0 : 1.0;
    }
  }, [isMuted]);

  useEffect(() => {
    if (!bgmRef.current) return;
    const audio = bgmRef.current;
    if (isPlaying && audio.paused) {
      void audio.play().catch((err) => {
        console.warn("BGM play prevented:", err);
      });
    } else if (!isPlaying && !audio.paused) {
      audio.pause();
    }
  }, [isPlaying]);

  const videoRef = useRef<HTMLVideoElement | null>(null);

  return (
    <div className="relative grid min-h-[850px] max-sm:min-h-[600px] place-items-center overflow-hidden rounded-xl">
      <video
        ref={videoRef}
        src={videoSrc}
        className="absolute inset-0 h-full w-full object-contain"
        autoPlay
        muted
        playsInline
        onCanPlay={() => onReady?.()}
        onEnded={() => onVideoEnd?.()}
      />
    </div>
  );
}
