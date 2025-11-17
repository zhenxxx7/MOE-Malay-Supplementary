"use client";

import { useEffect, useMemo, useRef, useState, cloneElement } from "react";
import dynamic from "next/dynamic";

export type BookPage = {
  id: string;
  element: React.ReactNode;
  ariaLabel: string;
};

type BookProps = {
  pages: BookPage[];
  onBookComplete?: () => void;
};

// Lazy load react-pageflip
const HTMLFlipBook = dynamic(
  () => import("react-pageflip").then((m: any) => m.default ?? m),
  { ssr: false }
);
const FlipBook: any = HTMLFlipBook as unknown as any;

export default function Book({ pages, onBookComplete }: BookProps) {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState<"next" | "prev" | null>(null);
  const [isFlipping, setIsFlipping] = useState(false);
  const flipRef = useRef<any>(null);
  const [allowNext, setAllowNext] = useState(false);
  const [viewportWidth, setViewportWidth] = useState(1280);
  const [viewportHeight, setViewportHeight] = useState(800);
  const [leftPageDone, setLeftPageDone] = useState(false);
  const [showRightPage, setShowRightPage] = useState(false);
  const [isCoverPage, setIsCoverPage] = useState(true);

  const [isMuted, setIsMuted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);

  const isDesktop = useMediaQuery("(min-width: 1024px)");

  const canPrev = index > 0;
  const canNext = index < pages.length - 1;

  // Proportional size to the cover
  const coverRatio = 1.42;
  const bookWidth = Math.min(viewportWidth * 0.45, 600);
  const bookHeight = bookWidth * coverRatio;

  // Update viewport size
  useEffect(() => {
    const updateSize = () => {
      setViewportWidth(window.innerWidth);
      setViewportHeight(window.innerHeight);
    };
    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  // Check if current left page is cover
  useEffect(() => {
    if (pages.length > 0) {
      const leftIndex = index % 2 === 0 ? index : index - 1;
      if (pages[leftIndex]) {
        const typeName = (pages[leftIndex].element as any)?.type?.name;
        setIsCoverPage(typeName === "CoverPage");
      }
    }
  }, [index, pages]);

  useEffect(() => {
    setLeftPageDone(false);
    setShowRightPage(false);
    setAllowNext(false);
  }, [index]);

  // Visible pages
  const visible: BookPage[] = useMemo(() => {
    if (!isDesktop) return [pages[index]];
    const leftIndex = index % 2 === 0 ? index : index - 1;
    const rightIndex = leftIndex + 1;
    const leftPage = pages[leftIndex];
    const rightPage = pages[rightIndex];
    if (rightPage && showRightPage) return [leftPage, rightPage];
    return [leftPage];
  }, [index, pages, isDesktop, showRightPage]);

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" && canNext) {
        setDirection("next");
        setIndex((i) => Math.min(i + 1, pages.length - 1));
      }
      if (e.key === "ArrowLeft" && canPrev) {
        setDirection("prev");
        setIndex((i) => Math.max(i - 1, 0));
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [canNext, canPrev, pages.length]);

  const handleLeftPageDone = () => {
    setLeftPageDone(true);
    if (isCoverPage) {
      setTimeout(() => {
        setShowRightPage(true);
        setAllowNext(true);
      }, 1000);
    } else {
      setShowRightPage(true);
      setAllowNext(true);
    }
  };

  useEffect(() => {
    const leftIndex = index % 2 === 0 ? index : index - 1;
    const rightIndex = leftIndex + 1;
    const isOnLastPage = rightIndex >= pages.length - 1 && leftPageDone;

    if (isOnLastPage && onBookComplete) {
      // Add a delay before showing end cover
      const timer = setTimeout(() => {
        onBookComplete();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [index, leftPageDone, pages.length, onBookComplete]);

  // Flip animation
  useEffect(() => {
    if (!direction || !isDesktop) return;
    setIsFlipping(true);
    const t = setTimeout(() => {
      setIsFlipping(false);
      setDirection(null);
    }, 620);
    return () => clearTimeout(t);
  }, [direction, isDesktop]);

  return (
    <div className="relative h-dvh w-dvw select-none">
      {/* Book viewport */}
      <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
        {isDesktop ? (
          <FlipBook
            key={`${isDesktop}-${viewportHeight}-${viewportWidth}`}
            ref={flipRef}
            width={bookWidth}
            height={bookHeight}
            size="fixed"
            maxShadowOpacity={0.35}
            showCover={false}
            mobileScrollSupport={true}
            className="mx-auto"
            style={{ background: "transparent" }}
            onFlip={(e: any) => setIndex(e.data)}
          >
            {pages.map((p, pageIndex) => {
              const typeName = (p.element as any)?.type?.name;
              const leftIndex = index % 2 === 0 ? index : index - 1;
              const rightIndex = leftIndex + 1;
              const isLeftPage = pageIndex === leftIndex;
              const isRightPage = pageIndex === rightIndex;
              const isActivePage = isLeftPage || isRightPage;
              const shouldPlay =
                isActivePage &&
                ((isLeftPage &&
                  isPlaying &&
                  (!showRightPage || !leftPageDone)) ||
                  (isRightPage && showRightPage && leftPageDone && isPlaying));

              const node =
                typeName === "PoemPage"
                  ? cloneElement(p.element as any, {
                      onDone: isLeftPage
                        ? handleLeftPageDone
                        : () => setAllowNext(true),
                      isMuted,
                      isPlaying: shouldPlay,
                      showOnlyBackground: isRightPage && !leftPageDone,
                    })
                  : typeName === "CoverPage"
                  ? cloneElement(p.element as any, {
                      onReady: handleLeftPageDone,
                      isMuted,
                      isPlaying: shouldPlay,
                    })
                  : typeName === "EndCover"
                  ? cloneElement(p.element as any, {
                      onReady: isLeftPage ? handleLeftPageDone : undefined,
                      isMuted,
                      isPlaying: shouldPlay,
                    })
                  : p.element;

              return (
                <article
                  key={`${p.id}-${pageIndex}`}
                  aria-label={p.ariaLabel}
                  className="h-full w-full p-0"
                >
                  {node}
                </article>
              );
            })}
          </FlipBook>
        ) : (
          <div
            className="flex h-full w-full items-stretch"
            data-anim={direction ?? undefined}
          >
            {visible.map((p, visibleIndex) => {
              const typeName = (p.element as any)?.type?.name;
              const isLeftPage = visibleIndex === 0;
              const shouldPlay =
                (visibleIndex === 0 && isPlaying && !leftPageDone) ||
                (visibleIndex === 1 && leftPageDone && isPlaying);

              const node =
                typeName === "PoemPage"
                  ? cloneElement(p.element as any, {
                      onDone: isLeftPage
                        ? handleLeftPageDone
                        : () => setAllowNext(true),
                      isMuted,
                      isPlaying: shouldPlay,
                      showOnlyBackground: visibleIndex === 1 && !leftPageDone,
                    })
                  : typeName === "CoverPage"
                  ? cloneElement(p.element as any, {
                      onReady: handleLeftPageDone,
                      isMuted,
                      isPlaying: shouldPlay,
                    })
                  : typeName === "EndCover"
                  ? cloneElement(p.element as any, {
                      onReady: isLeftPage ? handleLeftPageDone : undefined,
                      isMuted,
                      isPlaying: shouldPlay,
                    })
                  : p.element;
              return (
                <article
                  key={`${p.id}-${visibleIndex}`}
                  aria-label={p.ariaLabel}
                  className="h-full w-full p-0"
                >
                  {node}
                </article>
              );
            })}
          </div>
        )}
      </div>

      {/* Navigation controls */}
      <div className="pointer-events-none absolute bottom-0 left-1/2 z-20 -translate-x-1/2 pb-4 pt-4 bg-[#1B1B1B] w-full flex justify-between items-center px-4">
        {/* Play / Mute */}
        <div className="pointer-events-auto flex items-center gap-3 rounded-full px-4 py-2 shadow-lg backdrop-blur">
          {/* Play / Pause button */}
          <button
            className="flex h-10 w-10 items-center justify-center transition-all hover:scale-110"
            onClick={() => setIsPlaying((p) => !p)}
          >
            <img
              src={
                isPlaying
                  ? "/assets/images/icon/Button_Pause.png"
                  : "/assets/images/icon/Button_Play.png"
              }
              alt={isPlaying ? "Pause" : "Play"}
            />
          </button>

          {/* Mute / Sound On button */}
          <button
            className="flex h-10 w-10 items-center justify-center transition-all hover:scale-110"
            onClick={() => setIsMuted((m) => !m)}
          >
            <img
              src={
                isMuted
                  ? "/assets/images/icon/Button_Mute.png"
                  : "/assets/images/icon/Button_Sound On.png"
              }
              alt={isMuted ? "Muted" : "Sound On"}
            />
          </button>
        </div>

        {/* Page navigation */}
        <div className="pointer-events-auto flex items-center gap-3 rounded-full px-4 py-2 shadow-lg backdrop-blur">
          <button
            aria-label="Previous Page"
            className="flex h-10 w-10 items-center justify-center transition-all hover:scale-110 disabled:opacity-40 disabled:cursor-not-allowed"
            onClick={() => {
              setDirection("prev");
              if (isDesktop) flipRef.current?.pageFlip()?.flipPrev?.();
              else setIndex((i) => Math.max(0, i - 1));
            }}
            disabled={!canPrev}
          >
            <img
              src="/assets/images/icon/Button_Arrow Prev.png"
              alt="Previous Page"
            />
          </button>

          <button
            aria-label="Next Page"
            className="flex h-10 w-10 items-center justify-center transition-all hover:scale-110 disabled:opacity-40 disabled:cursor-not-allowed"
            onClick={() => {
              setDirection("next");
              if (isDesktop) flipRef.current?.pageFlip()?.flipNext?.();
              else setIndex((i) => Math.min(pages.length - 1, i + 1));
            }}
            disabled={!canNext || !allowNext}
          >
            <img
              src="/assets/images/icon/Button_Arrow Next.png"
              alt="Next Page"
            />
          </button>
        </div>
      </div>
    </div>
  );
}

// Custom hook
function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false);
  useEffect(() => {
    const m = window.matchMedia(query);
    const onChange = () => setMatches(m.matches);
    onChange();
    m.addEventListener("change", onChange);
    return () => m.removeEventListener("change", onChange);
  }, [query]);
  return matches;
}
