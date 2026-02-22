'use client'

import Link from 'next/link'

export default function DemoPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-b from-gray-900/90 to-transparent p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-blue-400">Smart Road AI</h1>
          <Link href="/" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition font-semibold">
            ← Back Home
          </Link>
        </div>
      </div>

      {/* Full Page Video Container */}
      <div className="w-full h-screen flex flex-col">
        {/* Video Player - Takes up most of the screen */}
        <div className="flex-1 pt-20 px-4 pb-4 flex items-center justify-center">
          <div className="w-full h-full bg-black rounded-xl overflow-hidden shadow-2xl border-2 border-indigo-500/50 hover:border-indigo-500 transition">
            <iframe
              src="https://drive.google.com/file/d/1Utvjs1B2AKjkAhI-TDebHFpt_BMOo8iT/preview"
              width="100%"
              height="100%"
              allow="autoplay"
              title="Smart Road AI Demo Video"
              style={{ border: 'none' }}
              className="w-full h-full"
            ></iframe>
          </div>
        </div>

        {/* Bottom Info Section */}
        <div className="bg-gradient-to-t from-gray-900 via-gray-900/95 to-transparent px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-white mb-2">What is Smart Road AI?</h2>
            <p className="text-gray-300 text-sm md:text-base leading-relaxed">
              Smart Road AI automatically detects and classifies road damage with 98.2% accuracy. Using advanced AI technology, we help cities maintain infrastructure proactively and keep roads safe.
            </p>
            <div className="mt-4 flex flex-col sm:flex-row gap-4">
              <Link href="/volunteer" className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-bold rounded-lg transition text-center">
                Report Damage
              </Link>
              <Link href="/" className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white font-bold rounded-lg transition text-center">
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
