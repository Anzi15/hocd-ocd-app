"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, ShoppingCart } from "lucide-react"
import type { Chapter, Book } from "@/lib/types"
import { loadProgress, saveProgress, saveBundle, loadSettings } from "@/lib/storage"
import chaptersData from "@/data/chapters.json"
import Image from "next/image"

export default function ChapterPage() {
  const router = useRouter()
  const params = useParams()
  const chapterId = params.id as string

  const [chapter, setChapter] = useState<Chapter | null>(null)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedBooks, setSelectedBooks] = useState<Book[]>([])
  const [progress, setProgress] = useState<{ [key: string]: number }>({})
  const [showSummary, setShowSummary] = useState(false)
  const [settings] = useState(loadSettings())

  useEffect(() => {
    const foundChapter = chaptersData.find((c) => c.id === chapterId)
    if (foundChapter) {
      setChapter(foundChapter)
      const savedProgress = loadProgress()
      setProgress(savedProgress)

      // Resume from saved progress
      const chapterProgress = savedProgress[chapterId] || 0
      if (chapterProgress >= foundChapter.questions.length) {
        setShowSummary(true)
      } else {
        setCurrentQuestionIndex(chapterProgress)
      }
    }
  }, [chapterId])

  const playButtonSound = () => {
    if (settings.soundEnabled) {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)

      oscillator.frequency.value = 800
      oscillator.type = "sine"

      gainNode.gain.setValueAtTime(0.2, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1)

      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.1)
    }
  }

  const handleAnswer = (answer: boolean) => {
    playButtonSound()

    if (answer && chapter) {
      // Add ALL books from this question to the bundle
      const currentQuestion = chapter.questions[currentQuestionIndex]
      if (currentQuestion && currentQuestion.books) {
        setSelectedBooks((prev) => [...prev, ...currentQuestion.books])
      }
    }

    const nextIndex = currentQuestionIndex + 1
    const newProgress = { ...progress, [chapterId]: nextIndex }

    setProgress(newProgress)
    saveProgress(newProgress)

    if (chapter && nextIndex >= chapter.questions.length) {
      setShowSummary(true)
    } else {
      setCurrentQuestionIndex(nextIndex)
    }
  }

  const handleBuyBundle = () => {
    playButtonSound()
    saveBundle(selectedBooks)
    router.push("/checkout")
  }

  const handleSkipChapter = () => {
    playButtonSound()
    router.push("/chapters")
  }

  if (!chapter) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-body">Loading chapter...</p>
        </div>
      </div>
    )
  }

  if (showSummary) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <Card className="animate-scale-hover">
              <CardHeader>
                <CardTitle className="text-2xl text-center font-heading">Chapter Complete: {chapter.title}</CardTitle>
                <p className="text-center text-gray-600 font-body">
                  Here are the books selected for your learning journey
                </p>
              </CardHeader>

              <CardContent className="space-y-6">
                {selectedBooks.length > 0 ? (
                  <>
                    <div className="grid md:grid-cols-2 gap-4">
                      {selectedBooks.map((book, index) => (
                        <Card key={index} className="border-2 animate-scale-hover">
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
                                <h4 className="font-semibold text-sm font-heading">{book.title}</h4>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>

                    <div className="text-center space-y-4">
                      <div className="text-2xl font-bold text-green-600 font-heading">Bundle Price: $45</div>
                      <div className="space-x-4">
                        <Button
                          onClick={handleBuyBundle}
                          size="lg"
                          className="bg-green-600 hover:bg-green-700 animate-button-press font-heading"
                        >
                          <ShoppingCart className="mr-2 h-5 w-5" />
                          Buy This Bundle
                        </Button>
                        <Button
                          variant="outline"
                          onClick={handleSkipChapter}
                          className="animate-button-press font-heading"
                        >
                          Skip for Now
                        </Button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center space-y-4">
                    <p className="text-lg text-gray-600 font-body">No books were selected in this chapter.</p>
                    <Button onClick={handleSkipChapter} className="animate-button-press font-heading">
                      Continue to Next Chapter
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  // Safety check for current question
  if (currentQuestionIndex >= chapter.questions.length) {
    setShowSummary(true)
    return null
  }

  const currentQuestion = chapter.questions[currentQuestionIndex]
  const progressPercentage = ((currentQuestionIndex + 1) / chapter.questions.length) * 100

  // Safety check for current question
  if (!currentQuestion) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 font-body">Question not found. Redirecting...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <Button variant="ghost" onClick={() => router.push("/chapters")} className="animate-button-press">
              <ArrowLeft className="h-4 w-4 mr-2" />
              <span className="font-body">Back</span>
            </Button>
            <div className="text-sm text-gray-600 font-body">
              Question {currentQuestionIndex + 1} of {chapter.questions.length}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <Progress value={progressPercentage} className="h-2" />
            <p className="text-center text-sm text-gray-600 mt-2 font-body">{chapter.title}</p>
          </div>

          {/* Question Card */}
          <Card className="mb-6 animate-scale-hover">
            <CardHeader>
              <CardTitle className="text-xl text-center font-heading">{currentQuestion.text}</CardTitle>
            </CardHeader>

            <CardContent className="space-y-6">


              {/* Answer Buttons */}
              <div className="grid grid-cols-1 gap-4">
                <Button
                  onClick={() => handleAnswer(true)}
                  size="lg"
                  
                  className={`h-20 text-xl font-semibold bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 `}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">✓</div>
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
            </CardContent>
          </Card>

          {/* Selected Books Counter */}
          {selectedBooks.length > 0 && (
            <div className="text-center text-sm text-gray-600 font-body">
              {selectedBooks.length} book{selectedBooks.length !== 1 ? "s" : ""} selected for your bundle
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
