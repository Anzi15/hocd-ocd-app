"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ShoppingCart } from "lucide-react";
import type { Chapter, Book } from "@/lib/types";
import {
  loadProgress,
  saveProgress,
  saveBundle,
  loadSettings,
} from "@/lib/storage";
import chaptersData from "@/data/chapters.json";
import sayings from "@/data/sayings.json";
import Image from "next/image";
import Link from "next/link";

export default function ChapterPage() {
  const router = useRouter();
  const params = useParams();
  const chapterId = params.id as string;

  const BASE_URL = typeof window !== "undefined" ? window.location.origin : "";

  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAudioFile, setSelectedAudioFile] = useState<Book[]>([]);
  const [progress, setProgress] = useState<{ [key: string]: number }>({});
  const [showSummary, setShowSummary] = useState(false);
  const [settings] = useState(loadSettings());
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    const foundChapter = chaptersData.find((c) => c.id === chapterId);
    if (foundChapter) {
      setChapter(foundChapter);
      const savedProgress = loadProgress();
      setProgress(savedProgress);
      const chapterProgress = savedProgress[chapterId] || 0;
      if (chapterProgress >= foundChapter.questions.length) {
        setShowSummary(true);
      } else {
        setCurrentQuestionIndex(chapterProgress);
      }
    }
  }, [chapterId]);

  useEffect(() => {
    if (redirecting) {
      router.push("/checkout");
    }
  }, [redirecting, router]);

  const playButtonSound = () => {
    if (settings.soundEnabled) {
      const audioContext = new (window.AudioContext ||
        (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      oscillator.frequency.value = 800;
      oscillator.type = "sine";
      gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(
        0.01,
        audioContext.currentTime + 0.1
      );
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.1);
    }
  };

  const handleBack = () => {
    playButtonSound();
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleAnswer = (answer: boolean) => {
    playButtonSound();

    if (chapter) {
      const currentQuestion = chapter.questions[currentQuestionIndex];
      if (currentQuestion?.audioFile) {
        setSelectedAudioFile((prev) => {
          if (answer) {
            const newAudioFile = currentQuestion.audioFile.filter(
              (book) => !prev.includes(book)
            );
            return [...prev, ...newAudioFile];
          } else {
            return prev.filter(
              (book) => !currentQuestion.audioFile.includes(book)
            );
          }
        });
      }
    }

    const nextIndex = currentQuestionIndex + 1;
    const newProgress = { ...progress, [chapterId]: nextIndex };
    setProgress(newProgress);
    saveProgress(newProgress);

    if (chapter && nextIndex >= chapter.questions.length) {
      setShowSummary(true);
    } else {
      setCurrentQuestionIndex(nextIndex);
    }
  };

  useEffect(() => {
  // Prefetch checkout page when component mounts
  router.prefetch("/checkout");
}, [router]);

const handleBuy = async () => {
  if (selectedAudioFile.length > 0 && !redirecting) {
    playButtonSound();
    setRedirecting(true); // Show loading state immediately
    
    // Small delay to ensure UI updates
    await new Promise(resolve => setTimeout(resolve, 100));
    
    saveBundle([...selectedAudioFile]);
    router.push("/checkout");
  }
};
  if (!chapter) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-body">Loading chapter...</p>
        </div>
      </div>
    );
  }

  if (showSummary) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto py-4">
            <Card className="animate-scale-hover py-4">
              <CardHeader>
                <CardTitle className="text-2xl text-center font-heading">
                  Chapter Complete: {chapter.title}
                </CardTitle>
                <p className="text-center text-gray-600 font-body">
                  Here are the audioFile selected for your learning journey
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                {selectedAudioFile.length > 0 ? (
                  <>
                    <div className="text-center space-y-4">
                      <div className="text-lg font-bold text-red-600 font-heading line-through italic">
                        Actual price: ${25 * selectedAudioFile.length}
                      </div>
                      <div className="text-2xl font-bold text-green-600 font-heading">
                        Spacial Bundled Price: $85
                      </div>
                      <div className="space-x-4 flex justify-center items-center align">
<button
  className="bg-green-600 hover:bg-green-700 animate-button-press font-heading flex text-white px-2 py-2"
  onClick={handleBuy}
  disabled={redirecting}
>
  <ShoppingCart className="mr-2 h-5 w-5" />
  {redirecting ? "Redirecting..." : "Buy This Bundle"}
</button>
                      </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      {selectedAudioFile.map((book, index) => (
                        <Card
                          key={index}
                          className="border-2 animate-scale-hover"
                        >
                          <CardContent className="p-4">
                            <div className="flex space-x-4">
                              <Image
                                src={book.thumbnail || "/placeholder.svg"}
                                alt={book.title}
                                width={80}
                                height={120}
                                className="rounded object-cover"
                              />
                              <div>
                                <h4 className="font-semibold text-sm font-heading ">
                                  {book.title}
                                </h4>
                                $25
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="text-center space-y-4">
                    <p className="text-lg text-gray-600 font-body">
                      No audioFile were selected in this chapter.
                    </p>
                    <Link href="/chapters" className="inline-block">
                      <Button className="animate-button-press font-heading">
                        Continue to Next Chapter
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (currentQuestionIndex >= chapter.questions.length) {
    setShowSummary(true);
    return null;
  }

  const currentQuestion = chapter.questions[currentQuestionIndex];
  const progressPercentage =
    ((currentQuestionIndex + 1) / chapter.questions.length) * 100;

  if (!currentQuestion) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 font-body">
            Question not found. Redirecting...
          </p>
        </div>
      </div>
    );
  }

  // ✅ UPDATED QUOTE LOGIC
  const showQuote = (currentQuestionIndex + 1) % 6 === 0;
  const questionsPerChapter = chapter.questions.length;
  const chapterOffset =
    chaptersData.findIndex((c) => c.id === chapterId) *
    Math.ceil(questionsPerChapter / 6);
  const quoteIndex =
    chapterOffset + Math.floor((currentQuestionIndex + 1) / 6) - 1;
  const quote = sayings[quoteIndex % sayings.length];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <Button
              variant="ghost"
              onClick={() => router.push("/chapters")}
              className="animate-button-press"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              <span className="font-body">Back</span>
            </Button>
            <div className="text-sm text-gray-600 font-body">
              Question {currentQuestionIndex + 1} of {chapter.questions.length}
            </div>
          </div>
          <div className="mb-8">
            <Progress value={progressPercentage} className="h-2" />
            <p className="text-center text-sm text-gray-600 mt-2 font-body">
              {chapter.title}
            </p>
          </div>

          <Card className="mb-6 animate-scale-hover">
            <CardHeader>
              <CardTitle className="text-xl text-center font-heading">
                {currentQuestion.text}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 gap-4">
                <Button
                  onClick={() => handleAnswer(true)}
                  size="lg"
                  className="h-20 text-xl font-semibold bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                      ✓
                    </div>
                    <span>Yes</span>
                  </div>
                </Button>
                <Button
                  onClick={() => handleAnswer(false)}
                  variant="outline"
                  size="lg"
                  className="h-16 text-lg animate-button-press font-heading"
                >
                  No
                </Button>
              </div>

              {showQuote && (
                <div className="space-y-4 mt-4">
                  <Image
                    src={quote.imgSrc}
                    alt={`Quote ${quote.id}`}
                    width={1020}
                    height={720}
                    className="rounded-lg object-contain shadow-md w-full"
                  />
                  <div className="flex flex-wrap gap-2 justify-center">
                    <button
                      onClick={() =>
                        window.open(
                          `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
                            `${window.location.origin}${quote.imgSrc}`
                          )}&quote=${encodeURIComponent(
                            "Shared via mindthatseekstruth"
                          )}`,
                          "_blank"
                        )
                      }
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm"
                    >
                      Share on Facebook
                    </button>
                    <button
                      onClick={() =>
                        window.open(
                          `https://twitter.com/intent/tweet?text=${encodeURIComponent(
                            "Shared via @mindthatseekstruth"
                          )}&url=${encodeURIComponent(
                            `${window.location.origin}${quote.imgSrc}`
                          )}`,
                          "_blank"
                        )
                      }
                      className="bg-sky-500 hover:bg-sky-600 text-white px-4 py-2 rounded text-sm"
                    >
                      Share on Twitter
                    </button>
                    <button
                      onClick={() =>
                        window.open(
                          `https://api.whatsapp.com/send?text=${encodeURIComponent(
                            "Check this out!\n" +
                              `${window.location.origin}${quote.imgSrc}`
                          )}`,
                          "_blank"
                        )
                      }
                      className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded text-sm"
                    >
                      Share on WhatsApp
                    </button>
                    <a
                      href={`${window.location.origin}${quote.imgSrc}`}
                      download
                      className="bg-gray-700 hover:bg-gray-800 text-white px-4 py-2 rounded text-sm"
                    >
                      Download
                    </a>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(
                          `${window.location.origin}${quote.imgSrc}`
                        );
                        alert("Quote image link copied to clipboard!");
                      }}
                      className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded text-sm"
                    >
                      Copy Link
                    </button>
                    <button
                      onClick={() => {
                        if (navigator.share) {
                          navigator
                            .share({
                              title: "Quote from mindthatseekstruth",
                              text: "Check this inspiring quote!",
                              url: `${window.location.origin}${quote.imgSrc}`,
                            })
                            .catch((error) =>
                              console.error("Share failed:", error)
                            );
                        } else {
                          alert("Sharing not supported on this device.");
                        }
                      }}
                      className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded text-sm"
                    >
                      Share
                    </button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {selectedAudioFile.length > 0 && (
            <div className="text-center text-sm text-gray-600 font-body">
              {selectedAudioFile.length} book
              {selectedAudioFile.length !== 1 ? "s" : ""} selected for your
              bundle
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 flex justify-center">
        {currentQuestionIndex > 0 && (
          <Button
            variant="outline"
            onClick={handleBack}
            className="animate-button-press"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            <span className="font-body">Previous Question</span>
          </Button>
        )}
      </div>
    </div>
  );
}
