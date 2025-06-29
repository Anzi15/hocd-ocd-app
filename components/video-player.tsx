"use client"

import { useEffect, useRef, useState } from "react"
import { Play, Pause, RotateCcw, RotateCw } from "lucide-react"
import Image from "next/image"

interface VideoPlayerProps {
  url: string
  title: string
  thumbnail?: string
}

export default function VideoPlayer({ url, title, thumbnail }: VideoPlayerProps) {
  const playerRef = useRef<any>(null)
  const youTubePlayerRef = useRef<any>(null)

  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [isReady, setIsReady] = useState(false)

  const getVideoId = (youtubeUrl: string | undefined) => {
    if (!youtubeUrl) return null

    try {
      const urlObj = new URL(youtubeUrl)
      const vParam = urlObj.searchParams.get("v")
      if (vParam) return vParam

      const pathnameParts = urlObj.pathname.split("/")
      return pathnameParts[pathnameParts.length - 1]
    } catch {
      return null
    }
  }

  const loadYouTubeAPI = () => {
    return new Promise<void>((resolve) => {
      if (window.YT && window.YT.Player) return resolve()

      const tag = document.createElement("script")
      tag.src = "https://www.youtube.com/iframe_api"
      document.body.appendChild(tag)

      window.onYouTubeIframeAPIReady = () => resolve()
    })
  }

  const initializePlayer = async () => {
    await loadYouTubeAPI()

    const videoId = getVideoId(url)
    if (!videoId) return

    new window.YT.Player(playerRef.current!, {
      videoId,
      playerVars: {
        autoplay: 1,
        controls: 0,
        modestbranding: 1,
        rel: 0,
        mute: 1,
      },
      events: {
        onReady: (event: any) => {
          setDuration(event.target.getDuration())
          setIsReady(true)
          event.target.playVideo()
          setIsPlaying(true)

          youTubePlayerRef.current = event.target
        },
        onStateChange: (event: any) => {
          if (event.data === window.YT.PlayerState.PLAYING) setIsPlaying(true)
          if (
            event.data === window.YT.PlayerState.PAUSED ||
            event.data === window.YT.PlayerState.ENDED
          )
            setIsPlaying(false)
        },
      },
    })
  }

  const formatTime = (time: number) =>
    isNaN(time) ? "0:00" : `${Math.floor(time / 60)}:${String(Math.floor(time % 60)).padStart(2, "0")}`

  const handlePlayPause = () => {
    if (!isReady || !youTubePlayerRef.current) return

    youTubePlayerRef.current.unMute()
    const state = youTubePlayerRef.current.getPlayerState()

    if (state === window.YT.PlayerState.PLAYING) {
      youTubePlayerRef.current.pauseVideo()
    } else {
      youTubePlayerRef.current.playVideo()
    }
  }

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value)
    youTubePlayerRef.current.seekTo(value, true)
    setCurrentTime(value)
  }

  const handleSkip = (secs: number) => {
    const time = youTubePlayerRef.current.getCurrentTime()
    const newTime = Math.max(0, time + secs)
    youTubePlayerRef.current.seekTo(newTime, true)
    setCurrentTime(newTime)
  }

  useEffect(() => {
    if (url) initializePlayer()
    return () => {
      if (youTubePlayerRef.current?.destroy) youTubePlayerRef.current.destroy()
    }
  }, [url])

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isReady) {
      interval = setInterval(() => {
        if (youTubePlayerRef.current) {
          const time = youTubePlayerRef.current.getCurrentTime()
          const dur = youTubePlayerRef.current.getDuration()
          setCurrentTime(time)
          setDuration(dur)
        }
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isReady])

  return (
    <div className="relative bg-black rounded-lg overflow-hidden aspect-[3/4] group">
      <Image
        src={thumbnail || "/placeholder.svg?height=600&width=800&text=Video+Thumbnail"}
        alt={title}
        fill
        className="object-cover pointer-events-none"
      />

      <div className="absolute inset-0 bg-black/50 flex flex-col justify-between z-10">
        <div className="p-4">
          <h3 className="text-white font-semibold text-lg">{title}</h3>
        </div>

        <div className="flex flex-col gap-2 items-center p-4">
          <div className="flex gap-4 items-center">
            <button onClick={() => handleSkip(-10)} className="bg-white/80 p-2 rounded-full">
              <RotateCcw className="w-5 h-5 text-black" />
            </button>
            <button
              onClick={handlePlayPause}
              className="bg-white p-4 rounded-full hover:scale-105 transition"
            >
              {isPlaying ? (
                <Pause className="w-6 h-6 text-black" />
              ) : (
                <Play className="w-6 h-6 text-black ml-[2px]" />
              )}
            </button>
            <button onClick={() => handleSkip(10)} className="bg-white/80 p-2 rounded-full">
              <RotateCw className="w-5 h-5 text-black" />
            </button>
          </div>

          <div className="w-full flex items-center gap-2 text-white text-sm">
            <span className="w-10 text-right">{formatTime(currentTime)}</span>
            <input
              type="range"
              min={0}
              max={duration || 100}
              step="0.1"
              value={currentTime}
              onChange={handleSeek}
              className="flex-grow accent-white"
            />
            <span className="w-10">{formatTime(duration)}</span>
          </div>
        </div>
      </div>

      <div ref={playerRef} className="absolute w-0 h-0 overflow-hidden pointer-events-none" />
    </div>
  )
}
