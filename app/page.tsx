"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Play, BookOpen, Library, Settings, LogIn, TableOfContents, TvMinimalPlay, Coins, ConeIcon } from "lucide-react";
import IntroVideo from "@/components/IntroVide";
import { loadProgress, loadSettings } from "@/lib/storage";
import { auth } from "@/lib/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { signOut } from "firebase/auth";
import AuthModal from "@/components/auth-modal";
import SettingsPanel from "@/components/settings-panel";
import VideoPlayer from "@/components/video-player";
import AnimatedBackground from "@/components/animated-background";
import type { AppSettings } from "@/lib/types";
import Link from "next/link";

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
    // Check if user has any library items
    const checkLibrary = () => {
      const library = localStorage.getItem("user_library");
      setHasLibraryItems(library && JSON.parse(library).length > 0);
    };
    checkLibrary();
  }, [user]);

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

  const handleStart = () => {
    playButtonSound();
    const progress = loadProgress();
    const lastChapter = Object.keys(progress).pop();

    if (lastChapter) {
      router.push(`/chapter/${lastChapter}`);
    } else {
      router.push("/chapter/chapter1");
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

  return (
    <div className="min-h-screen relative">
      <AnimatedBackground />

      {/* Header */}
      <header className="relative z-10 flex justify-between items-center p-4">
        <div className="flex items-center space-x-2">
          <BookOpen
            className="h-8 w-8"
            style={{ color: "var(--primary-color)" }}
          />
          <h1 className="text-2xl font-bold text-gray-800 font-heading">
            Breakup Guide
          </h1>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowSettings(true)}
            className="animate-button-press"
          >
            <Settings className="h-5 w-5" />
          </Button>

          {user ? (
            <div className="flex items-center space-x-2">
              <Avatar
                className="h-8 w-8 cursor-pointer"
                onClick={handleSignOut}
              >
                <AvatarImage src={user.photoURL || undefined} />
                <AvatarFallback className="text-xs font-body">
                  {getUserInitials(user.email || "U")}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm text-gray-600 hidden sm:block font-body">
                {user.displayName || user.email?.split("@")[0]}
              </span>
            </div>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAuthModal(true)}
              className="animate-button-press"
            >
              <LogIn className="h-5 w-5" />
              <span className="hidden sm:inline ml-2 font-body">Login</span>
            </Button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 container mx-auto px-4 py-8">
        <div className=" mx-auto space-y-8">
          {/* Intro Video */}
          <Card className="animate-scale-hover">
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold mb-4 text-center font-heading">
                The Ultimate BreakUp Cure
              </h2>
              <div className="flex justify-center"></div>
              <p className="text-center text-gray-600 mt-4 font-body">
                Are you struggling to move on after a breakup? Feel lost, broken, or unsure of your next step? You're not alone — and help is here.
              </p>
            </CardContent>
            <h3 className="text-center font-bold">
              Watch The Introductory Video
            </h3>
            <div className="max-w-3xl mx-auto rounded-xl overflow-hidden shadow-xl aspect-video">
              <IntroVideo />
            </div>
          </Card>

          {/* Action Buttons */}
          <div className="grid md:grid-cols-3 gap-4">
            <Button
              onClick={handleStart}
              className="h-24 text-lg font-semibold animate-scale-hover animate-button-press font-heading"
              style={{ backgroundColor: "var(--primary-color)" }}
            >
              <Play className="mr-2 h-6 w-6" />
              Start Learning
            </Button>

            <Button
              onClick={handleChooseChapter}
              variant="outline"
              className="h-24 text-lg font-semibold animate-scale-hover animate-button-press font-heading"
            >
              <TableOfContents className="mr-2 h-6 w-6" />
              Choose Chapter
            </Button>

            <Link
              href={"/books"}
              className="h-24 text-lg font-semibold animate-scale-hover animate-button-press font-heading"
            >
              <Button
                variant="outline"
                className="h-24 text-lg font-semibold animate-scale-hover animate-button-press font-heading w-full"
              >
                <BookOpen className="mr-2 h-6 w-6" />
                Audio-Books Store
              </Button>
            </Link>

            <Link
              href="https://mindthatseekstruth.com"
              target="_blank"
              rel="noopener noreferrer"
              className="h-24 text-lg font-semibold animate-scale-hover animate-button-press font-heading"
            >
              <Button
                variant="outline"
                className="w-full h-24 text-lg font-semibold animate-scale-hover animate-button-press font-heading"
              >
                <TvMinimalPlay className="mr-2 h-6 w-6" />
                Talk to mehran live
              </Button>
            </Link>

            <Link
              href="/freebies"
              className="h-24 text-lg font-semibold animate-scale-hover animate-button-press font-heading"
            >
              <Button
                variant="outline"
                className="w-full h-24 text-lg font-semibold animate-scale-hover animate-button-press font-heading"
              >
                <ConeIcon className="mr-2 h-6 w-6" />
                Free bees
              </Button>
            </Link>

            {hasLibraryItems && (
              <Button
                onClick={handleLibrary}
                variant="outline"
                className="h-24 text-lg font-semibold animate-scale-hover animate-button-press font-heading"
              >
                <Library className="mr-2 h-6 w-6" />
                My Library
              </Button>
            )}
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
            <Card className="animate-scale-hover">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-semibold mb-2 font-heading">
                  5 Learning Chapters
                </h3>
                <p className="text-gray-600 text-sm font-body">
                  Comprehensive topics covering about your breakup situation and how to deal with it.
                </p>
              </CardContent>
            </Card>

            <Card className="animate-scale-hover">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Play className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="font-semibold mb-2 font-heading">
                  Interactive Questions
                </h3>
                <p className="text-gray-600 text-sm font-body">
                  Personalized learning of your breakup based on your responses
                </p>
              </CardContent>
            </Card>

            <Card className="animate-scale-hover">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Library className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="font-semibold mb-2 font-heading">
                  Curated Library
                </h3>
                <p className="text-gray-600 text-sm font-body">
                  Access your purchased content anytime, anywhere
                </p>
              </CardContent>
            </Card>
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
