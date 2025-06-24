"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, CreditCard, Wallet } from "lucide-react"
import { useAuthState } from "react-firebase-hooks/auth"
import { auth } from "@/lib/firebase"
import { loadBundle, clearBundle, loadSettings } from "@/lib/storage"
import { toast } from "@/hooks/use-toast"
import AuthModal from "@/components/auth-modal"
import Image from "next/image"

export default function CheckoutPage() {
  const router = useRouter()
  const [user] = useAuthState(auth)
  const [bundle, setBundle] = useState<any[]>([])
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState("card")
  const [cardDetails, setCardDetails] = useState({
    number: "",
    expiry: "",
    cvv: "",
    name: "",
  })
  const [settings, setSettings] = useState<any>(null)

  useEffect(() => {
    if (typeof window !== "undefined") {
      setSettings(loadSettings())
    }

    const savedBundle = loadBundle()
    setBundle(savedBundle)

    if (savedBundle.length === 0) {
      router.push("/")
    }
  }, [router])

  const playButtonSound = () => {
    if (settings?.soundEnabled) {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)

      oscillator.frequency.value = 600
      oscillator.type = "sine"

      gainNode.gain.setValueAtTime(0.2, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15)

      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.15)
    }
  }

  const handlePayment = async () => {
    if (!user) {
      setShowAuthModal(true)
      return
    }

    if (paymentMethod === "card") {
      if (!cardDetails.number || !cardDetails.expiry || !cardDetails.cvv || !cardDetails.name) {
        toast({
          title: "Please fill in all card details",
          variant: "destructive",
        })
        return
      }
    }

    playButtonSound()
    setProcessing(true)

    try {
      await new Promise((resolve) => setTimeout(resolve, 2000))

      const existingLibrary = JSON.parse(localStorage.getItem("user_library") || "[]")
      const newLibraryItems = bundle.map((book) => ({
        bookTitle: book.title,
        chapterId: "current",
        videoUrl: book.youtubeUrl,
        purchasedAt: new Date().toISOString(),
        thumbnail: book.thumbnail,
      }))

      const updatedLibrary = [...existingLibrary, ...newLibraryItems]
      localStorage.setItem("user_library", JSON.stringify(updatedLibrary))

      clearBundle()

      toast({ title: "Payment successful! Books added to your library." })
      router.push("/library")
    } catch (error) {
      toast({
        title: "Payment failed",
        description: "Please try again.",
        variant: "destructive",
      })
    } finally {
      setProcessing(false)
    }
  }

  if (bundle.length === 0) {
    return <div>Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center mb-8">
            <Button variant="ghost" onClick={() => router.back()} className="mr-4 animate-button-press">
              <ArrowLeft className="h-4 w-4 mr-2" />
              <span className="font-body">Back</span>
            </Button>
            <h1 className="text-3xl font-bold text-gray-800 font-heading">Checkout</h1>
          </div>

                    <Card className="animate-scale-hover">
            <CardHeader>
              <CardTitle className="font-heading">Payment Method</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {!user && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-yellow-800 font-body">Please sign in to complete your purchase.</p>
                </div>
              )}

              <Tabs value={paymentMethod} onValueChange={setPaymentMethod}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="card" className="animate-button-press font-body">
                    <CreditCard className="mr-2 h-4 w-4" />
                    Credit Card
                  </TabsTrigger>
                  <TabsTrigger value="paypal" className="animate-button-press font-body">
                    <Wallet className="mr-2 h-4 w-4" />
                    PayPal
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="card" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <Label htmlFor="card-name" className="font-body">
                        Cardholder Name
                      </Label>
                      <Input
                        id="card-name"
                        placeholder="John Doe"
                        value={cardDetails.name}
                        onChange={(e) => setCardDetails((prev) => ({ ...prev, name: e.target.value }))}
                        className="font-body"
                      />
                    </div>
                    <div className="col-span-2">
                      <Label htmlFor="card-number" className="font-body">
                        Card Number
                      </Label>
                      <Input
                        id="card-number"
                        placeholder="1234 5678 9012 3456"
                        value={cardDetails.number}
                        onChange={(e) => setCardDetails((prev) => ({ ...prev, number: e.target.value }))}
                        className="font-body"
                      />
                    </div>
                    <div>
                      <Label htmlFor="card-expiry" className="font-body">
                        Expiry Date
                      </Label>
                      <Input
                        id="card-expiry"
                        placeholder="MM/YY"
                        value={cardDetails.expiry}
                        onChange={(e) => setCardDetails((prev) => ({ ...prev, expiry: e.target.value }))}
                        className="font-body"
                      />
                    </div>
                    <div>
                      <Label htmlFor="card-cvv" className="font-body">
                        CVV
                      </Label>
                      <Input
                        id="card-cvv"
                        placeholder="123"
                        value={cardDetails.cvv}
                        onChange={(e) => setCardDetails((prev) => ({ ...prev, cvv: e.target.value }))}
                        className="font-body"
                      />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="paypal" className="space-y-4">
                  <div className="text-center p-8 bg-blue-50 rounded-lg">
                    <Wallet className="h-16 w-16 text-blue-600 mx-auto mb-4" />
                    <p className="text-gray-600 font-body">
                      You'll be redirected to PayPal to complete your payment securely.
                    </p>
                  </div>
                </TabsContent>
              </Tabs>

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
                    {paymentMethod === "card" ? (
                      <CreditCard className="mr-2 h-5 w-5" />
                    ) : (
                      <Wallet className="mr-2 h-5 w-5" />
                    )}
                    Pay $45 with {paymentMethod === "card" ? "Card" : "PayPal"}
                  </>
                )}
              </Button>

              <p className="text-xs text-gray-500 text-center font-body">
                Secure payment processing. Your books will be instantly available in your library.
              </p>
            </CardContent>
          </Card>

          <Card className="mb-6 animate-scale-hover">
            <CardHeader>
              <CardTitle className="font-heading">Your Learning Bundle</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {bundle.map((book, index) => (
                <div key={index} className="flex items-center space-x-4 p-4 border rounded-lg animate-scale-hover">
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
                  <span className="font-body">Total ({bundle.length} books)</span>
                  <span className="text-2xl text-green-600 font-heading">$45</span>
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
  )
}
