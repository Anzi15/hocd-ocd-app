"use client";

import { useEffect, useRef, useState } from "react";
import { Play, Pause, RotateCcw, RotateCw } from "lucide-react";

const YOUTUBE_ID = "CjNRgEMrlrg"; // Your YouTube video ID
const THUMBNAIL_URL = "https://img.youtube.com/vi/CjNRgEMrlrg/maxresdefault.jpg"; // Or your custom URL

export default function YouTubeCustomPlayer() {
  const playerRef = useRef<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playerReady, setPlayerReady] = useState(false);
  const [started, setStarted] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const hideTimeout = useRef<any>(null);

  // Poll current time
  useEffect(() => {
    let interval: any;
    if (playerReady && started) {
      interval = setInterval(() => {
        if (playerRef.current) {
          setCurrentTime(playerRef.current.getCurrentTime());
        }
      }, 500);
    }
    return () => clearInterval(interval);
  }, [playerReady, started]);

  // Load YouTube API
  useEffect(() => {
    const loadYT = () => {
      if (window.YT && window.YT.Player) {
        createPlayer();
      } else {
        const tag = document.createElement("script");
        tag.src = "https://www.youtube.com/iframe_api";
        document.body.appendChild(tag);
        window.onYouTubeIframeAPIReady = createPlayer;
      }
    };

    loadYT();
  }, []);

  const createPlayer = () => {
    playerRef.current = new YT.Player("yt-player", {
      videoId: YOUTUBE_ID,
      playerVars: {
        autoplay: 0,
        controls: 0,
        modestbranding: 1,
        rel: 0,
        showinfo: 0,
        fs: 0,
      },
      events: {
        onReady: () => {
          setPlayerReady(true);
          setDuration(playerRef.current.getDuration());
        },
        onStateChange: (event) => {
          if (event.data === YT.PlayerState.PAUSED) setIsPlaying(false);
          if (event.data === YT.PlayerState.PLAYING) setIsPlaying(true);
        },
      },
    });
  };

  const play = () => {
    if (playerReady) {
      setStarted(true);
      playerRef.current.playVideo();
      triggerControlsAutoHide();
    }
  };

  const pause = () => {
    if (playerReady) {
      playerRef.current.pauseVideo();
      triggerControlsAutoHide();
    }
  };

  const forward = () => {
    if (playerReady) {
      const current = playerRef.current.getCurrentTime();
      playerRef.current.seekTo(current + 10, true);
      triggerControlsAutoHide();
    }
  };

  const backward = () => {
    if (playerReady) {
      const current = playerRef.current.getCurrentTime();
      playerRef.current.seekTo(current - 10, true);
      triggerControlsAutoHide();
    }
  };

  const seek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (playerReady) {
      const time = parseFloat(e.target.value);
      playerRef.current.seekTo(time, true);
      setCurrentTime(time);
      triggerControlsAutoHide();
    }
  };

  const triggerControlsAutoHide = () => {
    setShowControls(true);
    clearTimeout(hideTimeout.current);
    hideTimeout.current = setTimeout(() => {
      setShowControls(false);
    }, 2500);
  };

  const handleTap = () => {
    setShowControls((prev) => {
      if (!prev) triggerControlsAutoHide();
      return true;
    });
  };

  return (
    <div
      className="relative w-full max-w-3xl mx-auto aspect-video rounded-xl overflow-hidden bg-black"
      onClick={handleTap}
      onMouseMove={triggerControlsAutoHide}
    >
      {/* YouTube iframe (covered completely by overlay) */}
      <div id="yt-player" className="absolute top-0 left-0 w-full h-full pointer-events-none z-0" />
      <div className="absolute top-0 left-0 w-full h-full bg-transparent z-10 pointer-events-auto" />

      {/* ▶️ Show custom thumbnail until started */}
      {!started && (
        <div
          className="absolute inset-0 z-20 cursor-pointer"
          onClick={play}
        >
          <img
            src={THUMBNAIL_URL}
            alt="Video Thumbnail"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <Play className="text-white w-16 h-16" />
          </div>
        </div>
      )}

      {/* Controls with fade transition */}
      {playerReady && started && (
        <div
          className={`absolute inset-x-0 bottom-0 z-20 flex flex-col gap-2 px-4 pb-4 transition-opacity duration-300 ${
            showControls ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        >
          {/* Seekbar */}
          <input
            type="range"
            min={0}
            max={duration}
            value={currentTime}
            onChange={seek}
            className="w-full accent-white cursor-pointer"
          />
          {/* Buttons */}
          <div className="flex gap-4 justify-center items-center">
            <button onClick={backward} className="text-white">
              <RotateCcw />
            </button>
            <button onClick={isPlaying ? pause : play} className="text-white">
              {isPlaying ? <Pause /> : <Play />}
            </button>
            <button onClick={forward} className="text-white">
              <RotateCw />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
