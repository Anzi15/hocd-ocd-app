"use client";

import { useEffect, useRef, useState } from "react";
import { Play, Pause, RotateCcw, RotateCw, ArrowLeft, Sparkles, Brain, Video } from "lucide-react";
import Link from "next/link";
import YouTubeLong from "@/components/FreeBieLong";
import YouTubeCustomPlayer from "@/components/IntroVide";
import YouTubePlayer from "@/components/FreeBieLong";

// ✅ YouTube Iframe API Loader (fixed: works for multiple players)
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

const freebieLongVideos = [
  { 
    url: "https://youtu.be/Tt24GPrv6Fo", 
    title: "Understanding OCD Patterns",
    description: "Learn to recognize common OCD thought patterns and behaviors"
  },
  { 
    url: "https://youtu.be/1WMnN2tjw5k", 
    title: "HOCD Management Techniques",
    description: "Effective strategies for managing HOCD symptoms"
  },
  { 
    url: "https://youtu.be/BmHZNG682ew", 
    title: "Mindfulness for OCD",
    description: "How mindfulness can help break the OCD cycle"
  },
  { 
    url: "https://youtu.be/bld7HFUvn2g", 
    title: "Cognitive Restructuring",
    description: "Changing your relationship with intrusive thoughts"
  },
  { 
    url: "https://youtu.be/o0gVYaSEBQM", 
    title: "Exposure Therapy Basics",
    description: "Introduction to exposure and response prevention"
  },
  { 
    url: "https://youtu.be/bld7HFUvn2g", 
    title: "Relapse Prevention",
    description: "Maintaining progress and preventing setbacks"
  },
];    

// ✅ YouTubeShort Component
const YouTubeShort = ({ videoId, title, description }: { videoId: string; title: string; description: string }) => {
  const playerRef = useRef<any>(null);
  const [playerReady, setPlayerReady] = useState(false);
  const [started, setStarted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    loadYouTubeAPI().then(() => {
      const container = document.getElementById(`short-${videoId}`);
      if (!container) return;

      playerRef.current = new (window as any).YT.Player(container, {
        videoId,
        playerVars: { controls: 0, rel: 0, modestbranding: 1 },
        events: {
          onReady: () => setPlayerReady(true),
          onStateChange: (e: any) => {
            if (e.data === (window as any).YT.PlayerState.PLAYING) setIsPlaying(true);
            if (e.data === (window as any).YT.PlayerState.PAUSED) setIsPlaying(false);
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
    <div className="group relative w-full max-w-md aspect-[9/16] mx-auto rounded-2xl overflow-hidden bg-black shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105 mb-8">
      {/* Gradient Border Effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
      
      <div className="absolute inset-0 z-0">
        <div id={`short-${videoId}`} className="w-full h-full pointer-events-auto" />
      </div>

      {!started && (
        <div className="absolute inset-0 z-20 cursor-pointer" onClick={play}>
          <img
            src={`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`}
            alt="Short Thumbnail"
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-black/40 flex items-center justify-center">
            <div className="text-center">
              <div className="bg-white/20 backdrop-blur-sm rounded-full p-4 inline-flex mb-4 group-hover:scale-110 transition-transform duration-300">
                <Play className="text-white w-8 h-8" fill="white" />
              </div>
              <div className="bg-black/50 backdrop-blur-sm rounded-lg p-4 mx-4">
                <h4 className="text-white font-bold text-lg mb-2">{title}</h4>
                <p className="text-white/80 text-sm">{description}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {playerReady && started && (
        <div className="absolute bottom-4 left-4 z-30 flex gap-2">
          <button 
            onClick={isPlaying ? pause : play} 
            className="text-white bg-black/50 backdrop-blur-sm p-3 rounded-full hover:bg-black/70 transition-all duration-200 hover:scale-110"
          >
            {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" fill="white" />}
          </button>
        </div>
      )}
      
      {/* Enhanced Video Title Section */}
      <div className="absolute bottom-0 left-0 right-0 z-30 p-6 bg-gradient-to-t from-black/90 via-black/50 to-transparent">
        <div className="flex items-start space-x-3">
          <div className="bg-primary/20 p-2 rounded-lg">
            <Video className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h4 className="text-white font-bold text-lg leading-tight mb-1">
              {title}
            </h4>
            <p className="text-white/70 text-sm leading-relaxed">
              {description}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// ✅ Main Page
export default function ForYouPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-100/20 via-transparent to-transparent"></div>
      
      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Enhanced Header */}
        <div className="text-center mb-12">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-all duration-300 group mb-8"
          >
            <div className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl px-4 py-2 shadow-sm hover:shadow-md transition-shadow group-hover:scale-105">
              <ArrowLeft className="w-4 h-4 mr-2 inline" />
              <span className="font-medium">Back to Home</span>
            </div>
          </Link>

          {/* Hero Section */}
          <div className="max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-primary/10 to-purple-100 rounded-full px-6 py-2 mb-6">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">Free Resources</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-4">
              Free OCD & HOCD Guides
            </h1>
            
            <div className="w-24 h-1.5 bg-gradient-to-r from-primary to-purple-500 rounded-full mx-auto mb-6"></div>
            
            <p className="text-xl text-gray-600 leading-relaxed max-w-3xl mx-auto">
              Watch these complimentary video guides to better understand and manage OCD and HOCD. 
              Each video offers practical insights and techniques from mental health professionals.
            </p>
          </div>
        </div>

        {/* Video Grid Section */}
        <div className="max-w-7xl mx-auto">
          {/* Featured Long Videos */}
          <div className="mb-16">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-800 mb-4 flex items-center justify-center gap-3">
                <Brain className="w-8 h-8 text-primary" />
                Comprehensive Video Guides
              </h2>
              <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                In-depth sessions covering various aspects of OCD and HOCD management
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
              {freebieLongVideos.map((video, index) => (
                <div key={index} className="group relative">
                  {/* Card with Gradient Border */}
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-3xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10"></div>
                  
                  <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] border border-white/50 overflow-hidden">
                    <YouTubePlayer
                      url={video.url}
                      uniqueId={`freebie-long-${index}`}
                    />
                    <div className="p-6">
                      <div className="flex items-start gap-3">
                        <div className="bg-primary/10 p-2 rounded-lg flex-shrink-0">
                          <Video className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-bold text-lg text-gray-800 mb-2">
                            {video.title}
                          </h3>
                          <p className="text-gray-600 text-sm leading-relaxed">
                            {video.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Call to Action */}
          <div className="text-center bg-white/60 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/50 max-w-4xl mx-auto">
            <div className="bg-gradient-to-r from-primary/10 to-purple-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Sparkles className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-4">
              Ready to Dive Deeper?
            </h3>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Explore our comprehensive learning chapters and personalized guidance 
              to continue your journey towards mental wellness.
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-primary to-primary/90 text-white px-8 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 hover:scale-105"
            >
              <Brain className="w-5 h-5" />
              Start Your Journey
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="relative z-10 text-center py-8 mt-12">
        <div className="max-w-2xl mx-auto px-4">
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-white/50">
            <p className="text-gray-600 text-sm">
              These free resources are provided to support your mental health journey. 
              For personalized guidance, consider exploring our full program.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}