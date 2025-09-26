"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Play,
  BookOpen,
  Library,
  Settings,
  LogIn,
  TableOfContents,
  TvMinimalPlay,
  Coins,
  ConeIcon,
  Brain,
  Sparkles,
  BookMarked,
  Headphones,
  Gift,
  Star,
  Users,
  Clock,
  Target,
  Shield,
  Heart,
  ArrowRight,
  ChevronRight,
  BookText,
  Video,
  Podcast,
  Download,
  Share2,
  Bookmark,
  ThumbsUp
} from "lucide-react";
import IntroVideo from "@/components/IntroVide";
import { loadProgress, loadSettings } from "@/lib/storage";
import { auth, db } from "@/lib/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { signOut } from "firebase/auth";
import AuthModal from "@/components/auth-modal";
import SettingsPanel from "@/components/settings-panel";
import VideoPlayer from "@/components/video-player";
import AnimatedBackground from "@/components/animated-background";
import type { AppSettings } from "@/lib/types";
import Link from "next/link";
import Image from "next/image";
import { doc, getDoc, onSnapshot } from "firebase/firestore";

export default function HomePage() {
  const router = useRouter();
  const [user] = useAuthState(auth);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [hasLibraryItems, setHasLibraryItems] = useState(false);
  const [settings, setSettings] = useState<AppSettings>({
    soundEnabled: true,
    primaryColor: "blue",
  });
  const [userProgress, setUserProgress] = useState<any>({});
  const [activeFeature, setActiveFeature] = useState(0);

  useEffect(() => {
    // Load settings and apply theme
    const savedSettings = loadSettings();
    setSettings(savedSettings);

    // Apply theme color
    const colors = {
      blue: "#3b82f6",
      green: "#10b981",
      purple: "#8b5cf6",
      orange: "#f97316",
    };
    document.documentElement.style.setProperty(
      "--primary-color",
      colors[savedSettings.primaryColor as keyof typeof colors]
    );
  }, []);

  useEffect(() => {
    // Check if user has any library items from Firebase
    const checkLibrary = async () => {
      if (!user) {
        setHasLibraryItems(false);
        return;
      }

      try {
        const userRef = doc(db, "users", user.uid);
        
        // Set up real-time listener for library updates
        const unsubscribe = onSnapshot(userRef, (docSnap) => {
          if (docSnap.exists()) {
            const userData = docSnap.data();
            const userLibrary = userData.library || [];
            setHasLibraryItems(userLibrary.length > 0);
            setUserProgress(userData.progress || {});
          } else {
            setHasLibraryItems(false);
            setUserProgress({});
          }
        });

        // Cleanup listener on unmount
        return () => unsubscribe();
      } catch (error) {
        console.error("Error checking library:", error);
        setHasLibraryItems(false);
      }
    };

    checkLibrary();
  }, [user]);

  // Feature carousel auto-rotate
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % features.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const playButtonSound = () => {
    if (settings.soundEnabled) {
      const audioContext = new (window.AudioContext ||
        (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = 600;
      oscillator.type = "sine";

      gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(
        0.01,
        audioContext.currentTime + 0.15
      );

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.15);
    }
  };

  useEffect(() => {
    router.prefetch("/chapter/chapter1");
    router.prefetch("/chapter/chapter2");
    router.prefetch("/chapter/chapter3");
    router.prefetch("/chapter/chapter4");
    router.prefetch("/chapter/chapter5");
    router.prefetch("/chapter/chapter6");
    router.prefetch("/chapter/chapters");
  }, [router]);

  const handleStart = () => {
    playButtonSound();

    const progress = loadProgress();
    const lastChapter = Object.keys(progress).pop();
    const nextChapter = lastChapter
      ? `chapter${parseInt(lastChapter.replace("chapter", "")) + 1}`
      : "chapter1";

    const target = lastChapter
      ? `/chapter/${nextChapter}`
      : "/chapter/chapter1";

    // Detect if running inside Median (or any WebView)
    const isInApp = /Median/i.test(navigator.userAgent);

    if (isInApp) {
      // Hard redirect = faster inside app
      window.location.href = target;
    } else {
      // Don't await, fire and forget
      router.push(target);
    }
  };

  const handleChooseChapter = () => {
    playButtonSound();
    router.push("/chapters");
  };

  const handleLibrary = () => {
    playButtonSound();
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    router.push("/library");
  };

  const handleSignOut = async () => {
    playButtonSound();
    await signOut(auth);
  };

  const getUserInitials = (email: string) => {
    return email.split("@")[0].slice(0, 2).toUpperCase();
  };

  const getProgressPercentage = () => {
    const totalChapters = 6;
    const completedChapters = Object.keys(userProgress).filter(
      chapter => userProgress[chapter]?.completed
    ).length;
    return Math.round((completedChapters / totalChapters) * 100);
  };

  const features = [
    {
      icon: <Shield className="h-8 w-8" />,
      title: "Evidence-Based Methods",
      description: "Proven techniques backed by scientific research"
    },
    {
      icon: <Heart className="h-8 w-8" />,
      title: "Compassionate Approach",
      description: "Gentle guidance tailored to your unique journey"
    },
    {
      icon: <Target className="h-8 w-8" />,
      title: "Structured Progress",
      description: "Step-by-step path to sustainable recovery"
    },
    {
      icon: <Users className="h-8 w-8" />,
      title: "Community Support",
      description: "Connect with others on similar journeys"
    }
  ];

  const resources = [
    {
      icon: <BookText className="h-6 w-6" />,
      title: "Workbook Exercises",
      description: "Interactive worksheets and activities",
      color: "from-blue-500 to-blue-600"
    },
    {
      icon: <Video className="h-6 w-6" />,
      title: "Video Guides",
      description: "Visual explanations and demonstrations",
      color: "from-purple-500 to-purple-600"
    },
    {
      icon: <Podcast className="h-6 w-6" />,
      title: "Audio Sessions",
      description: "Listen and learn on the go",
      color: "from-green-500 to-green-600"
    },
    {
      icon: <Download className="h-6 w-6" />,
      title: "Downloadable Resources",
      description: "Offline access to all materials",
      color: "from-orange-500 to-orange-600"
    }
  ];

  const testimonials = [
    {
      name: "Sarah K.",
      text: "This guide transformed my relationship with intrusive thoughts. Life-changing!",
      rating: 5
    },
    {
      name: "Michael T.",
      text: "The structured approach made recovery feel achievable for the first time.",
      rating: 5
    },
    {
      name: "Jessica L.",
      text: "Finally found something that actually works. Thank you!",
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen relative overflow-hidden">
      <AnimatedBackground />

      {/* Enhanced Header */}
      <header className="relative z-20">
        <div className="backdrop-blur-md bg-white/80 bg-gradient-to-r from-white/95 to-white/80 shadow-sm border-b border-white/20">
          <div className="container mx-auto px-4 py-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl blur-sm"></div>
                  <Brain
                    className="h-10 w-10 relative z-10"
                    style={{ color: "var(--primary-color)" }}
                  />
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent font-heading">
                    OCD GUIDE
                  </h1>
                  <div className="h-1 w-12 bg-gradient-to-r from-primary to-primary/60 rounded-full mt-1"></div>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                {/* Progress Indicator for logged-in users */}
                {user && Object.keys(userProgress).length > 0 && (
                  <div className="hidden md:flex items-center space-x-2 bg-white/50 rounded-lg px-3 py-2 border border-white/20">
                    <div className="w-8 h-8 bg-gradient-to-r from-primary to-primary/80 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-bold">{getProgressPercentage()}%</span>
                    </div>
                    <div className="text-sm">
                      <div className="font-medium text-gray-700">Progress</div>
                      <div className="w-16 bg-gray-200 rounded-full h-1">
                        <div 
                          className="bg-primary h-1 rounded-full transition-all duration-300"
                          style={{ width: `${getProgressPercentage()}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                )}

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowSettings(true)}
                  className="relative overflow-hidden group backdrop-blur-sm bg-white/50 hover:bg-white/70 border border-white/20 rounded-xl transition-all duration-300 hover:scale-105"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <Settings className="h-5 w-5 relative z-10" />
                </Button>

                {user ? (
                  <div className="flex items-center space-x-3">
                    <div className="text-right hidden sm:block">
                      <p className="text-sm font-medium text-gray-700 font-body">
                        {user.displayName || user.email?.split("@")[0]}
                      </p>
                      <p className="text-xs text-gray-500 font-body">Welcome back</p>
                    </div>
                    <Avatar
                      className="h-10 w-10 cursor-pointer relative group border-2 border-white/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                      onClick={handleSignOut}
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <AvatarImage src={user.photoURL || undefined} />
                      <AvatarFallback className="text-sm font-medium font-body bg-gradient-to-br from-gray-100 to-gray-200">
                        {getUserInitials(user.email || "U")}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                ) : (
                  <Button
                    onClick={() => setShowAuthModal(true)}
                    className="relative overflow-hidden group bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 text-white rounded-xl px-4 py-2 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
                  >
                    <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <LogIn className="h-4 w-4 mr-2 relative z-10" />
                    <span className="relative z-10 font-body">Login</span>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content - Expanded */}
      <main className="relative z-10 container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto space-y-16">
          {/* Hero Section with Enhanced Video Card */}
          <div className="relative">
            <div className="absolute -inset-4 bg-gradient-to-r from-primary/10 via-transparent to-primary/5 rounded-3xl blur-xl opacity-50"></div>
            <Card className="relative overflow-hidden border-0 shadow-2xl bg-gradient-to-br from-white to-gray-50/80 backdrop-blur-sm rounded-3xl">
              {/* Ribbon Banner */}
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1 w-64 bg-gradient-to-r from-primary to-primary/90 text-white text-sm font-bold py-2 px-6 rounded-b-lg shadow-lg z-20">
                <div className="flex items-center justify-center space-x-2">
                  <Sparkles className="h-4 w-4" />
                  <span>Introductory Guide</span>
                </div>
              </div>
              
              <CardContent className="p-0">
                <div className="relative">
                  <Image
                    src={"/The ultimate hocd and ocd guide.png"}
                    width={720}
                    height={840}
                    alt="Talk to Mehran"
                    className="w-full aspect-video object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
                </div>
                
                <div className="p-8">
                  <div className="text-center mb-6">
                    <h2 className="text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-3 font-heading">
                      The Ultimate OCD Cure
                    </h2>
                    <div className="w-20 h-1 bg-gradient-to-r from-primary to-primary/60 rounded-full mx-auto mb-4"></div>
                    <p className="text-lg text-gray-600 leading-relaxed font-body max-w-2xl mx-auto">
                      Are intrusive thoughts or obsessive doubts taking over your mind? Feeling anxious, confused, or trapped in endless "what ifs"? You're not alone and support is here.
                    </p>
                  </div>

                  <div className="text-center mb-6">
                    <h3 className="text-xl font-semibold text-gray-700 mb-4 font-heading flex items-center justify-center">
                      <TvMinimalPlay className="h-5 w-5 mr-2 text-primary" />
                      Watch The Introductory Video
                    </h3>
                    <div className="max-w-4xl mx-auto rounded-2xl overflow-hidden shadow-2xl border-4 border-white aspect-video relative">
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent rounded-2xl"></div>
                      <IntroVideo />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Enhanced Action Buttons Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Start Learning Button */}
            <button
              onClick={handleStart}
              className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 text-white p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 h-32"
            >
              <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10 flex flex-col items-center justify-center h-full space-y-2">
                <div className="bg-white/20 p-3 rounded-full group-hover:scale-110 transition-transform duration-300">
                  <Play className="h-6 w-6" />
                </div>
                <span className="text-lg font-semibold font-heading text-center">Start Learning</span>
              </div>
            </button>

            {/* Choose Chapter Button */}
            <button
              onClick={handleChooseChapter}
              className="group relative overflow-hidden rounded-2xl bg-white border border-gray-100 hover:border-primary/20 p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 h-32"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10 flex flex-col items-center justify-center h-full space-y-2">
                <div className="bg-blue-100 p-3 rounded-full group-hover:scale-110 transition-transform duration-300">
                  <TableOfContents className="h-6 w-6 text-blue-600" />
                </div>
                <span className="text-lg font-semibold text-gray-800 font-heading text-center">Choose Chapter</span>
                <span className="text-xs text-gray-600">Select specific content</span>
              </div>
            </button>

            {/* Audio-Books Store Button */}
            <a href={"/books"} className="block group">
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-orange-500 to-orange-400 hover:from-orange-400 hover:to-orange-300 text-white p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 h-32">
                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative z-10 flex flex-col items-center justify-center h-full space-y-2">
                  <div className="bg-white/20 p-3 rounded-full group-hover:scale-110 transition-transform duration-300">
                    <Headphones className="h-6 w-6" />
                  </div>
                  <span className="text-lg font-semibold font-heading text-center">Audio-Books Store</span>
              
                </div>
              </div>
            </a>

            {/* Freebies Button */}
            <a href="/freebies" className="block group">
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-500 to-green-400 hover:from-green-400 hover:to-green-300 text-white p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 h-32">
                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative z-10 flex flex-col items-center justify-center h-full space-y-2">
                  <div className="bg-white/20 p-3 rounded-full group-hover:scale-110 transition-transform duration-300">
                    <Gift className="h-6 w-6" />
                  </div>
                  <span className="text-lg font-semibold font-heading text-center">Free Resources</span>
                 
                </div>
              </div>
            </a>
          </div>

          {/* Library Button - Confditionally Rendered */}
          {hasLibraryItems && (
            <div className="text-center">
              <button
                onClick={handleLibrary}
                className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-500 to-purple-400 hover:from-purple-400 hover:to-purple-300 text-white p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 w-full max-w-md mx-auto h-20"
              >
                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative z-10 flex items-center justify-center h-full space-x-4">
                  <div className="bg-white/20 p-3 rounded-full group-hover:scale-110 transition-transform duration-300">
                    <BookMarked className="h-6 w-6" />
                  </div>
                  <div className="text-left">
                    <span className="text-lg font-semibold font-heading block">My Library</span>
                    <span className="text-xs opacity-90">Your saved content</span>
                  </div>
                  <ChevronRight className="h-5 w-5 ml-auto opacity-80" />
                </div>
              </button>
            </div>
          )}

                    {/* Promotional Cards Section */}
          <div className="grid lg:grid-cols-2 gap-8">
            <Card className="relative overflow-hidden border-0 shadow-xl rounded-2xl group hover:shadow-2xl transition-all duration-300 bg-white">
              <CardContent className="p-0 bg-white">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8 md:p-12 shadow-lg border border-blue-100">
                  <div className="max-w-4xl mx-auto">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                      <div className="flex-1 text-center md:text-left">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                          Talk to <span className="text-blue-600">Mehran</span>
                        </h2>
                        <p className="text-lg text-gray-700 mb-6 leading-relaxed">
                          Ready to discuss your project? Let's have a consultation to explore your ideas, 
                          challenges, and find the perfect solution together.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                          <a href="https://mindthatseekstruth.com/consultation" 
                          target="_blank"
                          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition duration-300 transform hover:scale-105">
                            Schedule a Call
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden border-0 shadow-xl rounded-2xl group hover:shadow-2xl transition-all duration-300">
              <CardContent className="p-0">
                <Link
                  href="https://mindthatseekstruth.com/books"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  <div className="relative overflow-hidden">
                    <Image
                      src={"/author mehran books.jpg"}
                      width={720}
                      height={480}
                      alt="Author Mehran Books"
                      className="w-full aspect-video object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="absolute bottom-4 left-4 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <span className="font-semibold">Explore Books →</span>
                    </div>
                  </div>
                </Link>
              </CardContent>
            </Card>
          </div>


          {/* Features Carousel */}
          <div className="relative">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-3 font-heading">
                Why This Guide Works
              </h2>
              <div className="w-24 h-1 bg-gradient-to-r from-primary to-primary/60 rounded-full mx-auto mb-6"></div>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature, index) => (
                <Card 
                  key={index} 
                  className={`relative overflow-hidden border-0 shadow-lg transition-all duration-500 hover:shadow-xl ${
                    index === activeFeature ? 'scale-105 bg-gradient-to-br from-primary/5 to-transparent' : 'scale-100'
                  }`}
                >
                  <CardContent className="p-6 text-center">
                    <div className={`inline-flex p-3 rounded-full mb-4 ${
                      index === activeFeature ? 'bg-primary/20 text-primary' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {feature.icon}
                    </div>
                    <h3 className="font-semibold text-lg mb-2 font-heading">{feature.title}</h3>
                    <p className="text-gray-600 text-sm font-body">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Testimonials Section */}
          <div className="relative">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-3 font-heading">
                Success Stories
              </h2>
              <div className="w-24 h-1 bg-gradient-to-r from-primary to-primary/60 rounded-full mx-auto mb-6"></div>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6">
              {testimonials.map((testimonial, index) => (
                <Card key={index} className="relative overflow-hidden border-0 shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex mb-4">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          className={`h-4 w-4 ${
                            i < testimonial.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                          }`} 
                        />
                      ))}
                    </div>
                    <p className="text-gray-700 italic mb-4 font-body">"{testimonial.text}"</p>
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-gray-800 font-body">{testimonial.name}</span>
                      <ThumbsUp className="h-4 w-4 text-primary" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>


        </div>
      </main>

      {/* Modals */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={() => {}}
      />

      <SettingsPanel
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        onSettingsChange={setSettings}
      />
    </div>
  );
}