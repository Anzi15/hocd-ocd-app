"use client";

import { useEffect, useRef, useState } from "react";
import { Play, Pause, RotateCcw, RotateCw } from "lucide-react";

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

// ✅ YouTubeLong Component
const YouTubeLong = ({ videoId, title }: { videoId: string; title: string }) => {
  const playerRef = useRef<any>(null);
  const [playerReady, setPlayerReady] = useState(false);
  const [started, setStarted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  useEffect(() => {
    let interval: any;
    if (playerReady && started) {
      interval = setInterval(() => {
        if (playerRef.current?.getCurrentTime) {
          setCurrentTime(playerRef.current.getCurrentTime());
        }
      }, 500);
    }
    return () => clearInterval(interval);
  }, [playerReady, started]);

  useEffect(() => {
    loadYouTubeAPI().then(() => {
      const container = document.getElementById(`long-${videoId}`);
      if (!container) return;

      playerRef.current = new YT.Player(container, {
        videoId,
        playerVars: { controls: 0, rel: 0, modestbranding: 1 },
        events: {
          onReady: () => {
            setPlayerReady(true);
            setTimeout(() => {
              setDuration(playerRef.current?.getDuration?.() ?? 0);
            }, 300);
          },
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
  const seek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    playerRef.current?.seekTo(time, true);
    setCurrentTime(time);
  };

  return (
    <div className="relative w-full max-w-3xl aspect-video mx-auto rounded-xl overflow-hidden bg-black mb-10">
      <div className="absolute inset-0 pointer-events-none">
        <div id={`long-${videoId}`} className="w-full h-full" />
      </div>

      {/* Play on click only if ready */}
      {!started && playerReady && (
        <div className="absolute inset-0 z-20 cursor-pointer" onClick={play}>
          <img
            src={`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`}
            alt="Long Video Thumbnail"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <Play className="text-white w-16 h-16" />
          </div>
        </div>
      )}

      {/* Custom Controls */}
      {playerReady && started && (
        <div className="absolute bottom-0 inset-x-0 z-30 flex flex-col gap-2 px-4 pb-4">
          <input
            type="range"
            min={0}
            max={duration}
            value={currentTime}
            onChange={seek}
            className="w-full accent-white"
          />
          <div className="flex gap-4 justify-center items-center">
            <button onClick={() => playerRef.current?.seekTo(currentTime - 10, true)} className="text-white">
              <RotateCcw />
            </button>
            <button onClick={isPlaying ? pause : play} className="text-white">
              {isPlaying ? <Pause /> : <Play />}
            </button>
            <button onClick={() => playerRef.current?.seekTo(currentTime + 10, true)} className="text-white">
              <RotateCw />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};


// ✅ Main Page
export default function ForYouPage() {
  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-6">For You</h2>

      <YouTubeLong videoId="uetWVSuVW0U" title="Understanding Breakups" />

      <YouTubeShort videoId="swZQE_4x6CY" title="Why Compatibility Is Important" />
    </div>
  );
}
