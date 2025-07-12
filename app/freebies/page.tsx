"use client";

import { useEffect, useRef, useState } from "react";
import { Play, Pause, RotateCcw, RotateCw } from "lucide-react";
import Link from "next/link";
import YouTubeLong from "@/components/FreeBieLong";

// YouTube Iframe API Loader
const loadYouTubeAPI = (): Promise<void> => {
  return new Promise((resolve) => {
    if (window.YT && window.YT.Player) {
      resolve();
    } else {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      document.body.appendChild(tag);
      (window as any).onYouTubeIframeAPIReady = () => resolve();
    }
  });
};

// ✅ YouTubeShort Component
const YouTubeShort = ({ videoId, title }: { videoId: string; title: string }) => {
  const playerRef = useRef<any>(null);
  const [playerReady, setPlayerReady] = useState(false);
  const [started, setStarted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    loadYouTubeAPI().then(() => {
      const container = document.getElementById(`short-${videoId}`);
      if (!container) return;

      playerRef.current = new YT.Player(container, {
        videoId,
        playerVars: { controls: 0, rel: 0, modestbranding: 1 },
        events: {
          onReady: () => setPlayerReady(true),
          onStateChange: (e) => {
            if (e.data === YT.PlayerState.PLAYING) setIsPlaying(true);
            if (e.data === YT.PlayerState.PAUSED) setIsPlaying(false);
          },
        },
      });
    });
  }, []);

  const play = () => {
    if (!playerReady || !playerRef.current?.playVideo) return;
    setStarted(true);
    playerRef.current.playVideo();
  };

  const pause = () => playerRef.current?.pauseVideo();

  return (
    <div className="relative w-full max-w-xs aspect-[9/16] mx-auto rounded-xl overflow-hidden bg-black mb-10">
      <div className="absolute inset-0 pointer-events-none">
        <div id={`short-${videoId}`} className="w-full h-full" />
      </div>

      {!started && (
        <div className="absolute inset-0 z-20 cursor-pointer" onClick={play}>
          <img
            src={`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`}
            alt="Short Thumbnail"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <Play className="text-white w-12 h-12" />
          </div>
        </div>
      )}

      {playerReady && started && (
        <div className="absolute bottom-2 left-2 z-30 flex gap-2">
          <button onClick={pause} className="text-white bg-black/50 p-1 rounded">
            <Pause />
          </button>
        </div>
      )}
    </div>
  );
};


// ✅ Main Page
export default function ForYouPage() {
  return (
    <div className="p-6">
      <div className="mt-8 py-8">
  <Link
    href="/"
    className="inline-block text-blue-600 underline hover:text-blue-800 transition font-medium"
  >
    ← Back to Home
  </Link>
</div>
      <h2 className="text-3xl text-center font-extrabold mb-6 ">Did you just breakup?</h2>

    <h3 className="text-center pb-4">
      Watch these free video guides to help you through it.
    </h3>
    <div className="w-full py-4">

    <YouTubeLong />
    </div>

      <YouTubeShort videoId="swZQE_4x6CY" title="Why Compatibility Is Important" />
    </div>
  );
}
