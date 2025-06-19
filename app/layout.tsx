import type React from "react"
import type { Metadata } from "next"
import { Inter, Montserrat, Roboto } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"

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
      </body>
    </html>
  )
}
