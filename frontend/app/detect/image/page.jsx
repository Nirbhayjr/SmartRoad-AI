'use client'

import { useState } from 'react'
import { detectPotsholesImage } from '@/services/operations/demoAPI'
import Image from 'next/image'

export default function ImageDetectionPage() {
    const [file, setFile] = useState(null)
    const [preview, setPreview] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [result, setResult] = useState(null)
    const [dragActive, setDragActive] = useState(false)

    // Handle file selection
    const handleFileChange = (e) => {
        const selectedFile = e.target.files?.[0]
        if (selectedFile) {
            processFile(selectedFile)
        }
    }

    // Process selected file
    const processFile = (selectedFile) => {
        // Validate file type
        if (!selectedFile.type.startsWith('image/')) {
            setError('Please upload a valid image file (JPG, PNG, etc.)')
            return
        }

        // Validate file size (max 10MB)
        if (selectedFile.size > 10 * 1024 * 1024) {
            setError('File size must be less than 10MB')
            return
        }

        setFile(selectedFile)
        setError(null)

        // Create preview
        const reader = new FileReader()
        reader.onload = (e) => {
            setPreview(e.target?.result)
        }
        reader.readAsDataURL(selectedFile)
    }

    // Handle drag and drop
    const handleDrag = (e) => {
        e.preventDefault()
        e.stopPropagation()
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true)
        } else if (e.type === 'dragleave') {
            setDragActive(false)
        }
    }

    const handleDrop = (e) => {
        e.preventDefault()
        e.stopPropagation()
        setDragActive(false)

        const droppedFile = e.dataTransfer?.files?.[0]
        if (droppedFile) {
            processFile(droppedFile)
        }
    }

    // Upload and detect
    const handleDetect = async () => {
        if (!file) {
            setError('Please select an image first')
            return
        }

        setLoading(true)
        setError(null)

        try {
            const formData = new FormData()
            formData.append('file', file)

            const detector = detectPotsholesImage(formData)
            const response = await detector()

            setResult(response)
        } catch (err) {
            setError(err.message || 'Failed to detect potholes. Please try again.')
            console.error('Detection error:', err)
        } finally {
            setLoading(false)
        }
    }

    // Reset form
    const handleReset = () => {
        setFile(null)
        setPreview(null)
        setResult(null)
        setError(null)
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black py-12 px-4">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-5xl font-bold text-white mb-4">
                        Pothole Detection
                    </h1>
                    <p className="text-xl text-gray-400">
                        Upload an image to detect and analyze potholes using AI
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Upload Section */}
                    <div className="space-y-6">
                        <div className="bg-gray-800 rounded-lg p-8 border-2 border-gray-700 hover:border-blue-500 transition">
                            <h2 className="text-2xl font-semibold text-white mb-6">Upload Image</h2>

                            {/* Drag Drop Area */}
                            <div
                                onDragEnter={handleDrag}
                                onDragLeave={handleDrag}
                                onDragOver={handleDrag}
                                onDrop={handleDrop}
                                className={`border-2 border-dashed rounded-lg p-8 text-center transition cursor-pointer ${
                                    dragActive
                                        ? 'border-blue-500 bg-blue-500/10'
                                        : 'border-gray-600 hover:border-gray-500'
                                }`}
                            >
                                <input
                                    type="file"
                                    id="image-input"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    className="hidden"
                                    disabled={loading}
                                />

                                <label htmlFor="image-input" className="cursor-pointer block">
                                    <div className="mb-3">
                                        <svg className="w-6 h-6 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                        </svg>
                                    </div>
                                    <p className="text-lg font-semibold text-white mb-2">
                                        Drag & drop your image here
                                    </p>
                                    <p className="text-sm text-gray-400">
                                        or click to select from your computer
                                    </p>
                                </label>
                            </div>

                            {/* File Info */}
                            {file && (
                                <div className="mt-4 bg-green-900/20 border border-green-700 rounded p-4">
                                    <p className="text-green-400 text-sm">
                                        ✓ File selected: <span className="font-semibold">{file.name}</span>
                                    </p>
                                    <p className="text-green-400 text-xs mt-1">
                                        Size: {(file.size / 1024).toFixed(2)} KB
                                    </p>
                                </div>
                            )}

                            {/* Error Message */}
                            {error && (
                                <div className="mt-4 bg-red-900/20 border border-red-700 rounded p-4">
                                    <p className="text-red-400 text-sm">
                                        ✗ {error}
                                    </p>
                                </div>
                            )}

                            {/* Preview */}
                            {preview && (
                                <div className="mt-6">
                                    <p className="text-gray-300 text-sm font-semibold mb-3">Preview:</p>
                                    <img
                                        src={preview}
                                        alt="Preview"
                                        className="w-full rounded-lg max-h-64 object-contain bg-gray-900"
                                    />
                                </div>
                            )}

                            {/* Buttons */}
                            <div className="flex gap-3 mt-6">
                                <button
                                    onClick={handleDetect}
                                    disabled={!file || loading}
                                    className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition flex items-center justify-center gap-2"
                                >
                                    {loading ? (
                                        <>
                                            <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                                            Detecting...
                                        </>
                                    ) : (
                                        <>
                                            <span>🔍</span> Detect Potholes
                                        </>
                                    )}
                                </button>

                                {(file || result) && (
                                    <button
                                        onClick={handleReset}
                                        disabled={loading}
                                        className="bg-gray-700 hover:bg-gray-600 disabled:bg-gray-600 text-white font-semibold py-3 px-6 rounded-lg transition"
                                    >
                                        Clear
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Results Section */}
                    <div className="space-y-6">
                        {result && !loading && (
                            <div className="space-y-6">
                                {/* Detection Result Image */}
                                <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                                    <h3 className="text-xl font-semibold text-white mb-4">Detection Result</h3>
                                    <img
                                        src={`data:image/jpeg;base64,${result.image_with_detections}`}
                                        alt="Detection Result"
                                        className="w-full rounded-lg"
                                    />
                                </div>

                                {/* Statistics */}
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-4">
                                        <p className="text-gray-400 text-sm">Total Detected</p>
                                        <p className="text-3xl font-bold text-blue-400">
                                            {result.statistics.total_detections}
                                        </p>
                                    </div>

                                    <div className="bg-yellow-900/20 border border-yellow-700 rounded-lg p-4">
                                        <p className="text-gray-400 text-sm">Moderate</p>
                                        <p className="text-3xl font-bold text-yellow-400">
                                            {result.statistics.severity_breakdown.Moderate}
                                        </p>
                                    </div>

                                    <div className="bg-red-900/20 border border-red-700 rounded-lg p-4">
                                        <p className="text-gray-400 text-sm">Major</p>
                                        <p className="text-3xl font-bold text-red-400">
                                            {result.statistics.severity_breakdown.Major}
                                        </p>
                                    </div>

                                    <div className="bg-green-900/20 border border-green-700 rounded-lg p-4">
                                        <p className="text-gray-400 text-sm">Minor</p>
                                        <p className="text-3xl font-bold text-green-400">
                                            {result.statistics.severity_breakdown.Minor}
                                        </p>
                                    </div>

                                    <div className="bg-gray-700 rounded-lg p-4">
                                        <p className="text-gray-400 text-sm">Width</p>
                                        <p className="text-3xl font-bold text-gray-200">
                                            {result.statistics.image_width}
                                        </p>
                                    </div>

                                    <div className="bg-gray-700 rounded-lg p-4">
                                        <p className="text-gray-400 text-sm">Height</p>
                                        <p className="text-3xl font-bold text-gray-200">
                                            {result.statistics.image_height}
                                        </p>
                                    </div>
                                </div>

                                {/* Detections List */}
                                {result.detections.length > 0 && (
                                    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                                        <h3 className="text-xl font-semibold text-white mb-4">
                                            Detailed Detections ({result.detections.length})
                                        </h3>
                                        <div className="space-y-2 max-h-96 overflow-y-auto">
                                            {result.detections.map((detection, idx) => (
                                                <div
                                                    key={idx}
                                                    className="bg-gray-700 rounded p-3 text-sm"
                                                >
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-gray-300">Detection #{idx + 1}</span>
                                                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                                                            detection.severity === 'Major'
                                                                ? 'bg-red-900/50 text-red-300'
                                                                : detection.severity === 'Moderate'
                                                                ? 'bg-yellow-900/50 text-yellow-300'
                                                                : 'bg-green-900/50 text-green-300'
                                                        }`}>
                                                            {detection.severity}
                                                        </span>
                                                    </div>
                                                    <div className="mt-2 text-gray-400 text-xs space-y-1">
                                                        <p>Confidence: {(detection.confidence * 100).toFixed(1)}%</p>
                                                        <p>Area: {detection.area} px²</p>
                                                        <p>Dimensions: {detection.width} × {detection.height}px</p>
                                                        <p>Position: ({detection.bbox[0]}, {detection.bbox[1]})</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {result.detections.length === 0 && (
                                    <div className="bg-green-900/20 border border-green-700 rounded-lg p-6 text-center">
                                        <p className="text-green-400 text-lg font-semibold">
                                            ✓ No potholes detected
                                        </p>
                                        <p className="text-green-300 text-sm mt-2">
                                            The road appears to be in good condition
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}

                        {!result && !loading && (
                            <div className="bg-gray-800 rounded-lg p-8 border border-gray-700 text-center">
                                <svg className="w-8 h-8 mx-auto text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                <p className="text-gray-400">
                                    Upload an image to see detection results here
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}