"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Wallet } from "lucide-react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "@/lib/firebase";
import { loadSettings } from "@/lib/storage";
import { toast } from "@/hooks/use-toast";
import AuthModal from "@/components/auth-modal";
import Image from "next/image";
import audioAudioBooks from "@/data/books.json";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { doc, getDoc, setDoc, updateDoc, arrayUnion } from "firebase/firestore";

function PurchaseBookPage() {
  const router = useRouter();
  const params = useSearchParams();
  const [user] = useAuthState(auth);

  const bookId = params.get("bookId");
  const [book, setBook] = useState<any>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    setSettings(loadSettings());
    if (!bookId) return;

    const selected = audioAudioBooks.find((b) => b.id === bookId);
    if (!selected) {
      toast({ title: "Book not found", variant: "destructive" });
      router.push("/");
    } else {
      setBook(selected);
    }
  }, [bookId, router]);

  const playButtonSound = () => {
    if (settings?.soundEnabled) {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      oscillator.frequency.value = 600;
      oscillator.type = "sine";
      gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15);
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.15);
    }
  };

  const handleSuccess = async () => {
    if (!user) {
      toast({
        title: "Login required",
        description: "Please sign in to save your purchase.",
        variant: "destructive",
      });
      return;
    }

    try {
      const userRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userRef);

      const newLibraryItem = {
        bookTitle: book.title,
        chapterId: "single",
        videoUrl: book.youtubeUrl,
        purchasedAt: new Date().toISOString(),
        thumbnail: book.thumbnail,
        id: `${book.title}-${Date.now()}`,
      };

      if (userDoc.exists()) {
        await updateDoc(userRef, { library: arrayUnion(newLibraryItem) });
      } else {
        await setDoc(userRef, {
          library: [newLibraryItem],
          createdAt: new Date().toISOString(),
          email: user.email,
        });
      }

      toast({ title: "Payment successful! Book added to your library." });
      router.push("/library");
    } catch (error) {
      console.error("Error saving to Firestore:", error);
      toast({
        title: "Error",
        description: "Could not save purchase to your library.",
        variant: "destructive",
      });
    }
  };

  if (!book) return <div className="p-8 text-center">Loading book details...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center mb-8">
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="mr-4 animate-button-press"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              <span className="font-body">Back</span>
            </Button>
            <h1 className="text-3xl font-bold text-gray-800 font-heading">Buy Book</h1>
          </div>

          <Card className="mb-6 animate-scale-hover">
            <CardHeader>
              <CardTitle className="font-heading">Selected Book</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 flex items-center">
              <Image
                src={book.thumbnail || "/placeholder.svg"}
                alt={book.title}
                width={100}
                height={140}
                className="rounded object-cover"
              />
              <div className="ml-4">
                <h2 className="text-xl font-heading">{book.title}</h2>
                <p className="text-green-600 font-semibold">${book.price}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="animate-scale-hover">
            <CardHeader>
              <CardTitle className="font-heading">Pay with PayPal</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {!user && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-yellow-800 font-body">Please sign in to purchase this book.</p>
                </div>
              )}

              <div className="text-center p-8 bg-blue-50 rounded-lg">
                <Wallet className="h-16 w-16 text-blue-600 mx-auto mb-4" />
                <p className="text-gray-600 font-body">
                  You'll be redirected to PayPal to complete your payment securely.
                </p>
              </div>

              {user && (
                <PayPalScriptProvider
                  options={{
                    clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "",
                    currency: "USD",
                  }}
                >
                  <PayPalButtons
                    style={{ layout: "vertical" }}
                    createOrder={(data, actions) => {
                      return actions.order.create({
                        purchase_units: [
                          {
                            description: book.title,
                            amount: {
                              currency_code: "USD",
                              value: book.price.toString(),
                            }
                          },
                        ],
                        intent: "CAPTURE"
                      });
                    }}
                    onApprove={async (data, actions) => {
                      setProcessing(true);
                      playButtonSound();

                      try {
                        if (actions.order) {
                          await actions.order.capture();
                          await handleSuccess();
                        } else {
                          toast({
                            title: "Payment failed",
                            description: "PayPal order actions are unavailable.",
                            variant: "destructive",
                          });
                        }
                      } catch (err) {
                        toast({
                          title: "Payment failed",
                          description: "Something went wrong during PayPal processing.",
                          variant: "destructive",
                        });
                      } finally {
                        setProcessing(false);
                      }
                    }}
                    onError={() => {
                      toast({
                        title: "Payment error",
                        description: "PayPal payment could not be completed.",
                        variant: "destructive",
                      });
                    }}
                  />
                </PayPalScriptProvider>
              )}

              <p className="text-xs text-gray-500 text-center font-body">
                Secure payment processing. Book will be added to your library after successful transaction.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={() => setShowAuthModal(false)}
      />
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Loading book details...</div>}>
      <PurchaseBookPage />
    </Suspense>
  );
}
