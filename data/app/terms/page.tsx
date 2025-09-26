"use client";

import { ArrowLeft, FileText, Shield, Lock, Copyright, RefreshCw } from "lucide-react";
import Link from "next/link";
import React from "react";

export default function Terms() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
              <FileText className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Terms & Conditions
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Please read these terms carefully before using OCD & HOCD Guide
          </p>
        </div>

        {/* Last Updated Badge */}
        <div className="flex justify-center mb-8">
          <div className="bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full border border-blue-200 shadow-sm">
            <span className="text-sm text-gray-600 flex items-center">
              <RefreshCw className="h-4 w-4 mr-2" />
              Last updated: September 26, 2025
            </span>
          </div>
        </div>

        {/* Terms Cards */}
        <div className="space-y-6">
          {/* Card 1 */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-blue-200 shadow-lg hover:shadow-xl transition-all duration-300 p-6">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <Shield className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-3 flex items-center">
                  1. Use of Service
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  You may use this platform for personal, non-commercial purposes only. Any misuse may result in suspension or termination of your account.
                </p>
              </div>
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-blue-200 shadow-lg hover:shadow-xl transition-all duration-300 p-6">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <Lock className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-3">
                  2. Purchases and Refunds
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  All purchases made on this platform are final. No refunds will be issued unless required by law.
                </p>
              </div>
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-blue-200 shadow-lg hover:shadow-xl transition-all duration-300 p-6">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <Copyright className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-3">
                  3. Intellectual Property
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  All materials provided on OCD & HOCD Guide — including but not limited to videos, guides, and learning modules — are copyrighted. 
                  You are not permitted to share, reproduce, or distribute any content without written permission.
                </p>
              </div>
            </div>
          </div>

          {/* Card 4 */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-blue-200 shadow-lg hover:shadow-xl transition-all duration-300 p-6">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <Shield className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-3">
                  4. Account Responsibility
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  You are responsible for maintaining the confidentiality of your account and for all activities under your account.
                </p>
              </div>
            </div>
          </div>

          {/* Card 5 */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-blue-200 shadow-lg hover:shadow-xl transition-all duration-300 p-6">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <RefreshCw className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-3">
                  5. Changes to Terms
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  We reserve the right to update these terms at any time. Continued use of the service means you accept the revised terms.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Important Note */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-2xl p-6">
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
              <span className="text-white text-sm font-bold">!</span>
            </div>
            <div>
              <h3 className="font-semibold text-blue-900 mb-2">Important Notice</h3>
              <p className="text-blue-800 text-sm leading-relaxed">
                By using OCD & HOCD Guide, you acknowledge that you have read, understood, and agree to be bound by these Terms & Conditions. 
                If you do not agree with any part of these terms, you may not use our services.
              </p>
            </div>
          </div>
        </div>

        {/* Back to Home */}
        <div className="text-center mt-12">
          <Link
            href="/"
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
        </div>

        {/* Footer */}
        <div className="text-center mt-12 pt-8 border-t border-gray-200">
          <p className="text-gray-500 text-sm">
            For questions about these terms, please contact our support team.
          </p>
        </div>
      </div>
    </div>
  );
}