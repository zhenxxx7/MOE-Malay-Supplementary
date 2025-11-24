"use client";

import { useEffect, useMemo, useRef, useState, cloneElement } from "react";
import dynamic from "next/dynamic";

export type BookPageType = "cover" | "poem" | "end" | "blank" | "other";

export type BookPage = {
  id: string;
  element: React.ReactNode;
  ariaLabel: string;
  pageType?: BookPageType | string;
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
  const [isEndCoverPage, setIsEndCoverPage] = useState(false);

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

  useEffect(() => {
    setIsCoverPage(index === 0);
  }, [index]);

  // Check if current page is end cover
  useEffect(() => {
    if (!isDesktop) {
      const currentPage = pages[index];
      setIsEndCoverPage(getPageType(currentPage) === "end");
    } else {
      const leftIndex = index === 0 ? -1 : index;
      const rightIndex = index === 0 ? 0 : index + 1;
      const leftPage = leftIndex >= 0 ? pages[leftIndex] : null;
      const rightPage = pages[rightIndex];
      const isEndCover =
        getPageType(leftPage) === "end" || getPageType(rightPage) === "end";
      setIsEndCoverPage(isEndCover);
    }
  }, [index, pages, isDesktop]);

  useEffect(() => {
    setLeftPageDone(false);
    setShowRightPage(false);
    setAllowNext(false);

    if (index > 0 && pages.length > 0) {
      const leftIndex = index;
      const rightIndex = index + 1;
      if (pages[leftIndex]) {
        const leftPageType = getPageType(pages[leftIndex]);
        if (leftPageType === "cover" || leftPageType === "end") {
          setLeftPageDone(true);
          setShowRightPage(true);
          setAllowNext(true);
        }
      }
    }
  }, [index, pages]);

  const visible: BookPage[] = useMemo(() => {
    if (!isDesktop) return [pages[index]];
    const leftIndex = index === 0 ? -1 : index;
    const rightIndex = index === 0 ? 0 : index + 1;
    const leftPage = leftIndex >= 0 ? pages[leftIndex] : null;
    const rightPage = pages[rightIndex];
    if (rightPage && showRightPage && leftPage) return [leftPage, rightPage];
    if (rightPage && index === 0) return [rightPage];
    if (leftPage) return [leftPage];
    return [];
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
    const leftIndex = index === 0 ? -1 : index;
    const rightIndex = index === 0 ? 0 : index + 1;
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

  // Debug log on development
  // can remove this later
  useEffect(() => {
    const leftIndex = index === 0 ? -1 : index;
    const rightIndex = index === 0 ? 0 : index + 1;
    const leftPage = leftIndex >= 0 ? pages[leftIndex] : null;
    const rightPage = pages[rightIndex];
    const leftPageType = leftPage ? getPageType(leftPage) : null;
    const rightPageType = rightPage ? getPageType(rightPage) : null;
    console.log(
      `Book: Index ${index} | Left: ${leftPage?.id || "none"} (${
        leftPageType || "none"
      }) | Right: ${rightPage?.id || "none"} (${rightPageType || "none"})`
    );
  }, [index, pages]);

  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);
  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    touchEndX.current = null;
    touchStartX.current = e.targetTouches[0].clientX;
  };
  const onTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };
  const onTouchEnd = () => {
    if (!touchStartX.current || touchEndX.current === null) return;
    const distance = touchStartX.current - touchEndX.current;
    if (Math.abs(distance) < minSwipeDistance) return;
    if (distance > 0) {
      setDirection("next");
      setIndex((i) => Math.min(pages.length - 1, i + 1));
    } else {
      setDirection("prev");
      setIndex((i) => Math.max(0, i - 1));
    }
  };

  return (
    <div className="relative h-dvh w-dvw select-none">
      {/* Book viewport */}
      <div
        className={`absolute inset-0 flex items-center overflow-hidden transition-all duration-700 ${
          isCoverPage
            ? "justify-start md:ml-[-30vw]"
            : isEndCoverPage
            ? "justify-end md:mr-[-30vw]"
            : "justify-center"
        }`}
      >
        <FlipBook
          key={`${isDesktop}-${viewportHeight}-${viewportWidth}`}
          ref={flipRef}
          width={isDesktop ? bookWidth : Math.min(viewportWidth * 0.95, 400)}
          height={isDesktop ? bookHeight : Math.min(viewportHeight * 0.85, 600)}
          size="fixed"
          maxShadowOpacity={0.35}
          showCover={true}
          singlePage={!isDesktop}
          mobileScrollSupport={true}
          className="mx-auto"
          style={{ background: "transparent" }}
          onFlip={(e: any) => {
            setIndex(e.data);
            const idx = e.data;
            const leftIndex = idx === 0 ? -1 : idx;
            const rightIndex = idx === 0 ? 0 : idx + 1;
            const leftPage = leftIndex >= 0 ? pages[leftIndex] : null;
            const rightPage = pages[rightIndex];
          }}
        >
          {pages.map((p, pageIndex) => {
            const pageType = getPageType(p);
            const leftIndex = index === 0 ? -1 : index;
            const rightIndex = index === 0 ? 0 : index + 1;
            const isLeftPage = pageIndex === leftIndex;
            const isRightPage = pageIndex === rightIndex;
            const isVisible = isDesktop
              ? isLeftPage || isRightPage
              : pageIndex === index;

            let shouldPlay = false;
            if (!p.element) {
              shouldPlay = false;
            } else if (index === 0) {
              shouldPlay = pageType === "cover" && pageIndex === 0 && isPlaying;
            } else {
              if (pageType === "cover") {
                shouldPlay = false;
              } else if (pageType === "poem") {
                if (isLeftPage) {
                  shouldPlay = isVisible && isPlaying && !showRightPage;
                } else if (isRightPage) {
                  shouldPlay = isVisible && isPlaying && showRightPage;
                } else {
                  shouldPlay = false;
                }
              } else {
                shouldPlay = isVisible && isPlaying;
              }
            }

            const leftPageType =
              leftIndex >= 0 && pages[leftIndex]
                ? getPageType(pages[leftIndex])
                : null;
            const isLeftPageCoverPage = leftPageType === "cover";

            const node = p.element ? (
              pageType === "poem" ? (
                cloneElement(p.element as any, {
                  onDone: isLeftPage
                    ? handleLeftPageDone
                    : () => setAllowNext(true),
                  isMuted,
                  isPlaying: shouldPlay,
                  showOnlyBackground:
                    isRightPage && !leftPageDone && !isLeftPageCoverPage,
                })
              ) : pageType === "cover" ? (
                cloneElement(p.element as any, {
                  onReady:
                    index === 0 || (index === 1 && isLeftPage)
                      ? handleLeftPageDone
                      : undefined,
                  isMuted,
                  isPlaying: shouldPlay,
                })
              ) : pageType === "end" ? (
                cloneElement(p.element as any, {
                  onReady: isLeftPage ? handleLeftPageDone : undefined,
                  isMuted,
                  isPlaying: shouldPlay,
                })
              ) : (
                p.element
              )
            ) : (
              <div className="h-full w-full bg-[#f5f5dc]"></div>
            );

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
      </div>

      {/* Navigation controls */}
      <div className="pointer-events-none absolute bottom-0 left-1/2 z-20 -translate-x-1/2 pb-4 pt-4 bg-[#1B1B1B] w-full flex justify-between items-center px-4">
        <div className="pointer-events-auto flex items-center gap-3 rounded-full px-4 py-2 shadow-lg backdrop-blur">
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
              flipRef.current?.pageFlip()?.flipPrev?.();
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
              flipRef.current?.pageFlip()?.flipNext?.();
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

function getPageType(page?: BookPage | null): BookPageType {
  const fromProp = normalizePageTypeString(
    typeof page?.pageType === "string" ? page?.pageType : undefined
  );
  if (fromProp) return fromProp;

  const elementType =
    (page?.element as any)?.type?.displayName ||
    (page?.element as any)?.type?.name;
  const fromElement = normalizePageTypeString(elementType);
  return fromElement ?? "other";
}

function normalizePageTypeString(value?: string | null): BookPageType | null {
  if (!value) return null;
  const sanitized = value.replace(/[\s_-]/g, "").toLowerCase();
  if (sanitized.includes("endcover") || sanitized === "end") return "end";
  if (sanitized.includes("cover")) return "cover";
  if (sanitized.includes("poem")) return "poem";
  if (sanitized.includes("blank")) return "blank";
  return null;
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
