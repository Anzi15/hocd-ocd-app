"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, CheckCircle, Play, Star, Clock, BookOpen } from "lucide-react"
import type { Chapter } from "@/lib/types"
import { loadProgress } from "@/lib/storage"
import chaptersData from "@/data/chapters.json"

export default function ChaptersPage() {
  const router = useRouter()
  const [chapters] = useState<Chapter[]>(chaptersData)
  const [progress, setProgress] = useState<{ [key: string]: number }>({})
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate loading delay for better UX
    const timer = setTimeout(() => {
      setProgress(loadProgress())
      setIsLoading(false)
    }, 300)
    return () => clearTimeout(timer)
  }, [])

  const isChapterCompleted = (chapter: Chapter) => {
    return progress[chapter.id] === chapter.questions.length
  }

  const getChapterProgress = (chapterId: string) => {
    return progress[chapterId] || 0
  }

  const getOverallProgress = () => {
    const totalQuestions = chapters.reduce((sum, chapter) => sum + chapter.questions.length, 0)
    const completedQuestions = Object.values(progress).reduce((sum, curr) => sum + curr, 0)
    return totalQuestions > 0 ? (completedQuestions / totalQuestions) * 100 : 0
  }

  const handleChapterSelect = (chapterId: string) => {
    router.push(`/chapter/${chapterId}`)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your progress...</p>
        </div>
      </div>
    )
  }

  const overallProgress = getOverallProgress()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Enhanced Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center mb-4">
              <Button 
                variant="ghost" 
                onClick={() => router.push("/")} 
                className="mr-4 hover:bg-blue-100 transition-colors"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
              <BookOpen className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Learning Journey
              </h1>
            </div>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Master each chapter at your own pace. Track your progress and celebrate your achievements!
            </p>
          </div>

          {/* Overall Progress Card */}
          <Card className="mb-8 bg-white/80 backdrop-blur-sm border-blue-200 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-800">Your Overall Progress</h3>
                <Badge variant="secondary" className="text-sm">
                  {Math.round(overallProgress)}% Complete
                </Badge>
              </div>
              <Progress value={overallProgress} className="h-3 mb-2" />
              <div className="flex justify-between text-sm text-gray-600">
                <span>Continue your journey to mastery</span>
                <span>{Math.round(overallProgress)}%</span>
              </div>
            </CardContent>
          </Card>

          {/* Chapters Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {chapters.map((chapter, index) => {
              const chapterProgress = getChapterProgress(chapter.id)
              const isCompleted = isChapterCompleted(chapter)
              const progressPercentage = (chapterProgress / chapter.questions.length) * 100
              const isInProgress = chapterProgress > 0 && !isCompleted

              return (
                <Card
                  key={chapter.id}
                  className={`
                    cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl border-2
                    ${isCompleted 
                      ? "border-green-500 bg-gradient-to-br from-green-50 to-emerald-50" 
                      : isInProgress
                        ? "border-blue-500 bg-gradient-to-br from-blue-50 to-cyan-50"
                        : "border-gray-200 bg-white"
                    }
                    relative overflow-hidden
                  `}
                  onClick={() => handleChapterSelect(chapter.id)}
                >
                  {/* Decorative Corner */}
                  <div className={`
                    absolute top-0 right-0 w-16 h-16 transform rotate-45 translate-x-8 -translate-y-8
                    ${isCompleted ? "bg-green-500" : isInProgress ? "bg-blue-500" : "bg-gray-300"}
                  `} />
                  
                  {/* Completion Badge */}
                  {isCompleted && (
                    <div className="absolute top-4 right-4 z-10">
                      <CheckCircle className="h-6 w-6 text-green-600 animate-pulse" />
                    </div>
                  )}

                  <CardHeader className="pb-3 relative z-10">
                    <div className="flex items-start justify-between mb-2">
                      <div className={`
                        w-10 h-10 rounded-full flex items-center justify-center text-white font-bold
                        ${isCompleted ? "bg-green-500" : isInProgress ? "bg-blue-500" : "bg-gray-400"}
                        shadow-md
                      `}>
                        {index + 1}
                      </div>
                      {isInProgress && (
                        <Badge variant="default" className="bg-blue-100 text-blue-800">
                          <Clock className="h-3 w-3 mr-1" />
                          In Progress
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="text-lg leading-tight">
                      {chapter.title}
                    </CardTitle>
                    <p className="text-gray-600 text-sm mt-2 line-clamp-2">
                      {chapter.description}
                    </p>
                  </CardHeader>

                  <CardContent className="pt-0 relative z-10">
                    <div className="space-y-4">
                      {/* Progress Info */}
                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <span className="flex items-center">
                          <Star className="h-4 w-4 mr-1 text-yellow-500" />
                          {chapter.difficulty}
                        </span>
                        <span>{chapter.questions.length} questions</span>
                      </div>

                      {/* Progress Bar */}
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs font-medium">
                          <span>Progress</span>
                          <span>{chapterProgress}/{chapter.questions.length}</span>
                        </div>
                        <Progress 
                          value={progressPercentage} 
                          className={`
                            h-2
                            ${isCompleted ? "bg-green-200" : "bg-gray-200"}
                          `}
                        />
                      </div>

                      {/* Action Button */}
                      <Button 
                        className={`
                          w-full transition-all duration-200
                          ${isCompleted 
                            ? "bg-green-500 hover:bg-green-600" 
                            : isInProgress
                              ? "bg-blue-500 hover:bg-blue-600"
                              : "bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                          }
                          shadow-md hover:shadow-lg
                        `}
                        size="sm"
                      >
                        <Play className="h-4 w-4 mr-2" />
                        {isCompleted ? "Review" : isInProgress ? "Continue" : "Start Learning"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Progress Overview */}
          <Card className="bg-white/80 backdrop-blur-sm border-purple-200 shadow-lg">
            <CardContent className="p-6">
              <h3 className="text-xl font-semibold mb-6 text-center text-gray-800">
                Chapter Progress Overview
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
                {chapters.map((chapter, index) => {
                  const isCompleted = isChapterCompleted(chapter)
                  const chapterProgress = getChapterProgress(chapter.id)
                  const isInProgress = chapterProgress > 0 && !isCompleted

                  return (
                    <div 
                      key={chapter.id} 
                      className="text-center group cursor-pointer transition-transform hover:scale-110"
                      onClick={() => handleChapterSelect(chapter.id)}
                    >
                      <div className={`
                        relative w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-3
                        shadow-lg transition-all duration-300 group-hover:shadow-xl
                        ${isCompleted 
                          ? "bg-gradient-to-br from-green-500 to-emerald-500 text-white" 
                          : isInProgress
                            ? "bg-gradient-to-br from-blue-500 to-cyan-500 text-white"
                            : "bg-gradient-to-br from-gray-300 to-gray-400 text-gray-600"
                        }
                      `}>
                        <span className="font-bold text-lg">{index + 1}</span>
                        {isCompleted && (
                          <CheckCircle className="absolute -top-1 -right-1 h-5 w-5 text-white bg-green-500 rounded-full" />
                        )}
                      </div>
                      <p className="text-xs font-medium text-gray-700 mb-1 line-clamp-2">
                        Ch. {index + 1}
                      </p>
                      <div className={`
                        text-xs font-semibold
                        ${isCompleted ? "text-green-600" : isInProgress ? "text-blue-600" : "text-gray-500"}
                      `}>
                        {chapterProgress}/{chapter.questions.length}
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Motivational Footer */}
          <div className="text-center mt-8 p-6 bg-white/50 rounded-lg border border-blue-100">
            <Star className="h-8 w-8 text-yellow-500 mx-auto mb-3 animate-bounce" />
            <h4 className="text-lg font-semibold text-gray-800 mb-2">
              {overallProgress === 100 
                ? "Congratulations! You've completed all chapters! 🎉"
                : overallProgress > 50
                  ? "You're doing great! Keep up the momentum! 💪"
                  : "Every chapter brings you closer to mastery! 🌟"
              }
            </h4>
            <p className="text-gray-600 text-sm">
              {overallProgress === 0 
                ? "Start your learning journey today!"
                : `You've completed ${Math.round(overallProgress)}% of the course.`
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}