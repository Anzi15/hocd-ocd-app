"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, CreditCard, Wallet, CheckCircle, Shield, Zap, Smartphone } from "lucide-react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "@/lib/firebase";
import { loadBundle, clearBundle, loadSettings } from "@/lib/storage";
import { toast } from "@/hooks/use-toast";
import AuthModal from "@/components/auth-modal";
import Image from "next/image";
import {
  PayPalScriptProvider,
  PayPalButtons,
} from "@paypal/react-paypal-js";
import Link from "next/link";
import { doc, getDoc, setDoc, updateDoc, arrayUnion } from "firebase/firestore";

// Stripe imports
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY || ""
);

export default function CheckoutPage() {
  const router = useRouter();
  const [user] = useAuthState(auth);
  const [bundle, setBundle] = useState([]);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("paypal");
  const [settings, setSettings] = useState(null);

  // Load settings + bundle
  useEffect(() => {
    if (typeof window !== "undefined") {
      setSettings(loadSettings());
      const savedBundle = loadBundle();
      setBundle(savedBundle);

      if (savedBundle.length === 0) {
        router.push("/");
      }
    }
  }, [router]);

  const playButtonSound = () => {
    if (settings?.soundEnabled) {
      const audioContext = new (window.AudioContext ||
        window.webkitAudioContext)();
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
      
      // Get existing user data
      const userDoc = await getDoc(userRef);
      
      const newLibraryItems = bundle.map((book) => ({
        bookTitle: book.title,
        chapterId: "current",
        videoUrl: book.youtubeUrl,
        purchasedAt: new Date().toISOString(),
        thumbnail: book.thumbnail,
        id: `${book.title}-${Date.now()}`,
      }));

      if (userDoc.exists()) {
        await updateDoc(userRef, {
          library: arrayUnion(...newLibraryItems)
        });
      } else {
        await setDoc(userRef, { 
          library: newLibraryItems,
          createdAt: new Date().toISOString(),
          email: user.email
        });
      }

      clearBundle();

      toast({
        title: "Payment successful! AudioFile added to your library.",
      });

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

  if (bundle.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="animate-pulse text-center">
          <div className="w-16 h-16 bg-blue-200 rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600 font-body">Loading your bundle...</p>
        </div>
      </div>
    );
  }

  const totalAmount = 85;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-100">
      {/* Mobile Header */}
      <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg z-10 lg:hidden">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="p-2 bg-white/20 hover:bg-white/30 text-white rounded-full"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="text-center flex-1">
              <h1 className="text-xl font-bold text-white font-heading">
                Checkout
              </h1>
              <p className="text-white/80 text-xs">Secure payment</p>
            </div>
            <div className="w-8"></div> {/* Spacer for balance */}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-4 lg:py-8">
        <div className="max-w-2xl mx-auto">
          {/* Desktop Header - Hidden on mobile */}
          <div className="hidden lg:flex items-center mb-8">
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="mr-4 animate-button-press hover:scale-105 transition-transform duration-200"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              <span className="font-body">Back</span>
            </Button>
            <div className="flex-1 text-center">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent font-heading drop-shadow-sm">
                Complete Your Purchase
              </h1>
              <p className="text-gray-600 mt-2 font-body">Secure checkout • Instant access</p>
            </div>
          </div>

          {/* Mobile First Layout - Single Column */}
          <div className="space-y-6 lg:grid lg:grid-cols-3 lg:gap-8 lg:space-y-0">
            {/* Order Summary - Mobile Top */}
            <div className="lg:col-span-1 lg:order-2">
              <Card className="border-2 border-green-100 shadow-lg lg:sticky lg:top-8">
                <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b p-4 lg:p-6">
                  <CardTitle className="font-heading text-xl lg:text-2xl flex items-center justify-center lg:justify-start">
                    <Smartphone className="lg:hidden h-5 w-5 mr-2 text-green-600" />
                    <CheckCircle className="hidden lg:block h-6 w-6 mr-3 text-green-600" />
                    Order Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 lg:p-6 space-y-4 lg:space-y-6">
                  {/* Bundle Items - Scrollable on mobile */}
                  <div className="space-y-3 max-h-60 overflow-y-auto lg:max-h-80">
                    {bundle.map((book, index) => (
                      <div
                        key={index}
                        className="flex items-center space-x-3 p-3 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg border border-gray-200"
                      >
                        <div className="relative flex-shrink-0">
                          <Image
                            src={book.thumbnail || "/placeholder.svg"}
                            alt={book.title}
                            width={50}
                            height={75}
                            className="rounded-lg object-cover shadow-sm"
                          />
                          <div className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                            {index + 1}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-gray-800 font-heading text-sm truncate">
                            {book.title}
                          </h4>
                          <p className="text-xs text-gray-600 font-body">AudioFile</p>
                        </div>
                        <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                      </div>
                    ))}
                  </div>

                  {/* Total Section */}
                  <div className="border-t-2 border-gray-100 pt-4 space-y-3">
                    <div className="flex justify-between items-center text-base lg:text-lg">
                      <span className="font-body text-gray-600">Subtotal</span>
                      <span className="font-semibold font-heading">${totalAmount}</span>
                    </div>
                    <div className="flex justify-between items-center text-base lg:text-lg">
                      <span className="font-body text-gray-600">Discount</span>
                      <span className="font-semibold text-green-600 font-heading">$0</span>
                    </div>
                    <div className="border-t pt-3">
                      <div className="flex justify-between items-center text-lg lg:text-xl font-bold">
                        <span className="font-body">Total</span>
                        <span className="text-xl lg:text-2xl bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent font-heading">
                          ${totalAmount}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1 font-body text-center">
                        {bundle.length} audioFile{bundle.length > 1 ? 's' : ''} • One-time payment
                      </p>
                    </div>
                  </div>

                  {/* Mobile Features List */}
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-3 space-y-2 lg:hidden">
                    <div className="flex items-center space-x-2">
                      <Zap className="h-3 w-3 text-blue-500" />
                      <span className="text-xs font-body">Instant access</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-3 w-3 text-green-500" />
                      <span className="text-xs font-body">Lifetime updates</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Shield className="h-3 w-3 text-purple-500" />
                      <span className="text-xs font-body">30-day guarantee</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Payment Section - Mobile Bottom */}
            <div className="lg:col-span-2 lg:order-1 space-y-6">
              {/* Security Banner - Mobile Optimized */}
              <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-xl p-3">
                <div className="flex items-center justify-center space-x-2 flex-wrap">
                  <Shield className="h-4 w-4 text-green-600" />
                  <span className="text-green-700 font-medium font-body text-sm">Secure SSL</span>
                  <span className="text-gray-400">•</span>
                  <Zap className="h-4 w-4 text-blue-600" />
                  <span className="text-blue-700 font-medium font-body text-sm">Instant Access</span>
                </div>
              </div>

              {/* Payment Method Card */}
              <Card className="border-2 border-blue-100 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b p-4 lg:p-6">
                  <CardTitle className="font-heading text-xl lg:text-2xl flex items-center justify-center lg:justify-start">
                    <Wallet className="h-5 w-5 lg:h-6 lg:w-6 mr-2 lg:mr-3 text-blue-600" />
                    Payment Method
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 lg:p-6 space-y-4 lg:space-y-6">
                  {!user && (
                    <div className="bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200 rounded-xl p-4 text-center">
                      <div className="flex items-center justify-center mb-2">
                        <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                          <CheckCircle className="h-5 w-5 text-yellow-600" />
                        </div>
                      </div>
                      <p className="text-yellow-800 font-body text-base font-semibold mb-3">
                        Sign in to complete purchase
                      </p>
                      <button
                        onClick={() => {
                          setShowAuthModal(true);
                          setTimeout(
                            () => window.scrollTo(0, document.body.scrollHeight),
                            200
                          );
                        }}
                        className="bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg w-full text-sm"
                      >
                        Login / Sign Up
                      </button>
                    </div>
                  )}

                  <Tabs value={paymentMethod} onValueChange={setPaymentMethod}>
                    <TabsList className="grid w-full grid-cols-1 bg-blue-50 p-1 rounded-lg lg:rounded-xl">
                      <TabsTrigger 
                        value="paypal" 
                        className="data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:border data-[state=active]:border-blue-200 rounded-md lg:rounded-lg py-3 text-sm lg:text-base"
                      >
                        <Wallet className="mr-2 lg:mr-3 h-4 w-4 lg:h-5 lg:w-5" /> 
                        <span>PayPal</span>
                      </TabsTrigger>
                    </TabsList>

                    {/* PayPal Content */}
                    <TabsContent value="paypal" className="space-y-4 lg:space-y-6 pt-4">
                      <div className="text-center p-4 lg:p-8 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl lg:rounded-2xl border border-blue-200">
                        <div className="w-12 h-12 lg:w-20 lg:h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3 lg:mb-4">
                          <Wallet className="h-6 w-6 lg:h-10 lg:w-10 text-blue-600" />
                        </div>
                        <h3 className="text-lg lg:text-xl font-semibold text-gray-800 mb-2 font-heading">
                          Secure PayPal
                        </h3>
                        <p className="text-gray-600 font-body text-sm lg:text-lg">
                          Pay <span className="font-bold text-green-600">${totalAmount} USD</span>
                        </p>
                      </div>

                      {user && (
                        <PayPalScriptProvider
                          options={{
                            clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "",
                            currency: "USD",
                          }}
                        >
                          <div className="border-2 border-blue-100 rounded-xl lg:rounded-2xl p-3 lg:p-6 bg-white">
                            <PayPalButtons
                              style={{ 
                                layout: "vertical",
                                shape: "rect",
                                color: "blue",
                                height: 40
                              }}
                              createOrder={(data, actions) => {
                                return actions.order.create({
                                  purchase_units: [
                                    {
                                      description: `Purchase of ${bundle.length} AudioFile(s)`,
                                      amount: { value: totalAmount.toFixed(2) },
                                    },
                                  ],
                                });
                              }}
                              onApprove={async (data, actions) => {
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
                                }
                              }}
                              onError={() =>
                                toast({
                                  title: "Payment error",
                                  description: "PayPal payment could not be completed.",
                                  variant: "destructive",
                                })
                              }
                            />
                          </div>
                        </PayPalScriptProvider>
                      )}
                    </TabsContent>
                  </Tabs>

                  {/* Security Footer */}
                  <div className="text-center space-y-2 lg:space-y-3">
                    <div className="flex items-center justify-center space-x-2 lg:space-x-4 text-xs lg:text-sm text-gray-500 flex-wrap">
                      <Shield className="h-3 w-3 lg:h-4 lg:w-4" />
                      <span className="font-body">256-bit SSL</span>
                      <span>•</span>
                      <span className="font-body">PCI DSS Compliant</span>
                    </div>
                    <p className="text-xs text-gray-500 font-body leading-relaxed">
                      Your payment is secure and encrypted. By completing this purchase, you agree to our{" "}
                      <Link href="/privacy" target="_blank" className="text-blue-600 underline hover:text-blue-800">
                        Privacy Policy
                      </Link>{" "}
                      and{" "}
                      <Link href="/terms" target="_blank" className="text-blue-600 underline hover:text-blue-800">
                        Terms
                      </Link>.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Desktop Features List */}
              <div className="hidden lg:block bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 space-y-2">
                <div className="flex items-center space-x-2">
                  <Zap className="h-4 w-4 text-blue-500" />
                  <span className="text-sm font-body">Instant access after payment</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm font-body">Lifetime updates included</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Shield className="h-4 w-4 text-purple-500" />
                  <span className="text-sm font-body">30-day satisfaction guarantee</span>
                </div>
              </div>
            </div>
          </div>
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

function StripeCheckoutForm({ amount, onSuccess }) {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);

  const handleStripeSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setProcessing(true);

    try {
      const res = await fetch("/api/create-payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount }),
      });

      const { clientSecret, error: serverError } = await res.json();
      if (serverError) throw new Error(serverError);

      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
        },
      });

      if (result.error) {
        toast({
          title: "Stripe error",
          description: result.error.message,
          variant: "destructive",
        });
      } else if (result.paymentIntent.status === "succeeded") {
        toast({ title: "Payment successful!" });
        onSuccess();
      }
    } catch (err) {
      toast({
        title: "Stripe error",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleStripeSubmit} className="space-y-4">
      <div className="p-3 lg:p-4 border-2 border-blue-100 rounded-xl bg-white shadow-sm">
        <CardElement options={{ 
          style: { 
            base: { 
              fontSize: "16px",
              lineHeight: "1.5"
            } 
          } 
        }} />
      </div>

      <Button
        type="submit"
        disabled={!stripe || processing}
        className="w-full h-12 lg:h-14 text-base lg:text-lg font-heading bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-300 shadow-lg"
      >
        {processing ? "Processing..." : `Pay $${amount}`}
      </Button>
    </form>
  );
}