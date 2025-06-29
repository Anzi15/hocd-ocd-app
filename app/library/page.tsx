"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Search, Play, Calendar, BookOpen } from "lucide-react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/lib/firebase";
import type { LibraryBook } from "@/lib/types";
import VideoPlayer from "@/components/video-player";
import Image from "next/image";

export default function LibraryPage() {
  const router = useRouter();
  const [user] = useAuthState(auth);
  const [library, setLibrary] = useState<LibraryBook[]>([]);
  const [filteredLibrary, setFilteredLibrary] = useState<LibraryBook[]>([]);
  const [selectedBook, setSelectedBook] = useState<LibraryBook | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterBy, setFilterBy] = useState("all");

  useEffect(() => {
    if (!user) {
      router.push("/");
      return;
    }

    // Load library from localStorage (in real app, this would be from Firebase)
    const savedLibrary = JSON.parse(
      localStorage.getItem("user_library") || "[]"
    );
    setLibrary(savedLibrary);
    setFilteredLibrary(savedLibrary);
  }, [user, router]);

  useEffect(() => {
    let filtered = library;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter((book) =>
        book.bookTitle.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by category
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
  }, [library, searchTerm, filterBy]);

  const handleBookSelect = (book: LibraryBook) => {
    setSelectedBook(book);
  };

  const handleBackToLibrary = () => {
    setSelectedBook(null);
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  if (selectedBook) {
    console.log("Selected Book:", selectedBook);
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center mb-6">
              <Button
                variant="ghost"
                onClick={handleBackToLibrary}
                className="mr-4"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Library
              </Button>
            </div>
            <h1 className="text-2xl font-bold text-gray-800 py-4">
              {selectedBook.bookTitle}
            </h1>
            <VideoPlayer
              url={selectedBook.videoUrl}
              title={selectedBook.bookTitle}
              thumbnail={selectedBook.thumbnail}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center mb-8">
            <Button
              variant="ghost"
              onClick={() => router.push("/")}
              className="mr-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
            <h1 className="text-3xl font-bold text-gray-800">My Library</h1>
          </div>

          {/* Filters */}
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search your audioFile..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={filterBy} onValueChange={setFilterBy}>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="Filter by..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All AudioFile</SelectItem>
                    <SelectItem value="recent">Recently Added</SelectItem>
                    <SelectItem value="chapter1">Chapter 1</SelectItem>
                    <SelectItem value="chapter2">Chapter 2</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Library Grid */}
          {filteredLibrary.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredLibrary.map((book, index) => (
                <Card
                  key={index}
                  className="cursor-pointer transition-all hover:shadow-lg hover:scale-105"
                  onClick={() => handleBookSelect(book)}
                >
                  <CardContent className="p-4">
                    <div className="space-y-4">
                      <div className="relative">
                        <Image
                          src={book.thumbnail || "/placeholder.svg"}
                          alt={book.bookTitle}
                          width={200}
                          height={120}
                          className="w-full h-32 object-cover rounded"
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity rounded flex items-center justify-center">
                          <Play className="h-8 w-8 text-white" />
                        </div>
                      </div>

                      <div>
                        <h3 className="font-semibold text-sm line-clamp-2">
                          {book.bookTitle}
                        </h3>
                        <div className="flex items-center text-xs text-gray-500 mt-2">
                          <Calendar className="h-3 w-3 mr-1" />
                          {new Date(book.purchasedAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">
                  {searchTerm || filterBy !== "all"
                    ? "No audioFile found"
                    : "Your library is empty"}
                </h3>
                <p className="text-gray-500 mb-6">
                  {searchTerm || filterBy !== "all"
                    ? "Try adjusting your search or filter criteria."
                    : "Complete chapters and purchase bundles to build your learning library."}
                </p>
                <Button onClick={() => router.push("/chapters")}>
                  <BookOpen className="mr-2 h-4 w-4" />
                  Explore Chapters
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
