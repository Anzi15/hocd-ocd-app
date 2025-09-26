"use client"

import React, { useEffect, useRef, useState } from "react"
import Image from "next/image"
import { Play, Pause, RotateCcw } from "lucide-react"

// ✅ Extend window typing
declare global {
  interface Window {
    onYouTubeIframeAPIReady?: () => void
    YT: any
  }
}

interface VideoPlayerProps {
  videoId: string
  thumbnail?: string
  title?: string
}

export default function VideoPlayer({ videoId, thumbnail, title = "Video" }: VideoPlayerProps) {
  const playerRef = useRef<HTMLDivElement | null>(null)
  const youTubePlayerRef = useRef<any>(null)
  const [isReady, setIsReady] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)

  // Load YouTube Iframe API
  useEffect(() => {
    if (window.YT && window.YT.Player) {
      initializePlayer()
    } else {
      const script = document.createElement("script")
      script.src = "https://www.youtube.com/iframe_api"
      script.async = true
      document.body.appendChild(script)
      ;(window as any).onYouTubeIframeAPIReady = () => {
        initializePlayer()
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Init Player
  const initializePlayer = () => {
    if (playerRef.current && !youTubePlayerRef.current) {
      youTubePlayerRef.current = new window.YT.Player(playerRef.current, {
        videoId,
        playerVars: {
          autoplay: 0,
          controls: 0,
          modestbranding: 1,
          rel: 0,
          mute: 1,
        },
        events: {
          onReady: () => setIsReady(true),
          onStateChange: (event: any) => {
            if (event.data === window.YT.PlayerState.PLAYING) setIsPlaying(true)
            if (event.data === window.YT.PlayerState.PAUSED || event.data === window.YT.PlayerState.ENDED) {
              setIsPlaying(false)
            }
          },
        },
      })
    }
  }

  // Handle Play/Pause toggle
  const handlePlayPause = () => {
    if (!isReady || !youTubePlayerRef.current) return
    const player = youTubePlayerRef.current
    const state = player.getPlayerState()

    player.unMute() // always unmute after click

    if (state === window.YT.PlayerState.PLAYING) {
      player.pauseVideo()
    } else {
      player.playVideo()
    }
  }

  // Handle restart
  const handleRestart = () => {
    if (isReady && youTubePlayerRef.current) {
      youTubePlayerRef.current.seekTo(0)
      youTubePlayerRef.current.playVideo()
    }
  }

  return (
    <div className="relative w-full h-[400px] md:h-[600px] bg-black overflow-hidden rounded-xl">
      {/* Thumbnail */}
      <Image
        src={thumbnail || "/placeholder.svg?height=600&width=800&text=Video+Thumbnail"}
        alt={title}
        fill
        className={`object-cover transition-opacity duration-500 pointer-events-none ${
          isPlaying ? "opacity-0" : "opacity-100"
        }`}
      />

      {/* Overlay Controls */}
      <div className="absolute inset-0 bg-black/50 flex flex-col justify-between z-10">
        <div className="flex justify-between items-center p-4">
          <span className="text-white font-medium">{title}</span>
        </div>

        <div className="flex justify-center items-center pb-12 space-x-6">
          <button
            onClick={handlePlayPause}
            disabled={!isReady}
            className="w-16 h-16 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/40 text-white transition disabled:opacity-50"
          >
            {isPlaying ? <Pause size={32} /> : <Play size={32} />}
          </button>

          <button
            onClick={handleRestart}
            disabled={!isReady}
            className="w-12 h-12 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/40 text-white transition disabled:opacity-50"
          >
            <RotateCcw size={24} />
          </button>
        </div>
      </div>

      {/* YouTube iframe goes here */}
      <div ref={playerRef} className="absolute inset-0 w-full h-full" />
    </div>
  )
}
