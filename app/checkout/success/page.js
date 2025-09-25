"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { clearBundle, loadBundle } from "@/lib/storage";
import { toast } from "@/hooks/use-toast";

export default function SuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const captureOrder = async () => {
      const token = searchParams.get("token"); // PayPal order ID
      if (!token) return;

      try {
        const res = await fetch("/api/paypal/capture-order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderID: token }),
        });
        const data = await res.json();

        if (data.status === "COMPLETED") {
          // Handle success: save books to library
          const bundle = loadBundle();
          const existingLibrary = JSON.parse(localStorage.getItem("user_library") || "[]");
          const newItems = bundle.map((book) => ({
            bookTitle: book.title,
            chapterId: "current",
            videoUrl: book.youtubeUrl,
            purchasedAt: new Date().toISOString(),
            thumbnail: book.thumbnail,
          }));

          localStorage.setItem("user_library", JSON.stringify([...existingLibrary, ...newItems]));
          clearBundle();

          toast({ title: "Payment successful! AudioFile added to your library." });
          router.push("/library");
        } else {
          toast({ title: "Payment not completed", variant: "destructive" });
          router.push("/checkout");
        }
      } catch (err) {
        toast({ title: "Error capturing payment", variant: "destructive" });
        router.push("/checkout");
      }
    };

    captureOrder();
  }, [router, searchParams]);

  return <div className="min-h-screen flex items-center justify-center">Processing your payment...</div>;
}
