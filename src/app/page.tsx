"use client";

import { useState, useEffect } from "react";
import Book, { BookPage } from "@/components/Book";
import CoverPage from "@/components/CoverPage";
import PoemPage from "@/components/PoemPage";
import EndCover from "@/components/EndCover";

type Segment = { id: string; text: string; start: number; end: number };

type PantunPageDef = {
  id: string;
  ariaLabel: string;
  voiceOverSrc: string;
  backgroundImage?: string;
  gifSrc?: string;
  gifBySegment?: Record<string, string>;
  backgroundMusicSrc?: string;
  segments: Segment[];
};

type PantunGroup = {
  id: string;
  cover: { ariaLabel: string; videoSrc: string; bgmSrc?: string };
  pages: PantunPageDef[];
};

const makeGroupPages = (group: PantunGroup): BookPage[] => {
  return group.pages.map<BookPage>((p) => ({
    id: p.id,
    ariaLabel: p.ariaLabel,
    element: <PoemPage {...p} id={p.id} />,
  }));
};

export default function Home() {
  const [currentUnlockedPage, setCurrentUnlockedPage] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);

  const handlePageFinished = (pageIndex: number) => {
    setCurrentUnlockedPage((prev) =>
      pageIndex >= prev ? pageIndex + 1 : prev
    );
  };

  const warisan: PantunGroup = {
    id: "warisan",
    cover: {
      ariaLabel: "Cover Pantun Warisan",
      videoSrc: "/assets/video/Main Cover.mp4",
      bgmSrc: "/assets/audio/3 Classic - background soundtrack.wav",
    },
    pages: [
      {
        id: "warisan-1",
        ariaLabel: "Pantun Warisan - halaman 1",
        voiceOverSrc:
          "/assets/audio/ElevenLabs_2025_11_05T05_20_55_Aisyah_–_Animated_Malay_Voice_for.mp3",
        backgroundImage: "/assets/images/bg1.png",
        gifSrc: "/assets/gifs/Girl Scene 1.gif",
        gifBySegment: {
          a: "/assets/gifs/Gendang.gif",
          b: "/assets/gifs/kecapi.gif",
          c: "/assets/gifs/Girl Scene 1.gif",
          d: "/assets/gifs/Girl Scene 1.gif",
        },
        segments: [
          { id: "a", text: "Gendang gendut", start: 0.0, end: 2.1 },
          { id: "b", text: "tali kecapi,", start: 2.1, end: 3.2 },
          { id: "c", text: "Kenyang perut", start: 3.2, end: 3.9 },
          { id: "d", text: "senang hati.", start: 3.9, end: 5.6 },
        ],
      },
      {
        id: "warisan-2",
        ariaLabel: "Pantun Warisan - halaman 2",
        voiceOverSrc: "/assets/audio/pagi petang.mp3",
        backgroundImage: "/assets/images/bg1.png",
        gifSrc: "/assets/gifs/girl boy.gif",
        gifBySegment: {
          a: "/assets/gifs/Sun.gif",
          b: "/assets/gifs/Moon.gif",
          c: "/assets/gifs/girl boy.gif",
          d: "/assets/gifs/girl boy.gif",
        },
        segments: [
          { id: "a", text: "Pagi petang", start: 0.0, end: 1.2 },
          { id: "b", text: "siang malam,", start: 1.2, end: 2.4 },
          { id: "c", text: "Hati terang", start: 2.4, end: 3.0 },
          { id: "d", text: "senang faham.", start: 3.0, end: 4.5 },
        ],
      },
      {
        id: "warisan-3",
        ariaLabel: "Pantun Warisan - halaman 3",
        voiceOverSrc: "/assets/audio/orang berbudi.mp3",
        backgroundImage: "/assets/images/bg1.png",
        gifSrc: "/assets/gifs/boy girl 3.gif",
        gifBySegment: {
          a: "/assets/gifs/mom girl.gif",
          b: "/assets/gifs/boy dad.gif",
          c: "/assets/gifs/boy girl 3.gif",
          d: "/assets/gifs/boy girl 3.gif",
        },
        segments: [
          { id: "a", text: "Orang berbudi", start: 0.0, end: 1.2 },
          { id: "b", text: "kita berbahasa,", start: 1.2, end: 2.8 },
          { id: "c", text: "Orang memberi", start: 2.8, end: 4.0 },
          { id: "d", text: "kita merasa.", start: 4.0, end: 6.0 },
        ],
      },
      {
        id: "warisan-4",
        ariaLabel: "Pantun Warisan - halaman 4",
        voiceOverSrc: "/assets/audio/satu dua.mp3",
        backgroundImage: "/assets/images/bg1.png",
        gifSrc: "/assets/gifs/final-kid.gif",
        gifBySegment: {
          a: "/assets/gifs/1 2.gif",
          b: "/assets/gifs/3 4.gif",
          c: "/assets/gifs/final-kid.gif",
          d: "/assets/gifs/final-kid.gif",
        },
        segments: [
          { id: "a", text: "Satu dua", start: 0.0, end: 1.3 },
          { id: "b", text: "tiga empat,", start: 1.3, end: 2.6 },
          { id: "c", text: "Siapa cepat", start: 2.6, end: 3.9 },
          { id: "d", text: "dia dapat.", start: 3.9, end: 5.2 },
        ],
      },
      {
        id: "warisan-5",
        ariaLabel: "Pantun Warisan - halaman 5",
        voiceOverSrc: "/assets/audio/sudah gaharu.mp3",
        backgroundImage: "/assets/images/bg1.png",
        gifSrc: "/assets/gifs/1-boy-+-table.gif",
        gifBySegment: {
          a: "/assets/gifs/gif cendana gaharu.gif",
          b: "/assets/gifs/gif cendana gaharu.gif",
          c: "/assets/gifs/1-boy-+-table.gif",
          d: "/assets/gifs/1-boy-+-table.gif",
        },
        segments: [
          { id: "a", text: "Sudah gaharu", start: 0.0, end: 1.3 },
          { id: "b", text: "cendana pula,", start: 1.3, end: 2.6 },
          { id: "c", text: "Sudah tahu", start: 2.6, end: 3.9 },
          { id: "d", text: "bertanya pula.", start: 3.9, end: 5.2 },
        ],
      },
    ],
  };

  // 2) Pantun Dua Kerat
  // const duaKerat: PantunGroup = {
  //   id: "dua-kerat",
  //   cover: {
  //     ariaLabel: "Cover Pantun Dua Kerat",
  //     videoSrc: "/assets/video/Main Cover.mp4",
  //     bgmSrc: "/assets/audio/3 Classic - background soundtrack.wav",
  //   },
  //   pages: [
  //     {
  //       id: "dua-kerat-1",
  //       ariaLabel: "Pantun Dua Kerat - halaman 1",
  //       voiceOverSrc:
  //         "/assets/audio/ElevenLabs_2025_11_05T05_20_55_Aisyah_–_Animated_Malay_Voice_for.mp3",
  //       backgroundImage: "/assets/images/bg1.png",
  //       gifSrc: "/assets/gifs/Girl Scene 1.gif",
  //       gifBySegment: {
  //         a: "/assets/gifs/Gendang.gif",
  //         b: "/assets/gifs/kecapi.gif",
  //         c: "/assets/gifs/Girl Scene 1.gif",
  //         d: "/assets/gifs/Girl Scene 1.gif",
  //       },
  //       segments: [
  //         { id: "a", text: "Gendang gendut", start: 0.0, end: 2.1 },
  //         { id: "b", text: "tali kecapi,", start: 2.1, end: 3.2 },
  //         { id: "c", text: "Kenyang perut", start: 3.2, end: 3.9 },
  //         { id: "d", text: "senang hati.", start: 3.9, end: 5.6 },
  //       ],
  //     },
  //     {
  //       id: "dua-kerat-2",
  //       ariaLabel: "Pantun Dua Kerat - halaman 2",
  //       voiceOverSrc: "/assets/audio/pagi petang.mp3",
  //       backgroundImage: "/assets/images/bg1.png",
  //       gifSrc: "/assets/gifs/Girl Scene 1.gif",
  //       gifBySegment: {
  //         a: "/assets/gifs/Sun.gif",
  //         b: "/assets/gifs/Moon.gif",
  //         c: "/assets/gifs/girl boy.gif",
  //         d: "/assets/gifs/girl boy.gif",
  //       },
  //       segments: [
  //         { id: "a", text: "Pagi petang", start: 0.0, end: 2.1 },
  //         { id: "b", text: "siang malam,", start: 2.1, end: 3.0 },
  //         { id: "c", text: "Hati terang", start: 3.0, end: 4.0 },
  //         { id: "d", text: "senang faham.", start: 4.0, end: 5.0 },
  //       ],
  //     },
  //     {
  //       id: "dua-kerat-3",
  //       ariaLabel: "Pantun Dua Kerat - halaman 3",
  //       voiceOverSrc: "/assets/audio/pantun-warisan-1.mp3",
  //       backgroundImage: "/assets/images/bg1.png",
  //       gifSrc: "/assets/gifs/Girl Scene 1.gif",
  //       gifBySegment: {
  //         a: "/assets/gifs/Gendang.gif",
  //         b: "/assets/gifs/kecapi.gif",
  //         c: "/assets/gifs/Girl Scene 1.gif",
  //         d: "/assets/gifs/Girl Scene 1.gif",
  //       },
  //       segments: [
  //         { id: "a", text: "Orang berbudi", start: 4.6, end: 7.3 },
  //         { id: "b", text: "kita berbahasa,", start: 7.3, end: 10.0 },
  //         { id: "c", text: "Orang memberi", start: 4.6, end: 7.3 },
  //         { id: "d", text: "kita merasa.", start: 7.3, end: 10.0 },
  //       ],
  //     },
  //     {
  //       id: "dua-kerat-4",
  //       ariaLabel: "Pantun Dua Kerat - halaman 4",
  //       voiceOverSrc: "/assets/audio/pantun-warisan-1.mp3",
  //       backgroundImage: "/assets/images/bg1.png",
  //       gifSrc: "/assets/gifs/Girl Scene 1.gif",
  //       gifBySegment: {
  //         a: "/assets/gifs/Gendang.gif",
  //         b: "/assets/gifs/kecapi.gif",
  //         c: "/assets/gifs/Girl Scene 1.gif",
  //         d: "/assets/gifs/Girl Scene 1.gif",
  //       },
  //       segments: [
  //         { id: "a", text: "Satu dua", start: 4.6, end: 7.3 },
  //         { id: "b", text: "tiga empat,", start: 7.3, end: 10.0 },
  //         { id: "c", text: "Siapa cepat", start: 4.6, end: 7.3 },
  //         { id: "d", text: "dia dapat.", start: 7.3, end: 10.0 },
  //       ],
  //     },
  //     {
  //       id: "dua-kerat-5",
  //       ariaLabel: "Pantun Dua Kerat - halaman 5",
  //       voiceOverSrc: "/assets/audio/pantun-warisan-1.mp3",
  //       backgroundImage: "/assets/images/bg1.png",
  //       gifSrc: "/assets/gifs/Girl Scene 1.gif",
  //       gifBySegment: {
  //         a: "/assets/gifs/Gendang.gif",
  //         b: "/assets/gifs/kecapi.gif",
  //         c: "/assets/gifs/Girl Scene 1.gif",
  //         d: "/assets/gifs/Girl Scene 1.gif",
  //       },
  //       segments: [
  //         { id: "a", text: "Sudah gaharu", start: 4.6, end: 7.3 },
  //         { id: "b", text: "cendana pula,", start: 7.3, end: 10.0 },
  //         { id: "c", text: "Sudah tahu", start: 4.6, end: 7.3 },
  //         { id: "d", text: "bertanya pula.", start: 7.3, end: 10.0 },
  //       ],
  //     },
  //   ],
  // };

  // 3) Pantun Empat Kerat
  // const empatKerat: PantunGroup = {
  //   id: "empat-kerat",
  //   cover: {
  //     ariaLabel: "Cover Pantun Empat Kerat",
  //     videoSrc: "/assets/video/Divider Page - Pantun 4 Kerat.mp4",
  //   },
  //   pages: [
  //     {
  //       id: "empat-1",
  //       ariaLabel: "Pantun Empat Kerat - halaman 1",
  //       voiceOverSrc: "/assets/audio/pantun-empat-kerat-1.mp3",
  //       backgroundImage: "/assets/images/bg1.png",
  //       gifSrc: "/assets/gifs/Girl Scene 1.gif",
  //       gifBySegment: {
  //         a: "/assets/gifs/Gendang.gif",
  //         b: "/assets/gifs/kecapi.gif",
  //         c: "/assets/gifs/Girl Scene 1.gif",
  //         d: "/assets/gifs/Girl Scene 1.gif",
  //       },
  //       segments: [
  //         { id: "a", text: "Buah cempedak di luar pagar,", start: 0, end: 2 },
  //         { id: "b", text: "Ambil galah tolong jolokkan;", start: 2, end: 4 },
  //         { id: "c", text: "Kami budak baru belajar,", start: 4, end: 6 },
  //         { id: "d", text: "Kalau salah tolong tunjukkan.", start: 6, end: 8 },
  //       ],
  //     },
  //     {
  //       id: "empat-2",
  //       ariaLabel: "Pantun Empat Kerat - halaman 2",
  //       voiceOverSrc: "/assets/audio/pantun-empat-kerat-1.mp3",
  //       backgroundImage: "/assets/images/bg1.png",
  //       gifSrc: "/assets/gifs/Girl Scene 1.gif",
  //       gifBySegment: {
  //         a: "/assets/gifs/Gendang.gif",
  //         b: "/assets/gifs/kecapi.gif",
  //         c: "/assets/gifs/Girl Scene 1.gif",
  //         d: "/assets/gifs/Girl Scene 1.gif",
  //       },
  //       segments: [
  //         { id: "a", text: "Dua tiga kucing berlari,", start: 0, end: 2 },
  //         { id: "b", text: "Mana sama si kucing belang;", start: 2, end: 4 },
  //         { id: "c", text: "Dua tiga boleh kucari,", start: 4, end: 6 },
  //         { id: "d", text: "Mana sama Ibuku seorang.", start: 6, end: 8 },
  //       ],
  //     },
  //     {
  //       id: "empat-3",
  //       ariaLabel: "Pantun Empat Kerat - halaman 3",
  //       voiceOverSrc: "/assets/audio/pantun-empat-kerat-1.mp3",
  //       backgroundImage: "/assets/images/bg1.png",
  //       gifSrc: "/assets/gifs/Girl Scene 1.gif",
  //       gifBySegment: {
  //         a: "/assets/gifs/Gendang.gif",
  //         b: "/assets/gifs/kecapi.gif",
  //         c: "/assets/gifs/Girl Scene 1.gif",
  //         d: "/assets/gifs/Girl Scene 1.gif",
  //       },
  //       segments: [
  //         { id: "a", text: "Pisang emas dibawa belayar,", start: 0, end: 2 },
  //         { id: "b", text: "Masak sebiji di dalam peti;", start: 2, end: 4 },
  //         { id: "c", text: "Hutang emas boleh dibayar,", start: 4, end: 6 },
  //         { id: "d", text: "Hutang budi dibawa mati.", start: 6, end: 8 },
  //       ],
  //     },
  //   ],
  // };

  const pagesRaw: BookPage[] = makeGroupPages(warisan);

  const coverBookPage: BookPage = {
    id: "cover",
    ariaLabel: warisan.cover.ariaLabel,
    element: (
      <CoverPage
        videoSrc={warisan.cover.videoSrc}
        bgmSrc={warisan.cover.bgmSrc}
        isMuted={isMuted}
        isPlaying={isPlaying}
        onReady={() => {}}
        onVideoEnd={() => {}}
      />
    ),
  };
  const endBookPage: BookPage = {
    id: "end",
    ariaLabel: "Halaman Akhir",
    element: (
      <EndCover
        videoSrc="/assets/video/End Cover.mp4"
        bgmSrc="/assets/audio/3 Classic - background soundtrack.wav"
        isMuted={isMuted}
        isPlaying={isPlaying}
        onReady={() => {}}
        onVideoEnd={() => {}}
      />
    ),
  };

  const blankPage: BookPage = {
    id: "blank-end",
    ariaLabel: "Halaman Kosong",
    element: (
      <div className="relative h-full w-full">
        <img
          src="/assets/images/bg1.png"
          alt="Background"
          className="absolute inset-0 h-full w-full object-cover"
        />
      </div>
    ),
  };

  const pagesWithoutEnd: BookPage[] = [
    coverBookPage,
    ...pagesRaw.map((p, index) => {
      return {
        ...p,
        element: (
          <PoemPage
            {...(p.element as any)?.props}
            id={p.id}
            pageIndex={index}
            isLocked={index > currentUnlockedPage}
            onPageDone={() => handlePageFinished(index)}
          />
        ),
      };
    }),
  ];

  const poemPagesCount = pagesRaw.length;
  const endCoverWillBeOnRight = poemPagesCount % 2 === 1;

  const pages: BookPage[] = [
    ...pagesWithoutEnd,
    ...(endCoverWillBeOnRight ? [blankPage] : []),
    endBookPage,
  ];

  const handleBookComplete = () => {
    // modify later
  };

  return (
    <div
      className={`h-dvh w-dvw overflow-hidden ${
        isTransitioning ? "cover-fade-out" : "flipbook-fade-in"
      }`}
      style={{ background: "#82603E", position: "relative" }}
    >
      <Book pages={pages} onBookComplete={handleBookComplete} />
    </div>
  );
}
