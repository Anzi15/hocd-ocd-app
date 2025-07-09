import type React from "react"
import type { Metadata } from "next"
import { Inter, Montserrat, Roboto } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"
import Link from "next/link"
import { BookOpen, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"

const inter = Inter({ subsets: ["latin"] })
const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-montserrat",
})
const roboto = Roboto({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
  variable: "--font-roboto",
})

export const metadata: Metadata = {
  title: "Break up guide - Helping you heal and grow",
  description:
    "Discover your personalized breakup guide. Get tailored advice, resources, and support to help you heal and grow after a breakup.",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} ${montserrat.variable} ${roboto.variable}`}>
        {children}
        <Toaster />
              <footer className="text-center text-gray-500 text-sm py-6">
  
  <br />
  Made with ❤️ by <Link href="https://anziandco.com" target="_blank" className="underline hover:text-gray-700">
    Anzi &. Co
  </Link>
  <br />
  <Link href="/privacy-policy" className="underline hover:text-gray-700">
    Privacy Policy
  </Link>{" "}
  |{" "}
  <Link href="/terms" className="underline hover:text-gray-700">
    Terms & Conditions
  </Link>
</footer>
      </body>
    </html>
  )
}
