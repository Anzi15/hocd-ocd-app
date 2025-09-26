"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Search, Play, Calendar, BookOpen, Filter, Loader2, Pause, Volume2 } from "lucide-react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "@/lib/firebase";
import type { LibraryBook } from "@/lib/types";
import Image from "next/image";
import { doc, getDoc, onSnapshot } from "firebase/firestore";
import Swal from "sweetalert2";

export default function LibraryPage() {
  const router = useRouter();
  const [user] = useAuthState(auth);
  const [library, setLibrary] = useState<LibraryBook[]>([]);
  const [filteredLibrary, setFilteredLibrary] = useState<LibraryBook[]>([]);
  const [selectedBook, setSelectedBook] = useState<LibraryBook | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterBy, setFilterBy] = useState("all");
  const [loading, setLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    if (!user) {
      router.push("/");
      return;
    }

    const loadLibraryFromFirebase = async () => {
      try {
        setLoading(true);
        const userRef = doc(db, "users", user.uid);
        
        const unsubscribe = onSnapshot(userRef, (docSnap) => {
          if (docSnap.exists()) {
            const userData = docSnap.data();
            const userLibrary = userData.library || [];
            setLibrary(userLibrary);
            setFilteredLibrary(userLibrary);
          } else {
            setLibrary([]);
            setFilteredLibrary([]);
          }
          setLoading(false);
        });

        return () => unsubscribe();
      } catch (error) {
        console.error("Error loading library:", error);
        toast({
          title: "Error",
          description: "Could not load your library.",
          variant: "destructive",
        });
        setLoading(false);
      }
    };

    loadLibraryFromFirebase();
  }, [user, router]);

  useEffect(() => {
    setIsSearching(true);
    
    const timeoutId = setTimeout(() => {
      let filtered = library;

      if (searchTerm) {
        filtered = filtered.filter((book) =>
          book.bookTitle.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      if (filterBy !== "all") {
        if (filterBy === "recent") {
          filtered = filtered.sort(
            (a, b) =>
              new Date(b.purchasedAt).getTime() -
              new Date(a.purchasedAt).getTime()
          );
        } else {
          filtered = filtered.filter((book) => book.chapterId === filterBy);
        }
      }

      setFilteredLibrary(filtered);
      setIsSearching(false);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [library, searchTerm, filterBy]);

  // Safe YouTube video ID extraction
  const extractYouTubeId = (url: string) => {
    if (!url) return null;
    
    try {
      const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
      const match = url.match(regex);
      return match ? match[1] : null;
    } catch (error) {
      console.error("Error extracting YouTube ID:", error);
      return null;
    }
  };

  const handleBookSelect = (book: LibraryBook) => {
    setSelectedBook(book);
    setIsPlaying(true);
  };

  const handleBackToLibrary = () => {
    setSelectedBook(null);
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
  };

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setFilterBy("all");
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-100 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto" />
          <p className="text-gray-600">Loading your account...</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-100">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            <Skeleton className="h-8 w-64 mb-8" />
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <Skeleton className="h-64 w-full" />
                  <CardContent className="p-4 space-y-3">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

if (selectedBook) {
  const videoId = extractYouTubeId(selectedBook.videoUrl);
  
  if (!videoId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-100">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center mb-6">
              <Button
                variant="ghost"
                onClick={handleBackToLibrary}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Library
              </Button>
            </div>
            
            <Card className="bg-red-50 border-red-200">
              <CardContent className="p-6 text-center">
                <div className="text-red-600 mb-4">
                  <Volume2 className="h-12 w-12 mx-auto opacity-50" />
                </div>
                <h3 className="text-xl font-semibold text-red-800 mb-2">
                  Audio Not Available
                </h3>
                <p className="text-red-600 mb-4">
                  Could not load the audio. The URL may be invalid or unsupported.
                </p>
                <Button onClick={handleBackToLibrary} variant="outline">
                  Back to Library
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center mb-6">
            <Button
              variant="ghost"
              onClick={handleBackToLibrary}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Library
            </Button>
          </div>
          
          {/* Audio Player with Thumbnail */}
          <Card className="shadow-lg border-0">
            <CardHeader className="pb-4">
              <CardTitle className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                <Volume2 className="h-6 w-6 text-blue-600" />
                {selectedBook.bookTitle}
              </CardTitle>
              <p className="text-gray-600">Now playing audio</p>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Thumbnail Display */}
              <div className="relative rounded-lg overflow-hidden bg-gray-100">
                <div className="h-80 w-full relative">
                  <Image
                    src={selectedBook.thumbnail || "/placeholder.svg"}
                    alt={selectedBook.bookTitle}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 800px"
                  />
                  
                  {/* Audio Overlay */}
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                    <div className="bg-white/20 backdrop-blur-sm rounded-full p-6">
                      <Volume2 className="h-16 w-16 text-white" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Audio Controls */}
              <div className="space-y-4">
                {/* Progress Bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(duration)}</span>
                  </div>
                  <div 
                    className="w-full bg-gray-200 rounded-full h-2 cursor-pointer"
                    onClick={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const percent = (e.clientX - rect.left) / rect.width;
                      const newTime = percent * duration;
                      setCurrentTime(newTime);
                    }}
                  >
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>

                {/* Control Buttons */}
                <div className="flex items-center justify-center gap-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentTime(Math.max(0, currentTime - 10))}
                  >
                    -10s
                  </Button>
                  
                  <Button
                    onClick={togglePlayPause}
                    className="w-16 h-16 rounded-full bg-blue-600 hover:bg-blue-700"
                  >
                    {isPlaying ? (
                      <Pause className="h-8 w-8 text-white" />
                    ) : (
                      <Play className="h-8 w-8 text-white" />
                    )}
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentTime(Math.min(duration, currentTime + 10))}
                  >
                    +10s
                  </Button>
                </div>
              </div>

              {/* YouTube Audio Player */}
              <div className="hidden">
                <iframe
                  id="youtube-audio-player"
                  src={`https://www.youtube.com/embed/${videoId}?autoplay=0&controls=0&modestbranding=1&rel=0`}
                  title="YouTube audio player"
                  allow="autoplay; encrypted-media"
                  className="w-full h-0"
                />
              </div>
            </CardContent>
          </Card>

          {/* Audio Progress Simulation */}
          {isPlaying && (
            <script
              dangerouslySetInnerHTML={{
                __html: `
                  let simulatedTime = ${currentTime};
                  const simulatedDuration = 300; // 5 minutes for demo
                  
                  const progressInterval = setInterval(() => {
                    simulatedTime += 1;
                    if (simulatedTime >= simulatedDuration) {
                      simulatedTime = 0;
                      clearInterval(progressInterval);
                      window.dispatchEvent(new CustomEvent('audioEnded'));
                    }
                    
                    window.dispatchEvent(new CustomEvent('audioProgress', {
                      detail: { currentTime: simulatedTime, duration: simulatedDuration }
                    }));
                  }, 1000);
                  
                  // Store interval ID for cleanup
                  window.audioProgressInterval = progressInterval;
                `
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                onClick={() => router.push("/")}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">My Library</h1>
                <p className="text-gray-600 mt-1">Your collection of learning materials</p>
              </div>
            </div>
            <Badge variant="secondary" className="px-4 py-2 text-lg">
              {library.length} {library.length === 1 ? 'AudioFile' : 'AudioFiles'}
            </Badge>
          </div>

          {/* Filters */}
          <Card className="mb-8 shadow-sm">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
                <div className="flex-1 w-full relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search your audioFile..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2"
                  />
                </div>
                
                <div className="flex gap-3 w-full lg:w-auto">
                  <Select value={filterBy} onValueChange={setFilterBy}>
                    <SelectTrigger className="w-full lg:w-48">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Filter by..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All AudioFiles</SelectItem>
                      <SelectItem value="recent">Recently Added</SelectItem>
                      <SelectItem value="chapter1">Chapter 1</SelectItem>
                      <SelectItem value="chapter2">Chapter 2</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  {(searchTerm || filterBy !== "all") && (
                    <Button 
                      variant="outline" 
                      onClick={clearFilters}
                      className="whitespace-nowrap"
                    >
                      Clear Filters
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Results Info */}
          {(searchTerm || filterBy !== "all") && (
            <div className="mb-6 flex items-center justify-between">
              <p className="text-gray-600">
                Showing {filteredLibrary.length} of {library.length} audioFiles
                {searchTerm && ` for "${searchTerm}"`}
              </p>
            </div>
          )}

          {/* Library Grid */}
          {isSearching ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <Card key={i} className="overflow-hidden animate-pulse">
                  <Skeleton className="h-64 w-full" />
                  <CardContent className="p-4 space-y-3">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredLibrary.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredLibrary.map((book, index) => (
                <Card
                  key={`${book.bookTitle}-${index}`}
                  className="group cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border-0 shadow-sm overflow-hidden"
                  onClick={() => handleBookSelect(book)}
                >
                  <div className="relative overflow-hidden">
                    <div className="relative h-64 w-full bg-gray-100">
                      <Image
                        src={book.thumbnail || "/placeholder.svg"}
                        alt={book.bookTitle}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                      />
                    </div>
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all duration-300 flex items-center justify-center">
                      <div className="transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                        <div className="bg-white/20 backdrop-blur-sm rounded-full p-4">
                          <Volume2 className="h-8 w-8 text-white" />
                        </div>
                      </div>
                    </div>
                    <Badge className="absolute top-3 left-3 bg-black/70 hover:bg-black/80 text-white">
                      Chapter {book.chapterId}
                    </Badge>
                  </div>

                  <CardContent className="p-4 space-y-3">
                    <h3 className="font-semibold text-gray-800 line-clamp-2 group-hover:text-blue-600 transition-colors min-h-[2.5rem]">
                      {book.bookTitle}
                    </h3>
                    <div className="flex items-center text-xs text-gray-500">
                      <Calendar className="h-3 w-3 mr-1" />
                      Added {new Date(book.purchasedAt).toLocaleDateString()}
                    </div>
                    <div className="flex justify-between items-center pt-2">
                      <span className="text-xs text-blue-600 font-medium">
                        Ready to listen
                      </span>
                      <Button variant="ghost" size="sm" className="h-8 px-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Volume2 className="h-3 w-3 mr-1" />
                        Play
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="text-center py-12 shadow-lg border-0">
              <CardContent className="max-w-md mx-auto">
                <div className="w-20 h-20 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
                  <BookOpen className="h-10 w-10 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  {searchTerm || filterBy !== "all"
                    ? "No audioFiles found"
                    : "Your library is empty"}
                </h3>
                <p className="text-gray-600 mb-6">
                  {searchTerm || filterBy !== "all"
                    ? "Try adjusting your search or filter criteria."
                    : "Start building your collection by exploring our chapters and bundles."}
                </p>
                <div className="flex gap-3 justify-center">
                  <Button 
                    onClick={() => router.push("/chapters")}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <BookOpen className="mr-2 h-4 w-4" />
                    Explore Chapters
                  </Button>
                  {(searchTerm || filterBy !== "all") && (
                    <Button variant="outline" onClick={clearFilters}>
                      Clear Filters
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

function toast({ title, description, variant }: { title: string; description: string; variant: "default" | "destructive" }) {
  Swal.fire({
    title,
    text: description,
    icon: variant === "destructive" ? "error" : "success",
    confirmButtonText: "OK",
    customClass: {
      confirmButton: "bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors",
    },
    buttonsStyling: false,
    timer: 3000,
    timerProgressBar: true,
    position: "top-end",
    toast: true,
    showConfirmButton: false,
    showCloseButton: true,
  });
}

// Add event listener for audio progress simulation
if (typeof window !== 'undefined') {
  window.addEventListener('audioProgress', ((event: CustomEvent<{ currentTime: number; duration: number }>) => {
    // This would be connected to your actual audio player
    console.log('Audio progress:', event.detail);
  }) as EventListener);
}