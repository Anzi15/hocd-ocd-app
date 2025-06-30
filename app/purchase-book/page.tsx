"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, CreditCard, Wallet } from "lucide-react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/lib/firebase";
import { loadSettings } from "@/lib/storage";
import { toast } from "@/hooks/use-toast";
import AuthModal from "@/components/auth-modal";
import Image from "next/image";
import audioAudioBooks from "@/data/books.json";

function PurchaseBookPage() {
  const router = useRouter();
  const params = useSearchParams();
  const [user] = useAuthState(auth);

  const bookId = params.get("bookId");
  const [book, setBook] = useState<any>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [cardDetails, setCardDetails] = useState({
    number: "",
    expiry: "",
    cvv: "",
    name: "",
  });
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

  const handlePayment = async () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    if (paymentMethod === "card") {
      if (
        !cardDetails.number ||
        !cardDetails.expiry ||
        !cardDetails.cvv ||
        !cardDetails.name
      ) {
        toast({
          title: "Please fill in all card details",
          variant: "destructive",
        });
        return;
      }
    }

    playButtonSound();
    setProcessing(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const existingLibrary = JSON.parse(
        localStorage.getItem("user_library") || "[]"
      );
      const newItem = {
        bookTitle: book.title,
        chapterId: "single",
        videoUrl: book.youtubeUrl,
        purchasedAt: new Date().toISOString(),
        thumbnail: book.thumbnail,
      };

      const updatedLibrary = [...existingLibrary, newItem];
      localStorage.setItem("user_library", JSON.stringify(updatedLibrary));

      toast({ title: "Payment successful! Book added to your library." });
      router.push("/library");
    } catch (error) {
      toast({
        title: "Payment failed",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  if (!book)
    return <div className="p-8 text-center">Loading book details...</div>;

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
            <h1 className="text-3xl font-bold text-gray-800 font-heading">
              Buy Book
            </h1>
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
              <CardTitle className="font-heading">Payment Method</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Tabs value={paymentMethod} onValueChange={setPaymentMethod}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger
                    value="card"
                    className="animate-button-press font-body"
                  >
                    <CreditCard className="mr-2 h-4 w-4" />
                    Credit Card
                  </TabsTrigger>
                  <TabsTrigger
                    value="paypal"
                    className="animate-button-press font-body"
                  >
                    <Wallet className="mr-2 h-4 w-4" />
                    PayPal
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="card" className="space-y-4">
                  <Label className="font-body">Cardholder Name</Label>
                  <Input
                    value={cardDetails.name}
                    onChange={(e) =>
                      setCardDetails({ ...cardDetails, name: e.target.value })
                    }
                    placeholder="John Doe"
                  />
                  <Label className="font-body">Card Number</Label>
                  <Input
                    value={cardDetails.number}
                    onChange={(e) =>
                      setCardDetails({ ...cardDetails, number: e.target.value })
                    }
                    placeholder="1234 5678 9012 3456"
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="font-body">Expiry</Label>
                      <Input
                        value={cardDetails.expiry}
                        onChange={(e) =>
                          setCardDetails({
                            ...cardDetails,
                            expiry: e.target.value,
                          })
                        }
                        placeholder="MM/YY"
                      />
                    </div>
                    <div>
                      <Label className="font-body">CVV</Label>
                      <Input
                        value={cardDetails.cvv}
                        onChange={(e) =>
                          setCardDetails({
                            ...cardDetails,
                            cvv: e.target.value,
                          })
                        }
                        placeholder="123"
                      />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="paypal">
                  <div className="text-center p-8 bg-blue-50 rounded-lg">
                    <Wallet className="h-16 w-16 text-blue-600 mx-auto mb-4" />
                    <p className="text-gray-600 font-body">
                      You'll be redirected to PayPal to complete payment.
                    </p>
                  </div>
                </TabsContent>
              </Tabs>

              <Button
                onClick={handlePayment}
                disabled={processing}
                className="w-full h-12 text-lg animate-button-press font-heading"
              >
                {processing ? (
                  "Processing..."
                ) : (
                  <>
                    {paymentMethod === "card" ? (
                      <CreditCard className="mr-2 h-5 w-5" />
                    ) : (
                      <Wallet className="mr-2 h-5 w-5" />
                    )}
                    Pay ${book.price} with {paymentMethod}
                  </>
                )}
              </Button>
              <p className="text-xs text-gray-500 text-center font-body">
                Secure payment processing. Book will be added to your library.
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
};


export default function Page() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Loading book details...</div>}>
      <PurchaseBookPage />
    </Suspense>
  );
}
