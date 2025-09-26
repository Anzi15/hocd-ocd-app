import { useEffect, useRef, useState } from "react";
import { Play, Pause, RotateCcw, RotateCw, Volume2, VolumeX, Maximize } from "lucide-react";

interface YouTubePlayerProps {
  url: string;
  uniqueId?: string;
}

// ✅ Shared YouTube API loader
let ytApiPromise: Promise<void> | null = null;
const loadYouTubeAPI = (): Promise<void> => {
  if (ytApiPromise) return ytApiPromise;

  ytApiPromise = new Promise((resolve) => {
    if ((window as any).YT && (window as any).YT.Player) {
      resolve();
    } else {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      document.body.appendChild(tag);

      const prev = (window as any).onYouTubeIframeAPIReady;
      (window as any).onYouTubeIframeAPIReady = () => {
        if (typeof prev === "function") prev();
        resolve();
      };
    }
  });

  return ytApiPromise;
};

export default function YouTubePlayer({ url, uniqueId }: YouTubePlayerProps) {
  const playerRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [title, setTitle] = useState<string>("YouTube Video");
  const [isPlaying, setIsPlaying] = useState(false);
  const [playerReady, setPlayerReady] = useState(false);
  const [started, setStarted] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(80);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const hideTimeout = useRef<any>(null);

  const videoId = (() => {
    const regex = /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([\w-]{11})/;
    const match = url.match(regex);
    return match ? match[1] : "";
  })();

  const containerId = `yt-player-${uniqueId ?? videoId}`;
  const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;

  // Check if mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Format time display
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Fetch video title
  useEffect(() => {
    if (!videoId) return;
    setIsLoading(true);
    fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`)
      .then(res => res.json())
      .then(data => setTitle(data.title))
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [videoId]);

  // Poll current time
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

  // Handle volume changes
  useEffect(() => {
    if (playerRef.current && playerReady) {
      playerRef.current.setVolume(isMuted ? 0 : volume);
    }
  }, [volume, isMuted, playerReady]);

  // Load YouTube API and create player
  useEffect(() => {
    if (!videoId) return;

    loadYouTubeAPI().then(() => {
      const container = document.getElementById(containerId);
      if (!container) return;

      playerRef.current = new (window as any).YT.Player(container, {
        videoId,
        playerVars: { 
          autoplay: 0, 
          controls: 0, 
          modestbranding: 1, 
          rel: 0, 
          fs: 0,
          iv_load_policy: 3,
          disablekb: 1
        },
        events: {
          onReady: () => {
            setPlayerReady(true);
            setDuration(playerRef.current.getDuration());
            playerRef.current.setVolume(volume);
          },
          onStateChange: (event: any) => {
            setIsPlaying(event.data === (window as any).YT.PlayerState.PLAYING);
            if (event.data === (window as any).YT.PlayerState.PLAYING) {
              setStarted(true);
            }
          },
        },
      });
    });

    return () => clearTimeout(hideTimeout.current);
  }, [videoId, containerId]);

  // Fullscreen handling
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    if (!containerRef.current) return;

    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(err => {
        console.log(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  const play = () => {
    if (playerReady && playerRef.current?.playVideo) {
      setStarted(true);
      playerRef.current.playVideo();
      triggerControlsAutoHide();
    }
  };

  const pause = () => { 
    playerRef.current?.pauseVideo(); 
    triggerControlsAutoHide(); 
  };

  const forward = () => { 
    playerRef.current?.seekTo(playerRef.current.getCurrentTime() + 10, true); 
    triggerControlsAutoHide(); 
  };

  const backward = () => { 
    playerRef.current?.seekTo(Math.max(playerRef.current.getCurrentTime() - 10, 0), true); 
    triggerControlsAutoHide(); 
  };

  const seek = (e: React.ChangeEvent<HTMLInputElement>) => { 
    playerRef.current?.seekTo(parseFloat(e.target.value), true); 
    setCurrentTime(parseFloat(e.target.value)); 
    triggerControlsAutoHide(); 
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseInt(e.target.value);
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const triggerControlsAutoHide = () => { 
    setShowControls(true); 
    clearTimeout(hideTimeout.current); 
    hideTimeout.current = setTimeout(() => setShowControls(false), isMobile ? 4000 : 3000); 
  };

  const handleContainerClick = (e: React.MouseEvent) => {
    // Only handle clicks if we're not clicking on actual controls
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('input')) {
      return;
    }
    
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  };

  return (
    <div 
      ref={containerRef}
      className="relative w-full max-w-4xl mx-auto aspect-video rounded-xl overflow-hidden bg-black shadow-lg transition-all duration-300"
      onMouseEnter={!isMobile ? triggerControlsAutoHide : undefined}
      onMouseLeave={!isMobile ? () => setShowControls(false) : undefined}
      onTouchStart={isMobile ? triggerControlsAutoHide : undefined}
      onMouseMove={!isMobile ? triggerControlsAutoHide : undefined}
    >
      {/* YouTube Player Container - Now clickable */}
      <div className="absolute top-0 left-0 w-full h-full z-0">
        <div id={containerId} className="w-full h-full" />
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/50">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        </div>
      )}

      {/* Thumbnail with Play Button - Enhanced for mobile */}
      {!started && !isLoading && (
        <div 
          className="absolute inset-0 z-20 cursor-pointer flex flex-col"
          onClick={play}
        >
          <img 
            src={thumbnailUrl} 
            alt="Video Thumbnail" 
            className="w-full h-full object-cover flex-1" 
          />
          
          {/* Title displayed prominently before playing */}
          <div className="absolute top-0 left-0 right-0 p-3 bg-gradient-to-b from-black/70 to-transparent">
            <h4 className="text-white font-semibold text-sm sm:text-base md:text-lg lg:text-xl truncate px-2">
              {title}
            </h4>
          </div>
          
          <div className="absolute inset-0 bg-black/30 flex flex-col items-center justify-center p-4">
            {/* Play Button */}
            <div className="bg-red-600 rounded-full p-3 sm:p-4 mb-4 transform hover:scale-110 active:scale-95 transition-transform duration-200">
              <Play className="text-white w-6 h-6 sm:w-8 sm:h-8" />
            </div>
            
            {/* Video Info for mobile */}
            {isMobile && (
              <div className="text-center text-white mt-2">
                <p className="text-sm font-medium">Tap to play</p>
                <p className="text-xs opacity-80 mt-1">Swipe for controls</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Video Title (when playing) */}
      {started && (
        <div className={`absolute top-0 left-0 right-0 z-15 p-2 sm:p-3 bg-gradient-to-b from-black/70 to-transparent transition-opacity duration-300 ${
          showControls ? 'opacity-100' : 'opacity-0'
        }`}>
          <h4 className="text-white font-semibold text-xs sm:text-sm md:text-base truncate">
            {title}
          </h4>
        </div>
      )}

      {/* Controls Overlay - Only overlay when needed */}
      {playerReady && started && (
        <div 
          className={`absolute inset-0 z-20 flex flex-col justify-end transition-opacity duration-300 ${
            showControls ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
          onClick={handleContainerClick}
        >
          
          {/* Progress Bar */}
          <div className="px-2 sm:px-3 pb-1 sm:pb-2" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-1 sm:gap-2 text-white text-xs mb-1">
              <span className="text-xs min-w-[35px]">{formatTime(currentTime)}</span>
              <div className="flex-1 relative">
                <input 
                  type="range" 
                  min={0} 
                  max={duration} 
                  value={currentTime} 
                  onChange={seek}
                  className="w-full h-1 sm:h-1.5 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
                  onClick={(e) => e.stopPropagation()}
                />
                <div 
                  className="absolute top-0 left-0 h-1 sm:h-1.5 bg-red-600 rounded-lg pointer-events-none"
                  style={{ width: `${(currentTime / duration) * 100}%` }}
                />
              </div>
              <span className="text-xs min-w-[35px]">{formatTime(duration)}</span>
            </div>
          </div>

          {/* Control Buttons */}
          <div 
            className="bg-gradient-to-t from-black/90 to-transparent p-2 sm:p-3"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 sm:gap-3">
                {/* Playback Controls */}
                <div className="flex items-center gap-1 sm:gap-2">
                  <button 
                    onClick={backward}
                    className="text-white hover:text-gray-300 transition-colors p-1 sm:p-2 rounded-full hover:bg-white/10 active:bg-white/20"
                    title="Rewind 10s"
                  >
                    <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                  
                  <button 
                    onClick={isPlaying ? pause : play}
                    className="text-white hover:text-gray-300 transition-colors p-2 sm:p-3 rounded-full hover:bg-white/10 active:bg-white/20 bg-white/20"
                    title={isPlaying ? "Pause" : "Play"}
                  >
                    {isPlaying ? (
                      <Pause className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
                    ) : (
                      <Play className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
                    )}
                  </button>
                  
                  <button 
                    onClick={forward}
                    className="text-white hover:text-gray-300 transition-colors p-1 sm:p-2 rounded-full hover:bg-white/10 active:bg-white/20"
                    title="Forward 10s"
                  >
                    <RotateCw className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                </div>

                {/* Volume Controls (hidden on very small screens) */}
                {!isMobile || window.innerWidth > 400 ? (
                  <div className="flex items-center gap-1 sm:gap-2 ml-1 sm:ml-2">
                    <button 
                      onClick={toggleMute}
                      className="text-white hover:text-gray-300 transition-colors p-1"
                      title={isMuted ? "Unmute" : "Mute"}
                    >
                      {isMuted ? (
                        <VolumeX className="w-4 h-4 sm:w-5 sm:h-5" />
                      ) : (
                        <Volume2 className="w-4 h-4 sm:w-5 sm:h-5" />
                      )}
                    </button>
                    
                    <div className="w-12 sm:w-16 md:w-20">
                      <input 
                        type="range" 
                        min={0} 
                        max={100} 
                        value={isMuted ? 0 : volume}
                        onChange={handleVolumeChange}
                        className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                  </div>
                ) : (
                  <button 
                    onClick={toggleMute}
                    className="text-white hover:text-gray-300 transition-colors p-1 ml-1"
                    title={isMuted ? "Unmute" : "Mute"}
                  >
                    {isMuted ? (
                      <VolumeX className="w-4 h-4" />
                    ) : (
                      <Volume2 className="w-4 h-4" />
                    )}
                  </button>
                )}
              </div>

              {/* Fullscreen Button */}
              <button 
                onClick={toggleFullscreen}
                className="text-white hover:text-gray-300 transition-colors p-1 sm:p-2 rounded-full hover:bg-white/10 active:bg-white/20"
                title="Fullscreen"
              >
                <Maximize className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Tap Indicator */}
      {isMobile && started && !showControls && (
        <div 
          className="absolute bottom-4 left-0 right-0 z-10 flex justify-center pointer-events-none"
          onClick={triggerControlsAutoHide}
        >
          <div className="bg-black/50 rounded-full px-3 py-1">
            <span className="text-white text-xs">Tap for controls</span>
          </div>
        </div>
      )}

      {/* Custom CSS for slider styling */}
      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: ${isMobile ? '10px' : '12px'};
          width: ${isMobile ? '10px' : '12px'};
          border-radius: 50%;
          background: #dc2626;
          cursor: pointer;
          opacity: 0;
          transition: opacity 0.2s;
        }

        .slider:hover::-webkit-slider-thumb,
        .slider:active::-webkit-slider-thumb {
          opacity: 1;
        }

        .slider::-moz-range-thumb {
          height: ${isMobile ? '10px' : '12px'};
          width: ${isMobile ? '10px' : '12px'};
          border-radius: 50%;
          background: #dc2626;
          cursor: pointer;
          border: none;
          opacity: 0;
          transition: opacity 0.2s;
        }

        .slider:hover::-moz-range-thumb,
        .slider:active::-moz-range-thumb {
          opacity: 1;
        }
      `}</style>
    </div>
  );
}