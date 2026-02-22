"use client"

import { useState } from 'react'
import { detectPotsholesImage, detectPotsholesVideo } from '@/services/operations/demoAPI'

export default function UploadReportPage() {
    const [file, setFile] = useState(null)
    const [preview, setPreview] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [result, setResult] = useState(null)
    const [dragActive, setDragActive] = useState(false)
    const [latitude, setLatitude] = useState('')
    const [longitude, setLongitude] = useState('')
    const [description, setDescription] = useState('')
    const [isCritical, setIsCritical] = useState(false)

    const handleFileChange = (e) => {
        const selectedFile = e.target.files?.[0]
        if (selectedFile) processFile(selectedFile)
    }

    const processFile = (selectedFile) => {
        // Accept image or video
        if (!selectedFile.type.startsWith('image/') && !selectedFile.type.startsWith('video/')) {
            setError('Please upload an image or video file')
            return
        }

        // Basic size limits
        if (selectedFile.type.startsWith('image/') && selectedFile.size > 10 * 1024 * 1024) {
            setError('Image must be less than 10MB')
            return
        }
        if (selectedFile.type.startsWith('video/') && selectedFile.size > 100 * 1024 * 1024) {
            setError('Video must be less than 100MB')
            return
        }

        setFile(selectedFile)
        setError(null)

        const reader = new FileReader()
        reader.onload = (ev) => setPreview(ev.target?.result)
        reader.readAsDataURL(selectedFile)
    }

    const handleDrag = (e) => {
        e.preventDefault(); e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true)
        if (e.type === 'dragleave') setDragActive(false)
    }

    const handleDrop = (e) => {
        e.preventDefault(); e.stopPropagation(); setDragActive(false)
        const dropped = e.dataTransfer?.files?.[0]
        if (dropped) processFile(dropped)
    }

    const detectLocation = () => {
        if (!navigator.geolocation) {
            setError('Geolocation is not supported by your browser')
            return
        }
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                setLatitude(pos.coords.latitude)
                setLongitude(pos.coords.longitude)
                setError(null)
            },
            (err) => setError('Unable to get location: ' + err.message)
        )
    }

    const handleSubmit = async () => {
        if (!file) { setError('Please attach an image or video'); return }
        setLoading(true); setError(null); setResult(null)

        try {
            const formData = new FormData()
            formData.append('file', file)
            formData.append('latitude', latitude)
            formData.append('longitude', longitude)
            formData.append('description', description)
            formData.append('is_critical', isCritical ? '1' : '0')

            let detector
            if (file.type.startsWith('image/')) detector = detectPotsholesImage(formData)
            else detector = detectPotsholesVideo(formData)

            const response = await detector()
            console.log('Detection response:', response)
            setResult(response)
        } catch (err) {
            setError(err.message || 'Submission failed')
            console.error('Submit error:', err)
        } finally {
            setLoading(false)
        }
    }

    const handleReset = () => {
        setFile(null); setPreview(null); setResult(null); setError(null)
        setDescription(''); setLatitude(''); setLongitude(''); setIsCritical(false)
    }

    const closeResult = () => setResult(null)

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black py-12 px-4">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-white">Report Road Issue</h1>
                    <p className="text-gray-400">Attach an image or video, add details, and submit the report.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="space-y-6">
                        <div className="bg-gradient-to-b from-gray-900/60 to-gray-800 rounded-2xl p-8 border border-gray-700 shadow-xl">
                            <h2 className="text-2xl font-semibold text-white mb-4">Upload</h2>

                            <div
                                onDragEnter={handleDrag}
                                onDragLeave={handleDrag}
                                onDragOver={handleDrag}
                                onDrop={handleDrop}
                                className={`mx-auto max-w-sm rounded-xl p-8 flex flex-col items-center justify-center transition-all duration-200 ${dragActive ? 'bg-gradient-to-r from-blue-600/8 to-indigo-600/6 ring-2 ring-blue-400' : 'bg-gray-800'}`}>
                                <input type="file" id="upload-input" accept="image/*,video/*" onChange={handleFileChange} className="hidden" />

                                {/* Large circular button */}
                                <label htmlFor="upload-input" className="flex flex-col items-center gap-4 cursor-pointer">
                                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-600 to-blue-500 flex items-center justify-center shadow-lg hover:scale-105 transform transition">
                                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 16l-4-4-4 4" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 12v6" />
                                        </svg>
                                    </div>

                                    <div className="text-center">
                                        <p className="text-sm font-semibold text-white">Tap to choose file</p>
                                        <p className="text-xs text-gray-400">or drag & drop an image / video</p>
                                    </div>
                                </label>

                                {/* Preview + basic info */}
                                {file ? (
                                    <div className="mt-6 w-full text-left">
                                        <div className="flex items-center gap-3">
                                            <div className="w-20 h-12 bg-gray-900 rounded overflow-hidden flex items-center justify-center">
                                                {file.type.startsWith('image/') ? (
                                                    <img src={preview} alt="thumb" className="object-cover w-full h-full" />
                                                ) : (
                                                    <video src={preview} className="object-cover w-full h-full" />
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <div className="text-white font-medium truncate">{file.name}</div>
                                                <div className="text-xs text-gray-400">{(file.size / (1024)).toFixed(2)} KB</div>
                                            </div>
                                            <button onClick={handleReset} className="text-xs text-gray-300 bg-gray-700 px-3 py-1 rounded">Remove</button>
                                        </div>
                                    </div>
                                ) : null}
                            </div>
                        </div>

                        <div className="bg-gradient-to-b from-gray-900/60 to-gray-800 rounded-2xl p-6 border border-gray-700 shadow-xl">
                            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                <span>📍</span> Location
                            </h3>
                            <div className="flex gap-2 mb-4">
                                <input value={latitude} onChange={(e) => setLatitude(e.target.value)} placeholder="Latitude" className="flex-1 bg-gray-900 border border-gray-700 rounded-lg p-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                <input value={longitude} onChange={(e) => setLongitude(e.target.value)} placeholder="Longitude" className="flex-1 bg-gray-900 border border-gray-700 rounded-lg p-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                            </div>
                            <div className="flex gap-2">
                                <button onClick={detectLocation} className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white py-2 px-4 rounded-lg shadow-sm transition flex items-center justify-center gap-2">
                                    <span>🎯</span> Detect
                                </button>
                                <button onClick={() => { setLatitude(''); setLongitude('') }} className="bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded-lg text-sm">Clear</button>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="bg-gradient-to-b from-gray-900/60 to-gray-800 rounded-2xl p-6 border border-gray-700 shadow-lg">
                            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                <span>📝</span> Details
                            </h3>
                            <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe the issue: location, time, severity..." className="w-full min-h-[100px] bg-gray-900 border border-gray-700 rounded-lg p-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />

                            <div className="mt-5 flex items-center gap-3 p-4 bg-gray-900/50 rounded-lg">
                                <input id="critical" type="checkbox" checked={isCritical} onChange={() => setIsCritical(!isCritical)} className="w-4 h-4 accent-red-500" />
                                <label htmlFor="critical" className={`text-sm font-medium cursor-pointer ${isCritical ? 'text-red-300' : 'text-gray-300'}`}>🚨 Mark as critical / emergency</label>
                            </div>

                            <div className="mt-6 flex gap-3">
                                <button onClick={handleSubmit} disabled={loading} className="flex-1 bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-700 hover:to-emerald-600 disabled:from-gray-600 disabled:to-gray-600 text-white py-3 rounded-lg font-semibold shadow-md transition transform hover:scale-105">
                                    {loading ? '⏳ Submitting...' : '✓ Submit Report'}
                                </button>
                                <button onClick={handleReset} disabled={loading} className="bg-gray-700 hover:bg-gray-600 text-white py-3 px-4 rounded-lg font-medium transition">Reset</button>
                            </div>

                            {loading && (
                                <div className="mt-4 w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                                    <div className="h-full bg-gradient-to-r from-green-400 via-blue-400 to-indigo-400 animate-pulse" style={{ width: '60%' }} />
                                </div>
                            )}

                            {error && <div className="mt-4 bg-red-900/30 border-l-4 border-red-500 rounded-lg p-3 text-sm text-red-200">❌ {error}</div>}
                            {result && <div className="mt-4 bg-green-900/30 border-l-4 border-green-500 rounded-lg p-3 text-sm text-green-200">✓ Report submitted successfully!</div>}
                        </div>
                    </div>
                </div>
            </div>

            {/* Results Modal */}
            {result && (
                <div className="fixed inset-0 bg-black/80 z-50 overflow-auto">
                    <div className="min-h-screen py-8 px-4">
                        <div className="max-w-5xl mx-auto">
                            <button onClick={closeResult} className="mb-4 text-gray-400 hover:text-white">✕ Close</button>
                            
                            <div className="bg-gradient-to-b from-gray-900 to-gray-800 rounded-2xl border border-gray-700 shadow-2xl p-8">
                                <div className="text-center mb-8">
                                    <h1 className="text-4xl font-bold text-white mb-2">🎯 Detection Report</h1>
                                    <p className="text-gray-400">Road Condition Analysis Results</p>
                                </div>

                                {/* Location & Summary */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                                        <h3 className="text-lg font-semibold text-white mb-4">📍 Location</h3>
                                        <div className="space-y-2">
                                            <div><span className="text-gray-400">Latitude:</span> <span className="text-white font-medium">{latitude || 'N/A'}</span></div>
                                            <div><span className="text-gray-400">Longitude:</span> <span className="text-white font-medium">{longitude || 'N/A'}</span></div>
                                            <div><span className="text-gray-400">Critical:</span> <span className={`font-medium ${isCritical ? 'text-red-400' : 'text-green-400'}`}>{isCritical ? '🚨 Yes' : 'No'}</span></div>
                                            <div className="mt-3 text-gray-300 text-sm">{description || 'No description provided'}</div>
                                        </div>
                                    </div>

                                    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                                        <h3 className="text-lg font-semibold text-white mb-4">📊 Summary</h3>
                                        <div className="space-y-3">
                                            <div className="flex justify-between items-center">
                                                <span className="text-gray-400">Total Detected:</span>
                                                <span className="text-3xl font-bold text-blue-400">{result.statistics?.total_detections || 0}</span>
                                            </div>
                                            <div className="pt-3 border-t border-gray-700 space-y-2">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-gray-400">Minor:</span>
                                                    <span className="text-green-400 font-semibold">{result.statistics?.severity_breakdown?.Minor || 0}</span>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-gray-400">Moderate:</span>
                                                    <span className="text-yellow-400 font-semibold">{result.statistics?.severity_breakdown?.Moderate || 0}</span>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-gray-400">Major:</span>
                                                    <span className="text-red-400 font-semibold">{result.statistics?.severity_breakdown?.Major || 0}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Detection Image */}
                                {result.image_with_detections && (
                                    <div className="mb-8 bg-gray-800 rounded-xl p-6 border border-gray-700">
                                        <h3 className="text-lg font-semibold text-white mb-4">🖼️ Detection Map</h3>
                                        <img 
                                            src={`data:image/jpeg;base64,${result.image_with_detections}`} 
                                            alt="Detection" 
                                            className="w-full rounded-lg"
                                        />
                                    </div>
                                )}

                                {/* Detailed Detections */}
                                {result.detections && result.detections.length > 0 ? (
                                    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                                        <h3 className="text-lg font-semibold text-white mb-4">🔍 Detailed Potholes ({result.detections.length})</h3>
                                        <div className="space-y-3 max-h-96 overflow-y-auto">
                                            {result.detections.map((det, idx) => (
                                                <div key={idx} className={`p-4 rounded-lg border-l-4 ${
                                                    det.severity === 'Major' ? 'bg-red-900/20 border-red-500' :
                                                    det.severity === 'Moderate' ? 'bg-yellow-900/20 border-yellow-500' :
                                                    'bg-green-900/20 border-green-500'
                                                }`}>
                                                    <div className="flex justify-between items-start mb-2">
                                                        <span className="text-white font-semibold">Pothole #{idx + 1}</span>
                                                        <span className={`px-3 py-1 rounded text-xs font-bold ${
                                                            det.severity === 'Major' ? 'bg-red-600 text-red-200' :
                                                            det.severity === 'Moderate' ? 'bg-yellow-600 text-yellow-200' :
                                                            'bg-green-600 text-green-200'
                                                        }`}>{det.severity}</span>
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-2 text-xs text-gray-300">
                                                        <div>Confidence: {((det.confidence || 0) * 100).toFixed(1)}%</div>
                                                        <div>Area: {det.area || 'N/A'} px²</div>
                                                        <div>Dimensions: {det.width}×{det.height}px</div>
                                                        <div>Position: ({det.bbox?.[0]}, {det.bbox?.[1]})</div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="bg-green-900/20 border border-green-700 rounded-xl p-8 text-center">
                                        <h3 className="text-2xl font-bold text-green-400 mb-2">✓ No Potholes Detected</h3>
                                        <p className="text-green-300">The road appears to be in excellent condition!</p>
                                    </div>
                                )}

                                {/* Action Buttons */}
                                <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
                                    <button onClick={closeResult} className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-semibold">← Back to Form</button>
                                    <button onClick={handleReset} className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-700 hover:to-emerald-600 text-white rounded-lg font-semibold">+ New Report</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}        </div>
    )
}