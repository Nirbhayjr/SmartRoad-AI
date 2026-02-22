'use client'

import { useState, useRef } from 'react'
import { detectPotsholesVideo } from '@/services/operations/demoAPI'

export default function VideoDetectionPage() {
    const [file, setFile] = useState(null)
    const [preview, setPreview] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [result, setResult] = useState(null)
    const [dragActive, setDragActive] = useState(false)
    const [expandedFrame, setExpandedFrame] = useState(null)
    
    // Refs
    const fileInputRef = useRef(null)
    const videoRef = useRef(null) // Video player ko track karne ke liye
    const [playedBeeps, setPlayedBeeps] = useState(new Set()) // Track karega ki kon sa beep baj chuka hai

    // 🔊 NAYA FUNCTION: Beep bajane ke liye
    const playWarningSound = (severity) => {
        const context = new (window.AudioContext || window.webkitAudioContext)();
        
        let beepCount = 1; // Minor ke liye 1 beep
        if (severity === 'Moderate') beepCount = 2;
        if (severity === 'Major') beepCount = 3;

        for (let i = 0; i < beepCount; i++) {
            setTimeout(() => {
                const oscillator = context.createOscillator();
                const gainNode = context.createGain();
                
                oscillator.type = 'square'; // Warning sound type
                oscillator.frequency.setValueAtTime(800, context.currentTime); // 800Hz pitch
                
                gainNode.gain.setValueAtTime(0.1, context.currentTime); // Volume
                gainNode.gain.exponentialRampToValueAtTime(0.00001, context.currentTime + 0.1);
                
                oscillator.connect(gainNode);
                gainNode.connect(context.destination);
                
                oscillator.start();
                oscillator.stop(context.currentTime + 0.1);
            }, i * 300); // Har beep ke beech 300ms ka gap
        }
    }

    // ⏱️ TIME TRACKER FUNCTION (1.5 sec = ~3 meters early warning)
    const handleTimeUpdate = () => {
        if (!result || !videoRef.current || !result.frame_detections) return;

        const currentTime = videoRef.current.currentTime;
        const fps = result.video_info?.fps || 30; // Default 30 FPS
        
        const lookAheadTime = currentTime + 1.5; // 1.5 second aage dekhna
        const targetFrame = Math.floor(lookAheadTime * fps);

        // Aas-paas ke 3 frames check karo
        const upcomingDetection = result.frame_detections.find(
            f => Math.abs(f.frame_number - targetFrame) <= 3 
        );

        if (upcomingDetection && upcomingDetection.detections?.length > 0) {
            if (!playedBeeps.has(upcomingDetection.frame_number)) {
                
                let highestSeverity = 'Minor';
                upcomingDetection.detections.forEach(det => {
                    if (det.severity === 'Major') highestSeverity = 'Major';
                    else if (det.severity === 'Moderate' && highestSeverity !== 'Major') highestSeverity = 'Moderate';
                });

                playWarningSound(highestSeverity); // Beep play karo
                
                // Track kar lo taaki dubara lagatar na baje
                setPlayedBeeps(prev => {
                    const newSet = new Set(prev);
                    newSet.add(upcomingDetection.frame_number);
                    return newSet;
                });
            }
        }
    }

    // Handle file selection
    const handleFileChange = (e) => {
        const selectedFile = e.target.files?.[0]
        if (selectedFile) {
            processFile(selectedFile)
        }
    }

    // Process selected file
    const processFile = (selectedFile) => {
        const validTypes = ['video/mp4', 'video/mpeg', 'video/quicktime', 'video/x-msvideo', 'video/webm']
        if (!validTypes.includes(selectedFile.type)) {
            setError('Please upload a valid video file (MP4, MOV, AVI, WebM, etc.)')
            return
        }
        if (selectedFile.size > 100 * 1024 * 1024) {
            setError('File size must be less than 100MB')
            return
        }

        setFile(selectedFile)
        setError(null)

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
            setError('Please select a video first')
            return
        }
        setLoading(true)
        setError(null)

        try {
            const formData = new FormData()
            formData.append('file', file)

            const detector = detectPotsholesVideo(formData)
            const response = await detector()

            setResult(response)
        } catch (err) {
            setError(err.message || 'Failed to detect potholes in video. Please try again.')
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
        setExpandedFrame(null)
        setPlayedBeeps(new Set()) // History clear karegi
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black py-12 px-4">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-5xl font-bold text-white mb-4">
                        Video Pothole Detection
                    </h1>
                    <p className="text-xl text-gray-400">
                        Upload a video to detect and analyze potholes frame by frame using AI
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Upload Section */}
                    <div className="lg:col-span-1">
                        <div className="bg-gray-800 rounded-lg p-8 border-2 border-gray-700 hover:border-blue-500 transition sticky top-8">
                            <h2 className="text-2xl font-semibold text-white mb-6">Upload Video</h2>

                            {/* Drag Drop Area */}
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                onDragEnter={handleDrag}
                                onDragLeave={handleDrag}
                                onDragOver={handleDrag}
                                onDrop={handleDrop}
                                className={`border-2 border-dashed rounded-lg p-8 text-center transition cursor-pointer ${
                                    dragActive ? 'border-blue-500 bg-blue-500/10' : 'border-gray-600 hover:border-gray-500'
                                }`}
                            >
                                <input
                                    type="file"
                                    id="video-input"
                                    accept="video/*"
                                    onChange={handleFileChange}
                                    className="hidden"
                                    disabled={loading}
                                    ref={fileInputRef}
                                />
                                <div className="cursor-pointer block">
                                    <div className="mb-3">
                                        <svg className="w-16 h-16 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <p className="text-lg font-semibold text-white mb-2">Drag & drop your video here</p>
                                    <p className="text-sm text-gray-400">or click to select from your computer</p>
                                </div>
                            </div>

                            {/* File Info */}
                            {file && (
                                <div className="mt-4 bg-green-900/20 border border-green-700 rounded p-4">
                                    <p className="text-green-400 text-sm font-semibold truncate">✓ {file.name}</p>
                                    <p className="text-green-400 text-xs mt-1">Size: {(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                                </div>
                            )}

                            {/* Error Message */}
                            {error && (
                                <div className="mt-4 bg-red-900/20 border border-red-700 rounded p-4">
                                    <p className="text-red-400 text-sm">✗ {error}</p>
                                </div>
                            )}

                            {/* Preview */}
                            {preview && (
                                <div className="mt-6">
                                    <p className="text-gray-300 text-sm font-semibold mb-3">Preview (Play to hear Dashcam Warnings):</p>
                                    <video
                                        ref={videoRef}
                                        src={preview}
                                        controls
                                        onTimeUpdate={handleTimeUpdate}
                                        onSeeked={() => setPlayedBeeps(new Set())}
                                        className="w-full rounded-lg max-h-48 bg-gray-900" 
                                    />
                                </div>
                            )}

                            {/* Buttons */}
                            <div className="flex flex-col gap-3 mt-6">
                                <button
                                    onClick={handleDetect}
                                    disabled={!file || loading}
                                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition flex items-center justify-center gap-2"
                                >
                                    {loading ? (
                                        <>
                                            <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                                            Processing...
                                        </>
                                    ) : (
                                        <><span>🎬</span> Detect Potholes</>
                                    )}
                                </button>

                                {(file || result) && (
                                    <button
                                        onClick={handleReset}
                                        disabled={loading}
                                        className="w-full bg-gray-700 hover:bg-gray-600 disabled:bg-gray-600 text-white font-semibold py-3 px-6 rounded-lg transition"
                                    >
                                        Clear
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Results Section */}
                    <div className="lg:col-span-1">
                        {loading && (
                            <div className="bg-gray-800 rounded-lg p-12 border border-gray-700 text-center">
                                <div className="mb-6 flex justify-center">
                                    <div className="relative w-16 h-16">
                                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full opacity-25 animate-pulse"></div>
                                        <div className="absolute inset-2 bg-gray-800 rounded-full flex items-center justify-center">
                                            <div className="animate-spin h-8 w-8 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                                        </div>
                                    </div>
                                </div>
                                <h3 className="text-2xl font-semibold text-white mb-2">Processing Video</h3>
                                <p className="text-gray-400">Analyzing frames for pothole detection...</p>
                            </div>
                        )}

                        {result && !loading && (
                            <div className="space-y-6 detection-container-small">
                                {/* Summary Statistics */}
                                <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                                    <h3 className="text-2xl font-semibold text-white mb-6">Analysis Summary</h3>
                                    
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                                        <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-4">
                                            <p className="text-gray-400 text-sm">Frames</p>
                                            <p className="text-xl font-bold text-blue-400">{result.video_info.total_frames}</p>
                                        </div>
                                        <div className="bg-purple-900/20 border border-purple-700 rounded-lg p-4">
                                            <p className="text-gray-400 text-sm">Processed</p>
                                            <p className="text-xl font-bold text-purple-400">{result.video_info.processed_frames}</p>
                                        </div>
                                        <div className="bg-green-900/20 border border-green-700 rounded-lg p-4">
                                            <p className="text-gray-400 text-sm">FPS</p>
                                            <p className="text-xl font-bold text-green-400">{Math.round(result.video_info.fps)}</p>
                                        </div>
                                        <div className="bg-cyan-900/20 border border-cyan-700 rounded-lg p-4">
                                            <p className="text-gray-400 text-sm">Found</p>
                                            <p className="text-xl font-bold text-cyan-400">{result.statistics.total_detections}</p>
                                        </div>
                                    </div>

                                    {/* Severity Breakdown */}
                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="bg-green-900/20 border border-green-700 rounded-lg p-4 text-center">
                                            <p className="text-gray-400 text-sm mb-2">Minor</p>
                                            <p className="text-2xl font-bold text-green-400">{result.statistics.severity_breakdown.Minor}</p>
                                        </div>
                                        <div className="bg-yellow-900/20 border border-yellow-700 rounded-lg p-4 text-center">
                                            <p className="text-gray-400 text-sm mb-2">Moderate</p>
                                            <p className="text-2xl font-bold text-yellow-400">{result.statistics.severity_breakdown.Moderate}</p>
                                        </div>
                                        <div className="bg-red-900/20 border border-red-700 rounded-lg p-4 text-center">
                                            <p className="text-gray-400 text-sm mb-2">Major</p>
                                            <p className="text-2xl font-bold text-red-400">{result.statistics.severity_breakdown.Major}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Frame Detections */}
                                {result.frame_detections.length > 0 ? (
                                    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                                        <h3 className="text-xl font-semibold text-white mb-6">
                                            Detected Frames ({result.frame_detections.length})
                                        </h3>
                                        <div className="space-y-3 max-h-screen overflow-y-auto pr-2">
                                            {result.frame_detections.map((frameData, frameIdx) => (
                                                <div key={frameIdx}>
                                                    <button
                                                        onClick={() => setExpandedFrame(expandedFrame === frameIdx ? null : frameIdx)}
                                                        className="w-full bg-gray-700 hover:bg-gray-600 rounded-lg p-4 transition text-left"
                                                    >
                                                        <div className="flex justify-between items-center">
                                                            <div>
                                                                <p className="text-white font-semibold">Frame #{frameData.frame_number}</p>
                                                                <p className="text-gray-400 text-sm">{frameData.detection_count} pothole(s)</p>
                                                            </div>
                                                            <svg className={`w-5 h-5 text-gray-400 transition ${expandedFrame === frameIdx ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                                                            </svg>
                                                        </div>
                                                    </button>
                                                    
                                                    {expandedFrame === frameIdx && (
                                                        <div className="bg-gray-900 rounded-b-lg p-4 mt-1 space-y-4">
                                                            {/* Frame Image with Annotations */}
                                                            {frameData.frame_image && (
                                                                <div className="mb-4">
                                                                    <p className="text-gray-300 text-sm font-semibold mb-2">Annotated Frame:</p>
                                                                    <img 
                                                                        src={`data:image/jpeg;base64,${frameData.frame_image}`}
                                                                        alt={`Frame ${frameData.frame_number}`}
                                                                        className="w-full rounded-lg border border-gray-700 max-h-80 object-cover"
                                                                    />
                                                                </div>
                                                            )}
                                                            
                                                            {/* Detection Details */}
                                                            <div>
                                                                <p className="text-gray-300 text-sm font-semibold mb-2">Detection Details:</p>
                                                                <div className="space-y-3">
                                                                    {frameData.detections.map((detection, detIdx) => (
                                                                        <div key={detIdx} className={`p-3 rounded border-l-4 ${detection.severity === 'Major' ? 'bg-red-900/20 border-red-500' : detection.severity === 'Moderate' ? 'bg-yellow-900/20 border-yellow-500' : 'bg-green-900/20 border-green-500'}`}>
                                                                            <div className="flex justify-between items-start mb-2">
                                                                                <span className="text-white font-semibold text-sm">Detection #{detIdx + 1}</span>
                                                                                <span className={`px-2 py-1 rounded text-xs font-bold ${detection.severity === 'Major' ? 'bg-red-900 text-red-300' : detection.severity === 'Moderate' ? 'bg-yellow-900 text-yellow-300' : 'bg-green-900 text-green-300'}`}>
                                                                                    {detection.severity}
                                                                                </span>
                                                                            </div>
                                                                            <div className="text-gray-400 text-xs space-y-1">
                                                                                <p>Confidence: {(detection.confidence * 100).toFixed(1)}%</p>
                                                                                <p>Area: {detection.area} px²</p>
                                                                                <p>Dimensions: {detection.width}×{detection.height} px</p>
                                                                                <p>Location: ({detection.bbox[0]}, {detection.bbox[1]}) to ({detection.bbox[2]}, {detection.bbox[3]})</p>
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="bg-green-900/20 border border-green-700 rounded-lg p-6 text-center">
                                        <p className="text-green-400 text-lg font-semibold">✓ No potholes detected</p>
                                        <p className="text-green-300 text-sm mt-2">The road appears to be in good condition</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* EMPTY STATE */}
                        {!result && !loading && (
                            <div className="bg-gray-800 rounded-lg p-12 border border-gray-700 text-center">
                                <svg className="w-20 h-20 mx-auto text-gray-600 mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <h3 className="text-2xl font-semibold text-white mb-2">Ready for Analysis</h3>
                                <p className="text-gray-400">Upload a video to start detecting potholes</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}