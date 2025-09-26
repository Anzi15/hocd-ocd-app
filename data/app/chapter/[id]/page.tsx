"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ShoppingCart, Sparkles, BookOpen, Trophy, Share2 } from "lucide-react";
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

  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAudioFile, setSelectedAudioFile] = useState<Book[]>([]);
  const [progress, setProgress] = useState<{ [key: string]: number }>({});
  const [showSummary, setShowSummary] = useState(false);
  const [settings] = useState(loadSettings());
  const [redirecting, setRedirecting] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

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

  useEffect(() => {
    router.prefetch("/checkout");
  }, [router]);

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
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentQuestionIndex(currentQuestionIndex - 1);
        setIsAnimating(false);
      }, 300);
    }
  };

  const handleAnswer = (answer: boolean) => {
    playButtonSound();
    setIsAnimating(true);

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

    setTimeout(() => {
      if (chapter && nextIndex >= chapter.questions.length) {
        setShowSummary(true);
      } else {
        setCurrentQuestionIndex(nextIndex);
      }
      setIsAnimating(false);
    }, 500);
  };

  const handleBuy = async () => {
    if (selectedAudioFile.length > 0 && !redirecting) {
      playButtonSound();
      setRedirecting(true);
      await new Promise(resolve => setTimeout(resolve, 100));
      saveBundle([...selectedAudioFile]);
      router.push("/checkout");
    }
  };

  if (!chapter) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-body text-lg">Loading chapter...</p>
        </div>
      </div>
    );
  }

  if (showSummary) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-100">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <Card className="animate-in fade-in duration-500 shadow-xl border-0">
              <CardHeader className="text-center pb-4">
                <div className="flex justify-center mb-4">
                  <Trophy className="h-16 w-16 text-yellow-500" />
                </div>
                <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent font-heading">
                  Chapter Complete!
                </CardTitle>
                <p className="text-gray-600 font-body text-lg">
                  {chapter.title}
                </p>
              </CardHeader>
              
              <CardContent className="space-y-8">
                {selectedAudioFile.length > 0 ? (
                  <>
                    {/* Pricing Section */}
                    <div className="text-center space-y-4 bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-xl">
                      <div className="flex justify-center items-center gap-4">
                        <div className="text-lg font-bold text-red-600 font-heading line-through">
                          ${25 * selectedAudioFile.length}
                        </div>
                        <div className="text-3xl font-bold text-green-600 font-heading">
                          $85
                        </div>
                      </div>
                      <div className="text-sm text-gray-600">
                        Save ${25 * selectedAudioFile.length - 85} with this bundle!
                      </div>
                      <Button
                        className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-8 py-3 text-lg font-heading shadow-lg hover:shadow-xl transition-all duration-300"
                        onClick={handleBuy}
                        disabled={redirecting}
                        size="lg"
                      >
                        <ShoppingCart className="mr-2 h-5 w-5" />
                        {redirecting ? (
                          <span className="flex items-center">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Redirecting...
                          </span>
                        ) : (
                          "Get Your Bundle"
                        )}
                      </Button>
                    </div>

                    {/* Books Grid */}
                    <div>
                      <h3 className="text-xl font-semibold mb-4 flex items-center gap-2 font-heading">
                        <BookOpen className="h-5 w-5" />
                        Your Selected Books ({selectedAudioFile.length})
                      </h3>
                      <div className="grid md:grid-cols-2 gap-6">
                        {selectedAudioFile.map((book, index) => (
                          <Card
                            key={index}
                            className="hover:shadow-lg transition-all duration-300 border-2 border-transparent hover:border-blue-200 animate-in slide-in-from-bottom-4"
                            style={{ animationDelay: `${index * 100}ms` }}
                          >
                            <CardContent className="p-4 flex items-center gap-4">
                              <Image
                                src={book.thumbnail || "/placeholder.svg"}
                                alt={book.title}
                                width={80}
                                height={120}
                                className="rounded-lg shadow-md object-cover"
                              />
                              <div className="flex-1">
                                <h4 className="font-semibold text-lg font-heading text-gray-800">
                                  {book.title}
                                </h4>
                                <p className="text-green-600 font-bold">$25</p>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center space-y-6 py-8">
                    <div className="w-24 h-24 mx-auto bg-gray-100 rounded-full flex items-center justify-center">
                      <Sparkles className="h-12 w-12 text-gray-400" />
                    </div>
                    <p className="text-lg text-gray-600 font-body">
                      You didn't select any books in this chapter.
                    </p>
                    <Link href="/chapters">
                      <Button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 font-heading">
                        Continue Learning
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

  const currentQuestion = chapter.questions[currentQuestionIndex];
  const progressPercentage = ((currentQuestionIndex + 1) / chapter.questions.length) * 100;

  if (!currentQuestion) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 font-body">Question not found. Redirecting...</p>
        </div>
      </div>
    );
  }

  const showQuote = (currentQuestionIndex + 1) % 6 === 0;
  const questionsPerChapter = chapter.questions.length;
  const chapterOffset = chaptersData.findIndex((c) => c.id === chapterId) * Math.ceil(questionsPerChapter / 6);
  const quoteIndex = chapterOffset + Math.floor((currentQuestionIndex + 1) / 6) - 1;
  const quote = sayings[quoteIndex % sayings.length];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <Button
              variant="ghost"
              onClick={() => router.push("/chapters")}
              className="animate-button-press font-body hover:bg-blue-50"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Chapters
            </Button>
            <div className="text-sm text-gray-600 font-body bg-white px-3 py-1 rounded-full shadow-sm">
              Question {currentQuestionIndex + 1} of {chapter.questions.length}
            </div>
          </div>

          {/* Progress */}
          <div className="mb-8 space-y-2">
            <div className="flex justify-between text-sm text-gray-600 font-body">
              <span>{chapter.title}</span>
              <span>{Math.round(progressPercentage)}%</span>
            </div>
            <Progress value={progressPercentage} className="h-3 bg-blue-100" />
          </div>

          {/* Question Card */}
          <Card className={`mb-6 shadow-xl border-0 transition-all duration-300 ${
            isAnimating ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
          }`}>
            <CardHeader className="pb-4">
              <CardTitle className="text-2xl text-center font-heading text-gray-800 leading-tight">
                {currentQuestion.text}
              </CardTitle>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Answer Buttons */}
              <div className="grid grid-cols-1 gap-4">
                <Button
                  onClick={() => handleAnswer(true)}
                  size="lg"
                  className="h-20 text-xl font-semibold bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-white/30 rounded-full flex items-center justify-center">
                      ✓
                    </div>
                    <span>Yes</span>
                  </div>
                </Button>
                
                <Button
                  onClick={() => handleAnswer(false)}
                  variant="outline"
                  size="lg"
                  className="h-16 text-lg font-heading border-2 hover:border-gray-300 hover:bg-gray-50 transition-all duration-300"
                >
                  No
                </Button>
              </div>

              {/* Quote Section */}
              {showQuote && quote && (
                <div className="space-y-4 mt-8 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl animate-in slide-in-from-bottom-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                    <Sparkles className="h-4 w-4" />
                    Inspiring Quote
                  </div>
                  
                  <Image
                    src={quote.imgSrc}
                    alt={`Quote ${quote.id}`}
                    width={1020}
                    height={720}
                    className="rounded-lg object-contain shadow-md w-full border-2 border-white"
                  />
                  
                  {/* Share Buttons */}
                  <div className="flex flex-wrap gap-2 justify-center">
                    <Button
                      onClick={() => window.open(
                        `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
                          `${window.location.origin}${quote.imgSrc}`
                        )}&quote=${encodeURIComponent(
                          "Shared via mindthatseekstruth"
                        )}`,
                        "_blank"
                      )}
                      size="sm"
                      variant="outline"
                      className="flex items-center gap-2"
                    >
                      <Share2 className="h-3 w-3" />
                      Facebook
                    </Button>
                    
                    <Button
                      onClick={() => window.open(
                        `https://twitter.com/intent/tweet?text=${encodeURIComponent(
                          "Shared via @mindthatseekstruth"
                        )}&url=${encodeURIComponent(
                          `${window.location.origin}${quote.imgSrc}`
                        )}`,
                        "_blank"
                      )}
                      size="sm"
                      variant="outline"
                      className="flex items-center gap-2"
                    >
                      <Share2 className="h-3 w-3" />
                      Twitter
                    </Button>
                    
                    <Button
                      onClick={() => {
                        navigator.clipboard.writeText(
                          `${window.location.origin}${quote.imgSrc}`
                        );
                        alert("Quote image link copied to clipboard!");
                      }}
                      size="sm"
                      variant="outline"
                    >
                      Copy Link
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Selected Books Counter */}
          {selectedAudioFile.length > 0 && (
            <div className="text-center text-sm text-gray-600 font-body bg-white/80 backdrop-blur-sm p-3 rounded-full shadow-sm">
              <span className="font-semibold text-blue-600">
                {selectedAudioFile.length}
              </span> book{selectedAudioFile.length !== 1 ? "s" : ""} selected for your bundle
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-center gap-4 mt-8">
            {currentQuestionIndex > 0 && (
              <Button
                variant="outline"
                onClick={handleBack}
                className="animate-button-press font-body"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Previous Question
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}