"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, ArrowLeft, Star, Headphones, Clock, User, Sparkles, BookOpen } from "lucide-react";
import audioAudioBooks from "@/data/books.json";
import Image from "next/image";

export default function AllAudioBooksPage() {
  const router = useRouter();
  const [selectedBookId, setSelectedBookId] = useState<string | null>(null);
  const [isRedirecting, setIsRedirecting] = useState(false);

  const handleBuy = (bookId: string) => {
    setSelectedBookId(bookId);
    setIsRedirecting(true);
    setTimeout(() => {
      router.push(`/purchase-book?bookId=${bookId}`);
    }, 1000);
  };

  const handleBackToLibrary = () => {
    router.push("/");
  };

  // Calculate average rating (for demo purposes)
  const getRandomRating = () => {
    return (Math.random() * 2 + 3).toFixed(1); // Random between 3.0 and 5.0
  };

  const getRandomDuration = () => {
    const durations = ["8h 24m", "12h 15m", "6h 45m", "10h 30m", "15h 20m"];
    return durations[Math.floor(Math.random() * durations.length)];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse delay-1000"></div>
      </div>

      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Enhanced Header */}
        <div className="text-center mb-12">
          <div className=" items-center justify-center mb-4">
            <Button
              variant="ghost"
              onClick={handleBackToLibrary}
              className="mr-4 hover:bg-white/50 backdrop-blur-sm transition-all duration-300"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Library
            </Button>
            <div className="flex justify-center">
              <Headphones className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                AudioBook Collection
              </h1>
            </div>
          </div>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Discover captivating stories narrated by talented voices. Immerse yourself in a world of audio adventures.
          </p>
        </div>

        {/* Books Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {audioAudioBooks.map((book) => (
            <Card 
              key={book.id} 
              className="group relative border-0 bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-105 overflow-hidden"
            >
              {/* Premium Badge */}
              {book.price > 15 && (
                <Badge className="absolute top-3 left-3 z-20 bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 shadow-lg">
                  <Sparkles className="h-3 w-3 mr-1" />
                  Premium
                </Badge>
              )}

              {/* Bestseller Badge */}
              {Math.random() > 0.7 && (
                <Badge className="absolute top-3 right-3 z-20 bg-red-500 text-white border-0 shadow-lg">
                  Bestseller
                </Badge>
              )}

              <CardHeader className="p-0 relative overflow-hidden">
                <div className="relative overflow-hidden flex justify-center items-center bg-gray-100 min-h-[350px]">
                  <Image
                    src={book.thumbnail || "/placeholder.svg"}
                    alt={book.title}
                    width={248} // A4 width aspect ratio (210mm)
                    height={350} // A4 height aspect ratio (297mm)
                    className="object-contain group-hover:scale-105 transition-transform duration-500"
                    style={{
                      width: '248px',
                      height: '350px'
                    }}
                  />
                  {/* Overlay Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
              </CardHeader>

              <CardContent className="p-6 space-y-4">
                {/* Book Title */}
                <CardTitle className="text-lg font-bold leading-tight line-clamp-2 group-hover:text-blue-600 transition-colors">
                  {book.title}
                </CardTitle>

                {/* Author */}
                <div className="flex items-center text-sm text-gray-600">
                  <User className="h-4 w-4 mr-1" />
                  <span className="line-clamp-1">By {"Mehran Dadbeh"}</span>
                </div>

                {/* Rating and Duration */}
               

                {/* Price */}
                <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                  <div>
                    <span className="text-2xl font-bold text-gray-900">${book.price}</span>
                    {book.price > 20 && (
                      <span className="text-sm text-green-600 ml-2 font-semibold">Value Pick</span>
                    )}
                  </div>
                </div>

                {/* Buy Button - Direct Purchase */}
                <Button
                  size="lg"
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-3 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl border-0"
                  onClick={() => handleBuy(book.id)}
                  disabled={isRedirecting && selectedBookId === book.id}
                >
                  {isRedirecting && selectedBookId === book.id ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Redirecting...
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <BookOpen className="mr-2 h-5 w-5" />
                      Buy Now
                    </div>
                  )}
                </Button>
              </CardContent>

              {/* Hover Effect Border */}
              <div className="absolute inset-0 border-2 border-transparent group-hover:border-blue-300 rounded-lg transition-all duration-300 pointer-events-none" />
            </Card>
          ))}
        </div>

        {/* Footer CTA */}
        <div className="text-center mt-12 p-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl text-white">
          <Headphones className="h-12 w-12 mx-auto mb-4 opacity-90" />
          <h2 className="text-2xl font-bold mb-2">Ready to Start Your Audio Journey?</h2>
          <p className="text-blue-100 mb-4 max-w-2xl mx-auto">
            Join thousands of readers who have discovered the joy of audiobooks. 
            Start listening to your first book today!
          </p>
          <Button 
            size="lg" 
            variant="secondary"
            className="bg-white text-blue-600 hover:bg-gray-100 font-semibold"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            <Headphones className="mr-2 h-5 w-5" />
            Browse All Books
          </Button>
        </div>
      </div>
    </div>
  );
}