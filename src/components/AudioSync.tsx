"use client";

import { useEffect, useMemo, useRef, useState } from "react";

export type LyricSegment = {
  id: string;
  text: string;
  start: number; // seconds
  end: number; // seconds
};

type AudioSyncProps = {
  voiceOverSrc: string;
  segments: LyricSegment[];
  autoPlay?: boolean;
  className?: string;
  onReady?: () => void;
  onDone?: () => void;
  onActiveChange?: (id: string | null) => void;
  isMuted?: boolean;
  isPlaying?: boolean;
};

export default function AudioSync({
  voiceOverSrc,
  segments,
  autoPlay = false,
  className,
  onReady,
  onDone,
  onActiveChange,
  isMuted = false,
  isPlaying = true,
}: AudioSyncProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const isPlayingRef = useRef(isPlaying);
  const isReadyRef = useRef(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const [hasFiredDone, setHasFiredDone] = useState(false);
  const [needsUserInteraction, setNeedsUserInteraction] = useState(false);

  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  useEffect(() => {
    isReadyRef.current = isReady;
    // Only auto-play when isReady changes from false to true, not when isPlaying changes
    // This prevents restarting audio that's already playing
    if (isReady && autoPlay && isPlaying && audioRef.current) {
      const audio = audioRef.current;
      // Only play if audio hasn't started yet (currentTime is 0 or very close to 0)
      // This prevents restarting audio that's already in progress
      if (audio.paused && audio.currentTime < 0.1) {
        setTimeout(() => {
          if (
            audioRef.current &&
            audioRef.current.paused &&
            isPlayingRef.current &&
            audioRef.current.currentTime < 0.1
          ) {
            void audioRef.current.play().catch((err) => {
              console.warn("Autoplay prevented on ready change:", err);
              setNeedsUserInteraction(true);
            });
          }
        }, 100);
      }
    }
  }, [isReady, autoPlay, isPlaying]);

  // Load and control audio
  useEffect(() => {
    const audio = new Audio(voiceOverSrc);
    audioRef.current = audio;
    audio.preload = "auto";
    audio.volume = 1.0; // Start with full volume, mute control effect will adjust if needed
    audio.currentTime = 0;
    setCurrentTime(0);
    setHasFiredDone(false);

    // Apply current mute state immediately
    if (isMuted) {
      audio.volume = 0;
    }

    let rafId: number | null = null;
    let isActive = true;

    const update = () => {
      if (audioRef.current && isActive) {
        setCurrentTime(audioRef.current.currentTime);
        rafId = requestAnimationFrame(update);
      }
    };

    const handleCanPlay = () => {
      setIsReady(true);
      onReady?.();
      // Try to play immediately when ready if autoPlay is enabled
      // Only play if audio hasn't started yet (currentTime is 0 or very close to 0)
      // This prevents restarting audio that's already in progress
      if (
        autoPlay &&
        isPlayingRef.current &&
        audio.paused &&
        audio.currentTime < 0.1
      ) {
        // Use a small delay to ensure audio is fully ready
        setTimeout(() => {
          if (
            audioRef.current &&
            audioRef.current.paused &&
            isPlayingRef.current &&
            audioRef.current.currentTime < 0.1
          ) {
            void audioRef.current.play().catch((err) => {
              console.warn("Autoplay prevented on canplay:", err);
              setNeedsUserInteraction(true);
            });
          }
        }, 100);
      }
    };

    const handleEnded = () => {
      if (!hasFiredDone) {
        setHasFiredDone(true);
        onDone?.();
      }
    };

    const handleError = (e: Event) => {
      console.error("Audio error:", e);
    };

    const handleLoadedData = () => {
      // Try to play when data is loaded if autoPlay is enabled
      // Only play if audio hasn't started yet (currentTime is 0 or very close to 0)
      // This prevents restarting audio that's already in progress
      if (
        autoPlay &&
        isPlayingRef.current &&
        audio.paused &&
        audio.currentTime < 0.1
      ) {
        // Use a small delay to ensure audio is fully ready
        setTimeout(() => {
          if (
            audioRef.current &&
            audioRef.current.paused &&
            isPlayingRef.current &&
            audioRef.current.currentTime < 0.1
          ) {
            void audioRef.current.play().catch((err) => {
              console.warn("Autoplay prevented on loaded:", err);
              setNeedsUserInteraction(true);
            });
          }
        }, 100);
      }
    };

    audio.addEventListener("canplay", handleCanPlay);
    audio.addEventListener("loadeddata", handleLoadedData);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("error", handleError);

    // Start continuous update loop
    rafId = requestAnimationFrame(update);

    audio.load();

    return () => {
      isActive = false;
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
      }
      if (audioRef.current) {
        audioRef.current.pause();
      }
      audio.removeEventListener("canplay", handleCanPlay);
      audio.removeEventListener("loadeddata", handleLoadedData);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("error", handleError);
      audioRef.current = null;
    };
  }, [voiceOverSrc, onReady, onDone, autoPlay]);

  // Determine active segment
  const activeId = useMemo(() => {
    const seg = segments.find(
      (s) => currentTime >= s.start && currentTime < s.end
    );
    return seg?.id ?? null;
  }, [segments, currentTime]);

  // Calculate smooth active character index
  const activeCharIndex = useMemo(() => {
    if (!activeId) return -1;
    const seg = segments.find((s) => s.id === activeId);
    if (!seg) return -1;

    const segmentDuration = seg.end - seg.start;
    const timeInSegment = Math.max(0, currentTime - seg.start);

    // Smooth progress (ease slightly and accelerate highlight)
    const progress = Math.min(
      1,
      Math.pow(timeInSegment / segmentDuration, 0.9)
    );
    return progress * seg.text.length * 1.2;
  }, [activeId, currentTime, segments]);

  useEffect(() => {
    onActiveChange?.(activeId);
  }, [activeId, onActiveChange]);

  // Control mute state
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : 1.0;
    }
  }, [isMuted]);

  // Control play/pause state - pause/resume without resetting position
  useEffect(() => {
    if (!audioRef.current) return;
    const audio = audioRef.current;

    // Only control play/pause if audio is ready or already playing
    // This prevents resetting audio that's already in progress
    if (isPlaying) {
      if (audio.paused) {
        // Only play if audio is ready or has been loaded
        if (audio.readyState >= 2 || isReady) {
          void audio.play().catch((err) => {
            console.warn("Play prevented:", err);
            setNeedsUserInteraction(true);
          });
        }
      }
    } else {
      if (!audio.paused) {
        // Pause without resetting currentTime
        audio.pause();
      }
    }
  }, [isPlaying, isReady]);

  // Handle user interaction for autoplay
  useEffect(() => {
    if (!needsUserInteraction || !audioRef.current) return;

    const handleInteraction = () => {
      if (audioRef.current && isPlaying) {
        void audioRef.current.play().catch(() => {});
        setNeedsUserInteraction(false);
      }
    };

    window.addEventListener("click", handleInteraction, { once: true });
    window.addEventListener("touchstart", handleInteraction, { once: true });

    return () => {
      window.removeEventListener("click", handleInteraction);
      window.removeEventListener("touchstart", handleInteraction);
    };
  }, [needsUserInteraction, isPlaying]);

  // Play when visible (fallback for autoplay)
  useEffect(() => {
    if (!containerRef.current || !autoPlay) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (
            entry.isIntersecting &&
            audioRef.current &&
            isReady &&
            isPlaying
          ) {
            const audio = audioRef.current;
            if (audio.paused) {
              // Try multiple times if needed
              const tryPlay = () => {
                if (audio.readyState >= 2) {
                  void audio.play().catch((err) => {
                    console.warn("Autoplay prevented on visible:", err);
                    setNeedsUserInteraction(true);
                  });
                } else {
                  setTimeout(tryPlay, 100);
                }
              };
              tryPlay();
            }
          }
        });
      },
      { threshold: 0.1 }
    );

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [autoPlay, isReady, isPlaying]);

  const handlePlayClick = () => {
    if (audioRef.current) {
      void audioRef.current.play().catch((err) => {
        console.error("Failed to play:", err);
      });
      setNeedsUserInteraction(false);
    }
  };

  // Render text with smooth character-by-character highlight
  const renderTextWithHighlight = (segment: LyricSegment) => {
    if (activeId !== segment.id) {
      return (
        <span className="text-xl sm:text-2xl leading-relaxed text-zinc-700">
          {segment.text}
        </span>
      );
    }

    return (
      <span className="text-xl sm:text-2xl leading-relaxed text-zinc-700">
        {segment.text.split("").map((char, charIndex) => {
          const opacity = Math.min(1, Math.max(0, activeCharIndex - charIndex));
          const isHighlighted = opacity > 0;

          return (
            <span
              key={charIndex}
              className="transition-all duration-20 ease-out"
              style={{
                display: "inline",
                backgroundColor: isHighlighted
                  ? `rgba(217, 249, 157, ${opacity})`
                  : "transparent",
              }}
            >
              {char}
            </span>
          );
        })}
      </span>
    );
  };

  return (
    <div ref={containerRef} className={className}>
      <div className="space-y-3 text-center">
        {Array.from({ length: Math.ceil(segments.length / 2) }).map((_, i) => {
          const left = segments[i * 2];
          const right = segments[i * 2 + 1];
          return (
            <div
              key={left?.id ?? i}
              className="flex items-center justify-center gap-3"
            >
              {left && renderTextWithHighlight(left)}
              {right && renderTextWithHighlight(right)}
            </div>
          );
        })}
      </div>

      {needsUserInteraction && (
        <div className="mt-4 flex justify-center">
          <button onClick={handlePlayClick} className="hidden"></button>
        </div>
      )}
    </div>
  );
}
