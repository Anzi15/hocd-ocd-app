"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, Shield, Lock, Database, Users, Key, Copyright, Mail, Eye, Settings } from "lucide-react";

export default function PrivacyPolicy() {
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
            <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Shield className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-4">
            Privacy Policy
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Your privacy is important to us. Learn how we protect and manage your personal information.
          </p>
        </div>

        {/* Last Updated Badge */}
        <div className="flex justify-center mb-8">
          <div className="bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full border border-green-200 shadow-sm flex items-center">
            <Settings className="h-4 w-4 mr-2 text-green-600" />
            <span className="text-sm text-gray-600">Last updated: July 1, 2025</span>
          </div>
        </div>

        {/* Privacy Policy Cards */}
        <div className="space-y-6">
          {/* Card 1 */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-green-200 shadow-lg hover:shadow-xl transition-all duration-300 p-6">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <Database className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-3">
                  1. Information We Collect
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  We collect personal information you provide, such as your name, email address, and purchase details, 
                  to provide our services and improve your experience.
                </p>
              </div>
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-blue-200 shadow-lg hover:shadow-xl transition-all duration-300 p-6">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <Eye className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-3">
                  2. How We Use Your Data
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  Your data is used to deliver personalized content, manage purchases, respond to support requests, 
                  and improve our platform.
                </p>
              </div>
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-purple-200 shadow-lg hover:shadow-xl transition-all duration-300 p-6">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-3">
                  3. Third-Party Services
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  We may use trusted third-party services such as Firebase Authentication and analytics tools. 
                  These services have their own privacy policies.
                </p>
              </div>
            </div>
          </div>

          {/* Card 4 */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-amber-200 shadow-lg hover:shadow-xl transition-all duration-300 p-6">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <Lock className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-3">
                  4. Data Protection
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  We take reasonable steps to protect your personal data, including encryption and access controls.
                </p>
              </div>
            </div>
          </div>

          {/* Card 5 */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-red-200 shadow-lg hover:shadow-xl transition-all duration-300 p-6">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <Key className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-3">
                  5. Your Rights
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  You have the right to access, update, or delete your data. Contact us at{" "}
                  <Link 
                    href="mailto:support@example.com" 
                    className="text-blue-600 hover:text-blue-800 underline font-medium transition-colors"
                  >
                    support@example.com
                  </Link>{" "}
                  for any requests.
                </p>
              </div>
            </div>
          </div>

          {/* Card 6 */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-indigo-200 shadow-lg hover:shadow-xl transition-all duration-300 p-6">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <Copyright className="h-6 w-6 text-indigo-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-3">
                  6. Copyright Notice
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  All content, including books and videos, is protected by copyright. Purchased content is for 
                  personal use only and must not be shared or redistributed in any form.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="mt-8 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-2xl p-6">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
              <Mail className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Contact Our Privacy Team</h3>
              <p className="text-gray-700 mb-3">
                Have questions about your privacy? Our team is here to help.
              </p>
              <Link 
                href="mailto:support@example.com"
                className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
              >
                <Mail className="h-4 w-4 mr-2" />
                Email Support
              </Link>
            </div>
          </div>
        </div>

        {/* Commitment Section */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-2xl p-6">
          <div className="flex items-center space-x-3">
            <Shield className="h-6 w-6 text-blue-600 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-blue-900 mb-1">Our Commitment to You</h3>
              <p className="text-blue-800 text-sm">
                We are committed to protecting your privacy and being transparent about how we handle your data. 
                Your trust is our priority.
              </p>
            </div>
          </div>
        </div>

        {/* Back to Home */}
        <div className="text-center mt-12">
          <Link
            href="/"
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white font-semibold rounded-xl hover:from-green-700 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
        </div>

        {/* Footer */}
        <div className="text-center mt-12 pt-8 border-t border-gray-200">
          <p className="text-gray-500 text-sm">
            This privacy policy may be updated periodically. Please check back for the latest version.
          </p>
        </div>
      </div>
    </div>
  );
}