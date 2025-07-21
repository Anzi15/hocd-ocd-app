"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, CreditCard, Wallet } from "lucide-react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/lib/firebase";
import { loadBundle, clearBundle, loadSettings } from "@/lib/storage";
import { toast } from "@/hooks/use-toast";
import AuthModal from "@/components/auth-modal";
import Image from "next/image";
import {
  PayPalScriptProvider,
  PayPalButtons,
} from "@paypal/react-paypal-js";
import Link from "next/link";

export default function CheckoutPage() {
  const router = useRouter();
  const [user] = useAuthState(auth);
  const [bundle, setBundle] = useState<any[]>([]);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("paypal");
  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setSettings(loadSettings());
    }

    const savedBundle = loadBundle();
    setBundle(savedBundle);

    if (savedBundle.length === 0) {
      router.push("/");
    }
  }, [router]);

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

  const handleSuccess = async () => {
    const existingLibrary = JSON.parse(
      localStorage.getItem("user_library") || "[]"
    );
    const newLibraryItems = bundle.map((book: any) => ({
      bookTitle: book.title,
      chapterId: "current",
      videoUrl: book.youtubeUrl,
      purchasedAt: new Date().toISOString(),
      thumbnail: book.thumbnail,
    }));

    const updatedLibrary = [...existingLibrary, ...newLibraryItems];
    localStorage.setItem("user_library", JSON.stringify(updatedLibrary));
    clearBundle();

    toast({
      title: "Payment successful! AudioFile added to your library.",
    });

    router.push("/library");
  };

  const handlePayment = async () => {
    toast({
      title: "Card payments not supported",
      description: "Please use PayPal to complete your purchase.",
      variant: "destructive",
    });
  };

  if (bundle.length === 0) {
    return <div>Loading...</div>;
  }

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
              Checkout
            </h1>
          </div>

          <Card className="animate-scale-hover">
            <CardHeader>
              <CardTitle className="font-heading">Payment Method</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {!user && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-yellow-800 font-body">
                    Please sign in to complete your purchase.
                  </p>
                
                      <div className="flex flex-col sm:flex-row justify-center gap-2">
      <button
        onClick={() => {
          console.log("Login button clicked");
          setShowAuthModal(true);
          setTimeout(() => window.scrollTo(0, document.body.scrollHeight), 200);
        }}
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-medium transition"
      >
        Login / Sign up (Modal)
      </button>
    </div>
                </div>

              )}

              <Tabs value={paymentMethod} onValueChange={setPaymentMethod}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger
                    value="paypal"
                    className="animate-button-press font-body"
                  >
                    <Wallet className="mr-2 h-4 w-4" />
                    PayPal
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="paypal" className="space-y-4">
                  <div className="text-center p-8 bg-blue-50 rounded-lg">
                    <Wallet className="h-16 w-16 text-blue-600 mx-auto mb-4" />
                    <p className="text-gray-600 font-body">
                      You'll be redirected to PayPal to complete your payment securely.
                    </p>
                  </div>

                  {user && (
                    <PayPalScriptProvider
                      options={{
                        clientId:
                          process.env.NEXT_PUBLIC_PAYPAL_PUBLISH_KEY || "",
                        currency: "USD",
                      }}
                    >
                      <PayPalButtons
                        style={{ layout: "vertical" }}
                        createOrder={(data, actions) => {
                          return actions.order.create({
                            purchase_units: [
                              {
                                description: `Purchase of ${bundle.length} AudioFile(s)`,
                                amount: {
                                  value: "45.00",
                                },
                              },
                            ],
                          });
                        }}
                        onApprove={async (data, actions) => {
                          setProcessing(true);
                          playButtonSound();

                          try {
                            await actions.order.capture();
                            await handleSuccess();
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
                        onError={(err) => {
                          toast({
                            title: "Payment error",
                            description: "PayPal payment could not be completed.",
                            variant: "destructive",
                          });
                        }}
                      />
                    </PayPalScriptProvider>
                  )}
                </TabsContent>
              </Tabs>

              {paymentMethod === "card" && (
                <Button
                  onClick={handlePayment}
                  disabled={processing}
                  className="w-full h-12 text-lg animate-button-press font-heading"
                  style={{ backgroundColor: "var(--primary-color)" }}
                >
                  {processing ? (
                    "Processing..."
                  ) : (
                    <>
                      <CreditCard className="mr-2 h-5 w-5" />
                      Pay $45 with Card
                    </>
                  )}
                </Button>
              )}

              <p className="text-xs text-gray-500 text-center font-body">
                Secure payment processing. Your audioFile will be instantly
                available in your library.
              </p>
            </CardContent>
          </Card>

          <Card className="mb-6 animate-scale-hover">
            <CardHeader>
              <CardTitle className="font-heading">
                Your Learning Bundle
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {bundle.map((book, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-4 p-4 border rounded-lg animate-scale-hover"
                >
                  <Image
                    src={book.thumbnail || "/placeholder.svg"}
                    alt={book.title}
                    width={60}
                    height={90}
                    className="rounded object-cover"
                  />
                  <div className="flex-1">
                    <h4 className="font-semibold font-heading">{book.title}</h4>
                  </div>
                </div>
              ))}

              <div className="border-t pt-4">
                <div className="flex justify-between items-center text-lg font-semibold">
                  <span className="font-body">
                    Total ({bundle.length} audioFile)
                  </span>
                  <span className="text-2xl text-green-600 font-heading">
                    $45
                  </span>
                </div>
              </div>
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
