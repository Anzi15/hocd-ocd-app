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
  title: "OCD guide - Helping you heal and grow",
  description: "Your companion in the journey to overcome OCD. Access expert advice and practical tools to help you heal and grow.",
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
              <footer className="bg-gradient-to-r from-gray-50 to-gray-100 border-t border-gray-200 py-10 px-4 mt-auto relative overflow-hidden">
  {/* Background decoration */}
  <div className="absolute inset-0 opacity-5">
    <div className="absolute top-0 left-1/4 w-32 h-32 bg-blue-300 rounded-full blur-xl"></div>
    <div className="absolute bottom-0 right-1/4 w-24 h-24 bg-purple-300 rounded-full blur-xl"></div>
  </div>
  
  <div className="max-w-6xl mx-auto flex flex-col items-center gap-6 relative z-10">
    {/* Heart with animation */}
    <div className="flex items-center text-gray-600 text-lg">
      Made with 
      <span className="mx-2 text-red-400 animate-pulse">❤️</span> 
      by
    </div>
    
    {/* Company link */}
    <div className="flex items-center gap-4 flex-wrap justify-center">
      <a 
        href="https://anziandco.com" 
        target="_blank" 
        rel="noopener noreferrer"
        className="font-medium text-gray-700 hover:text-gray-900 transition-colors duration-300 px-4 py-2 rounded-lg hover:bg-white/50 backdrop-blur-sm border border-transparent hover:border-gray-200"
      >
        Anzi & Co
      </a>
      
      {/* Separator - hidden on mobile */}
      <span className="hidden sm:inline-block w-px h-6 bg-gray-300"></span>
      
      {/* Links */}
      <div className="flex gap-6">
        <a 
          href="/privacy-policy" 
          className="text-gray-600 hover:text-gray-800 text-sm font-medium transition-all duration-300 relative py-2 group"
        >
          Privacy Policy
          <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-400 transition-all duration-300 group-hover:w-full"></span>
        </a>
        
        <a 
          href="/terms" 
          className="text-gray-600 hover:text-gray-800 text-sm font-medium transition-all duration-300 relative py-2 group"
        >
          Terms & Conditions
          <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-400 transition-all duration-300 group-hover:w-full"></span>
        </a>
      </div>
    </div>
    
    {/* Copyright */}
    <p className="text-gray-500 text-xs mt-2">
      © {new Date().getFullYear()} All rights reserved.
    </p>
  </div>
</footer>
      </body>
    </html>
  )
}
