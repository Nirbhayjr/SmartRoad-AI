'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import axios from 'axios'
import ErrorBoundary from '../../components/ErrorBoundary'

// Dynamically import maps to avoid SSR issues
const PotholeAlertMap = dynamic(() => import('../../components/PotholeAlertMap'), { ssr: false })
const RouteMap = dynamic(() => import('../../components/RouteMap'), { ssr: false })

export default function NavigatePage() {
  const router = useRouter()
  const [location, setLocation] = useState(null)
  const [watchId, setWatchId] = useState(null)
  const [isTracking, setIsTracking] = useState(false)
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [alertRadius, setAlertRadius] = useState(500)
  const [showAlertZones, setShowAlertZones] = useState(true)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [lastAlertTime, setLastAlertTime] = useState({})

  // Route planning states
  const [useRouteMode, setUseRouteMode] = useState(false)
  const [showRouteModal, setShowRouteModal] = useState(false)
  const [showHowToUse, setShowHowToUse] = useState(false)
  const [showRouteAnalysis, setShowRouteAnalysis] = useState(true)
  const [showStatistics, setShowStatistics] = useState(true)
  const [showMapInfo, setShowMapInfo] = useState(true)
  const [startInput, setStartInput] = useState('')
  const [endInput, setEndInput] = useState('')
  const [startLocation, setStartLocation] = useState(null)
  const [endLocation, setEndLocation] = useState(null)
  const [searching, setSearching] = useState(false)
  const [locationSuggestions, setLocationSuggestions] = useState({ start: [], end: [] })
  const [stats, setStats] = useState({
    totalDistance: 0,
    potholesPassed: 0,
    alertsShown: 0
  })

  // Fetch pothole reports from backend
  useEffect(() => {
    const fetchReports = async () => {
      setLoading(true)
      try {
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://smartroad-ai.onrender.com'
        const response = await axios.get(`${backendUrl}/admin/stats`)
        setReports((response.data && response.data.data && response.data.data.reports) || [])
        setError(null)
      } catch (err) {
        // If backend is not available, try to load from local file
        try {
          const localResponse = await fetch('/reports.json')
          if (localResponse.ok) {
            const data = await localResponse.json()
            setReports(data || [])
            setError(null)
          } else {
            setError('Could not load pothole reports')
          }
        } catch (localErr) {
          setError('Could not connect to backend')
          console.error('Error fetching reports:', err, localErr)
        }
      } finally {
        setLoading(false)
      }
    }

    fetchReports()
    // Refresh every 30 seconds
    const interval = setInterval(fetchReports, 30000)
    return () => clearInterval(interval)
  }, [])

  // Reference to preloaded audio element for alert sound
  const alertAudioRef = useRef(null)

  // Play alert sound (try backend file first, fallback to oscillator)
  const playAlertSound = useCallback(async () => {
    if (!soundEnabled) return

    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://smartroad-ai.onrender.com'
    const soundUrl = `${backendUrl}/sounds/alert.mp3`

    try {
      if (!alertAudioRef.current) {
        alertAudioRef.current = new Audio(soundUrl)
        alertAudioRef.current.preload = 'auto'
      }
      alertAudioRef.current.currentTime = 0
      await alertAudioRef.current.play()
      return
    } catch (err) {
      // fallback to simple oscillator beep if file missing or play() blocked
      try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)()
        const oscillator = audioContext.createOscillator()
        const gainNode = audioContext.createGain()

        oscillator.connect(gainNode)
        gainNode.connect(audioContext.destination)

        oscillator.frequency.value = 800
        oscillator.type = 'sine'

        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5)

        oscillator.start(audioContext.currentTime)
        oscillator.stop(audioContext.currentTime + 0.5)
      } catch (err2) {
        console.error('Could not play sound:', err, err2)
      }
    }
  }, [soundEnabled])

  // Start live location tracking
  const startTracking = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser')
      return
    }

    const id = navigator.geolocation.watchPosition(
      (position) => {
        const newLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
          speed: position.coords.speed,
          heading: position.coords.heading
        }
        setLocation(newLocation)
        setError(null)
        setIsTracking(true)

        // Check for nearby potholes and play sound for new alerts
        checkNearbyPotholes(newLocation)
      },
      (err) => {
        setError(`Location error: ${err.message}`)
        setIsTracking(false)
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
      }
    )

    setWatchId(id)
  }, [])

  // Stop tracking
  const stopTracking = useCallback(() => {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId)
      setWatchId(null)
      setIsTracking(false)
    }
  }, [watchId])

  // Check for nearby potholes
  const checkNearbyPotholes = useCallback((currentLocation) => {
    if (!currentLocation || !reports.length) return

    const now = Date.now()
    let newAlerts = 0

    reports.forEach((report) => {
      const distance = calculateDistance(
        currentLocation.lat,
        currentLocation.lng,
        report.lat,
        report.lng
      )

      // Alert if within radius and not alerted recently (cooldown 60 seconds)
      if (distance <= alertRadius) {
        const lastAlert = lastAlertTime[report.id] || 0
        if (now - lastAlert > 60000) {
          playAlertSound()
          setLastAlertTime(prev => ({ ...prev, [report.id]: now }))
          newAlerts++
        }
      }
    })

    if (newAlerts > 0) {
      setStats(prev => ({
        ...prev,
        alertsShown: prev.alertsShown + newAlerts
      }))
    }
  }, [reports, alertRadius, lastAlertTime, playAlertSound])

  // Calculate distance between two coordinates
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3
    const φ1 = lat1 * Math.PI / 180
    const φ2 = lat2 * Math.PI / 180
    const Δφ = (lat2 - lat1) * Math.PI / 180
    const Δλ = (lon2 - lon1) * Math.PI / 180

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) *
      Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

    return R * c
  }

  // Calculate severity statistics from actual reports data
  const getSeverityStats = () => {
    const stats = {
      Minor: 0,
      Moderate: 0,
      Major: 0,
      total: 0,
      totalDetections: 0
    }

    reports.forEach(report => {
      // Aggregate from severity_breakdown if available
      if (report.severity_breakdown) {
        stats.Minor += report.severity_breakdown.Minor || 0
        stats.Moderate += report.severity_breakdown.Moderate || 0
        stats.Major += report.severity_breakdown.Major || 0
        stats.totalDetections += report.total_detections || 0
      } else if (report.detections && Array.isArray(report.detections)) {
        // Fallback: count from individual detections
        report.detections.forEach(detection => {
          const severity = detection.severity || 'Moderate'
          if (severity in stats) {
            stats[severity]++
          }
        })
        stats.totalDetections += report.detections.length
      }
    })

    stats.total = reports.length

    return stats
  }

  const severityStats = getSeverityStats()

  // Get default map center from reports or use India center
  const getDefaultCenter = () => {
    if (reports.length > 0 && reports[0].lat && reports[0].lng) {
      return { lat: reports[0].lat, lng: reports[0].lng }
    }
    // Default to India center if no reports
    return { lat: 20.5937, lng: 78.9629 }
  }

  // Get current position once
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported')
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy
        })
        setError(null)
      },
      (err) => {
        setError(`Location error: ${err.message}`)
      }
    )
  }

  // Get current location for route start
  const getCurrentLocationForRoute = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported')
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const loc = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          name: 'Current Location'
        }
        setStartLocation(loc)
        setStartInput('Current Location')
        setLocationSuggestions(prev => ({ ...prev, start: [] }))
        setError(null)
      },
      (err) => {
        setError(`Location error: ${err.message}`)
      }
    )
  }

  // Search location using OpenStreetMap Nominatim API
  const searchLocation = async (query, type) => {
    if (!query || query.length < 3) {
      setLocationSuggestions(prev => ({ ...prev, [type]: [] }))
      return
    }

    setSearching(true)
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`
      )
      const data = await response.json()

      const suggestions = data.map(item => ({
        name: item.display_name.split(',')[0],
        lat: parseFloat(item.lat),
        lng: parseFloat(item.lon),
        fullName: item.display_name
      }))

      setLocationSuggestions(prev => ({ ...prev, [type]: suggestions }))
    } catch (err) {
      console.error('Search error:', err)
    } finally {
      setSearching(false)
    }
  }

  // Debounce search input to avoid excessive network calls
  const DEBOUNCE_MS = 400
  const searchTimers = useRef({ start: null, end: null })

  const handleSearchChange = (value, type) => {
    if (type === 'start') setStartInput(value)
    else setEndInput(value)

    if (searchTimers.current[type]) {
      clearTimeout(searchTimers.current[type])
    }

    if (!value || value.length < 3) {
      setLocationSuggestions(prev => ({ ...prev, [type]: [] }))
      return
    }

    searchTimers.current[type] = setTimeout(() => {
      searchLocation(value, type)
    }, DEBOUNCE_MS)
  }

  // Select location from suggestions
  const selectLocation = (location, type) => {
    if (type === 'start') {
      setStartLocation(location)
      setStartInput(location.name)
      setLocationSuggestions(prev => ({ ...prev, start: [] }))
    } else {
      setEndLocation(location)
      setEndInput(location.name)
      setLocationSuggestions(prev => ({ ...prev, end: [] }))
    }
  }

  // Apply route and close modal
  const applyRoute = () => {
    if (startLocation && endLocation) {
      setUseRouteMode(true)
      setShowRouteModal(false)
    }
  }

  // Clear route
  const clearRoute = () => {
    setStartLocation(null)
    setEndLocation(null)
    setStartInput('')
    setEndInput('')
    setUseRouteMode(false)
    setLocationSuggestions({ start: [], end: [] })
  }

  // Toggle tracking
  const toggleTracking = () => {
    if (isTracking) {
      stopTracking()
    } else {
      startTracking()
    }
  }

  return (
    <div style={{
      height: '100vh',
      backgroundColor: '#0f172a',
      color: '#FFF',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      backgroundImage: `
        radial-gradient(ellipse 80% 50% at 20% 0%, rgba(59, 130, 246, 0.08) 0%, transparent 60%),
        radial-gradient(ellipse 60% 40% at 80% 100%, rgba(6, 182, 212, 0.06) 0%, transparent 60%)
      `
    }}>
      {/* ===== SECTION 1: NAVBAR & CONTROLS ===== */}
      {/* Fixed Header */}
      <div style={{
        backgroundColor: 'rgba(15, 23, 42, 0.85)',
        backdropFilter: 'blur(12px)',
        padding: '20px',
        borderBottom: '1px solid rgba(6, 182, 212, 0.1)',
        position: 'fixed',
        top: 70,
        left: 0,
        right: 0,
        zIndex: 997
      }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
            <div>
              <h1 style={{ margin: '0 0 5px 0', fontSize: '24px', fontWeight: 'bold' }}>
                🗺️ Pothole Navigation & Route Planning
                {/* Journey active banner */}
                {isTracking && useRouteMode && (
                  <div style={{ position: 'fixed', top: 140, right: 24, zIndex: 999, background: 'linear-gradient(90deg,#059669,#10b981)', color: '#fff', padding: '10px 14px', borderRadius: 10, boxShadow: '0 8px 20px rgba(2,6,23,0.4)', display: 'flex', gap: 10, alignItems: 'center' }}>
                    <div style={{ fontWeight: '700' }}>Journey Active</div>
                    <button onClick={() => { stopTracking(); setUseRouteMode(false); }} style={{ background: 'rgba(255,255,255,0.12)', color: '#fff', border: 'none', padding: '8px 10px', borderRadius: 8, cursor: 'pointer' }}>Stop Journey</button>
                  </div>
                )}
              </h1>
              <p style={{ margin: 0, color: '#AAA', fontSize: '14px' }}>
                {useRouteMode ? 'Showing potholes on your planned route' : 'Real-time GPS tracking with pothole alerts'}
              </p>
            </div>

            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap', width: '100%', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowHowToUse(true)}
                style={{
                  padding: '12px 20px',
                  backgroundColor: 'rgba(59, 130, 246, 0.1)',
                  color: '#60A5FA',
                  border: '1px solid rgba(59, 130, 246, 0.3)',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                  transition: 'all 0.2s',
                  whiteSpace: 'nowrap'
                }}
                onMouseOver={(e) => {
                  e.target.style.backgroundColor = 'rgba(59, 130, 246, 0.2)';
                  e.target.style.borderColor = 'rgba(59, 130, 246, 0.5)';
                }}
                onMouseOut={(e) => {
                  e.target.style.backgroundColor = 'rgba(59, 130, 246, 0.1)';
                  e.target.style.borderColor = 'rgba(59, 130, 246, 0.3)';
                }}
              >
                ❓ How to Use
              </button>

              <button
                onClick={() => router.push('/')}
                style={{
                  padding: '12px 20px',
                  backgroundColor: 'rgba(148, 163, 184, 0.1)',
                  color: '#CBD5E1',
                  border: '1px solid rgba(148, 163, 184, 0.2)',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                  transition: 'all 0.2s',
                  whiteSpace: 'nowrap'
                }}
                onMouseOver={(e) => {
                  e.target.style.backgroundColor = 'rgba(148, 163, 184, 0.15)';
                }}
                onMouseOut={(e) => {
                  e.target.style.backgroundColor = 'rgba(148, 163, 184, 0.1)';
                }}
              >
                ← Back
              </button>

              {/* Route Planning Button - Google Maps style */}
              <button
                onClick={() => setShowRouteModal(true)}
                style={{
                  padding: '14px 32px',
                  background: 'linear-gradient(135deg, #06B6D4 0%, #0EA5E9 50%, #3B82F6 100%)',
                  color: '#FFF',
                  border: 'none',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  boxShadow: '0 8px 24px rgba(6, 182, 212, 0.4)',
                  transition: 'all 0.3s ease',
                  whiteSpace: 'nowrap'
                }}
                onMouseOver={(e) => {
                  e.target.style.transform = 'translateY(-3px)';
                  e.target.style.boxShadow = '0 12px 32px rgba(6, 182, 212, 0.6)';
                  e.target.style.background = 'linear-gradient(135deg, #0EA5E9 0%, #3B82F6 50%, #06B6D4 100%)';
                }}
                onMouseOut={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 8px 24px rgba(6, 182, 212, 0.4)';
                  e.target.style.background = 'linear-gradient(135deg, #06B6D4 0%, #0EA5E9 50%, #3B82F6 100%)';
                }}
              >
                <span style={{ fontSize: '18px' }}>🚗</span> Plan Your Route
              </button>

              {useRouteMode && (
                <button
                  onClick={clearRoute}
                  style={{
                    padding: '12px 20px',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    color: '#F87171',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500',
                    transition: 'all 0.2s',
                    whiteSpace: 'nowrap'
                  }}
                  onMouseOver={(e) => {
                    e.target.style.backgroundColor = 'rgba(239, 68, 68, 0.15)';
                    e.target.style.borderColor = 'rgba(239, 68, 68, 0.5)';
                  }}
                  onMouseOut={(e) => {
                    e.target.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
                    e.target.style.borderColor = 'rgba(239, 68, 68, 0.3)';
                  }}
                >
                  ✕ Clear Route
                </button>
              )}
            </div>
          </div>

          {/* Route Summary Bar */}
          {useRouteMode && startLocation && endLocation && (
            <div style={{
              backgroundColor: 'rgba(6, 182, 212, 0.08)',
              padding: '15px 20px',
              borderRadius: '8px',
              border: '1px solid rgba(6, 182, 212, 0.2)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '15px',
              marginTop: '15px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <div>
                  <span style={{ color: '#94A3B8', fontSize: '12px' }}>From:</span>
                  <div style={{ fontWeight: 'bold', fontSize: '14px', color: '#E2E8F0' }}>{startInput}</div>
                </div>
                <span style={{ color: '#06B6D4', fontSize: '20px' }}>→</span>
                <div>
                  <span style={{ color: '#94A3B8', fontSize: '12px' }}>To:</span>
                  <div style={{ fontWeight: 'bold', fontSize: '14px', color: '#E2E8F0' }}>{endInput}</div>
                </div>
              </div>
              <button
                onClick={() => setShowRouteModal(true)}
                style={{
                  padding: '8px 16px',
                  backgroundColor: 'rgba(59, 130, 246, 0.1)',
                  color: '#60A5FA',
                  border: '1px solid rgba(59, 130, 246, 0.3)',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: '500',
                  transition: 'all 0.2s'
                }}
                onMouseOver={(e) => {
                  e.target.style.backgroundColor = 'rgba(59, 130, 246, 0.15)';
                }}
                onMouseOut={(e) => {
                  e.target.style.backgroundColor = 'rgba(59, 130, 246, 0.1)';
                }}
              >
                ✏️ Edit Route
              </button>
            </div>
          )}
        </div>
      </div>
      {/* Spacer for fixed header */}
      <div style={{ height: '160px' }}></div>

      {/* "How to Use" Modal */}
      {showHowToUse && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          zIndex: 9998,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '20px',
          backdropFilter: 'blur(5px)'
        }}
          onClick={() => setShowHowToUse(false)}
        >
          <div style={{
            backgroundColor: 'rgba(30, 41, 59, 0.95)',
            backdropFilter: 'blur(12px)',
            borderRadius: '16px',
            maxWidth: '500px',
            width: '100%',
            padding: '32px',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
            border: '1px solid rgba(6, 182, 212, 0.2)'
          }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 'bold', color: '#06B6D4' }}>
                🚗 How to Use
              </h2>
              <button
                onClick={() => setShowHowToUse(false)}
                style={{
                  backgroundColor: 'transparent',
                  border: 'none',
                  color: '#94A3B8',
                  fontSize: '28px',
                  cursor: 'pointer',
                  padding: '0',
                  width: '36px',
                  height: '36px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '50%',
                  transition: 'all 0.2s'
                }}
                onMouseOver={(e) => {
                  e.target.style.backgroundColor = 'rgba(148, 163, 184, 0.1)';
                  e.target.style.color = '#E2E8F0';
                }}
                onMouseOut={(e) => {
                  e.target.style.backgroundColor = 'transparent';
                  e.target.style.color = '#94A3B8';
                }}
              >
                ✕
              </button>
            </div>

            <div style={{ fontSize: '15px', lineHeight: '1.8', color: '#DDD', marginBottom: '24px' }}>
              <div style={{ marginBottom: '16px' }}>
                <strong style={{ color: '#4CAF50', fontSize: '16px' }}>Live Tracking Mode:</strong>
                <ul style={{ margin: '8px 0 0 0', paddingLeft: '20px' }}>
                  <li>Click <strong>"Get Location"</strong> to find your current position</li>
                  <li>Click <strong>"Start Live Tracking"</strong> to enable real-time navigation</li>
                  <li>You'll get instant alerts when potholes are near</li>
                  <li>Adjust alert radius to customize warning distance</li>
                </ul>
              </div>

              <div>
                <strong style={{ color: '#60A5FA', fontSize: '16px' }}>Plan Route Mode:</strong>
                <ul style={{ margin: '8px 0 0 0', paddingLeft: '20px' }}>
                  <li>Click <strong>"Plan Your Route"</strong> to open the route planner</li>
                  <li>Enter your starting location or use current location</li>
                  <li>Search and select your destination</li>
                  <li>Click <strong>"Show Route Without Potholes"</strong> to visualize</li>
                  <li>The planner will attempt to highlight safe path avoiding potholes</li>
                </ul>
              </div>
            </div>

            <button
              onClick={() => setShowHowToUse(false)}
              style={{
                width: '100%',
                padding: '14px',
                background: 'linear-gradient(135deg, rgb(59, 130, 246), rgb(6, 182, 212))',
                color: '#FFF',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: 'bold',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 8px 20px rgba(59, 130, 246, 0.3)';
              }}
              onMouseOut={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = 'none';
              }}
            >
              ✓ Got It!
            </button>
          </div>
        </div>
      )}

      {/* Route Planning Modal - Full screen overlay */}
      {showRouteModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          zIndex: 9999,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '20px',
          backdropFilter: 'blur(5px)'
        }}
          onClick={() => setShowRouteModal(false)}
        >
          <div style={{
            backgroundColor: 'rgba(30, 41, 59, 0.95)',
            backdropFilter: 'blur(12px)',
            borderRadius: '16px',
            maxWidth: '600px',
            width: '100%',
            maxHeight: '90vh',
            overflow: 'auto',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
            border: '1px solid rgba(6, 182, 212, 0.2)'
          }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{
              padding: '24px',
              borderBottom: '1px solid rgba(6, 182, 212, 0.1)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <h2 style={{ margin: '0 0 5px 0', fontSize: '22px', fontWeight: 'bold', color: '#06B6D4' }}>
                  🗺️ Plan Your Route
                </h2>
                <p style={{ margin: 0, fontSize: '13px', color: '#94A3B8' }}>
                  Enter start and destination to see potholes on your route
                </p>
              </div>
              <button
                onClick={() => setShowRouteModal(false)}
                style={{
                  backgroundColor: 'transparent',
                  border: 'none',
                  color: '#94A3B8',
                  fontSize: '28px',
                  cursor: 'pointer',
                  padding: '0',
                  width: '36px',
                  height: '36px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '50%',
                  transition: 'all 0.2s'
                }}
                onMouseOver={(e) => {
                  e.target.style.backgroundColor = 'rgba(148, 163, 184, 0.1)';
                  e.target.style.color = '#E2E8F0';
                }}
                onMouseOut={(e) => {
                  e.target.style.backgroundColor = 'transparent';
                  e.target.style.color = '#94A3B8';
                }}
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '24px' }}>
              {/* Start Location Input */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '10px',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  color: '#06B6D4'
                }}>
                  <span style={{ fontSize: '20px' }}>🟢</span> Your Location
                </label>

                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    value={startInput}
                    onChange={(e) => handleSearchChange(e.target.value, 'start')}
                    placeholder="Choose starting point or click below to use current location"
                    style={{
                      width: '100%',
                      padding: '14px 16px',
                      backgroundColor: 'rgba(6, 182, 212, 0.05)',
                      color: '#E2E8F0',
                      border: '1px solid rgba(6, 182, 212, 0.3)',
                      borderRadius: '8px',
                      fontSize: '15px',
                      boxSizing: 'border-box',
                      marginBottom: '10px',
                      outline: 'none',
                      transition: 'all 0.2s'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = 'rgba(6, 182, 212, 0.6)';
                      e.target.style.backgroundColor = 'rgba(6, 182, 212, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'rgba(6, 182, 212, 0.3)';
                      e.target.style.backgroundColor = 'rgba(6, 182, 212, 0.05)';
                    }}
                  />

                  {locationSuggestions.start.length > 0 && (
                    <div style={{
                      position: 'absolute',
                      top: '56px',
                      left: 0,
                      right: 0,
                      backgroundColor: 'rgba(30, 41, 59, 0.95)',
                      border: '1px solid rgba(6, 182, 212, 0.3)',
                      borderRadius: '8px',
                      marginTop: '4px',
                      zIndex: 10000,
                      maxHeight: '200px',
                      overflowY: 'auto',
                      boxShadow: '0 8px 20px rgba(0,0,0,0.3)'
                    }}>
                      {locationSuggestions.start.map((loc, idx) => (
                        <div
                          key={idx}
                          onClick={() => selectLocation(loc, 'start')}
                          style={{
                            padding: '12px 16px',
                            borderBottom: idx < locationSuggestions.start.length - 1 ? '1px solid rgba(148, 163, 184, 0.1)' : 'none',
                            cursor: 'pointer',
                            fontSize: '14px',
                            transition: 'background 0.2s'
                          }}
                          onMouseOver={(e) => e.target.style.backgroundColor = 'rgba(59, 130, 246, 0.1)'}
                          onMouseOut={(e) => e.target.style.backgroundColor = '#0A0A0A'}
                        >
                          <div style={{ fontWeight: 'bold', marginBottom: '2px' }}>📍 {loc.name}</div>
                          <div style={{ fontSize: '12px', color: '#AAA' }}>{loc.fullName}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <button
                  onClick={() => getCurrentLocationForRoute()}
                  style={{
                    width: '100%',
                    padding: '12px',
                    backgroundColor: '#2E7D32',
                    color: '#FFF',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    transition: 'background 0.2s'
                  }}
                  onMouseOver={(e) => e.target.style.backgroundColor = '#1B5E20'}
                  onMouseOut={(e) => e.target.style.backgroundColor = '#2E7D32'}
                >
                  📍 Use My Current Location
                </button>
              </div>

              {/* Destination Input */}
              <div style={{ marginBottom: '24px' }}>
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '10px',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  color: '#60A5FA'
                }}>
                  <span style={{ fontSize: '20px' }}>🔵</span> Destination
                </label>

                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    value={endInput}
                    onChange={(e) => handleSearchChange(e.target.value, 'end')}
                    placeholder="Where do you want to go?"
                    style={{
                      width: '100%',
                      padding: '14px 16px',
                      backgroundColor: 'rgba(59, 130, 246, 0.05)',
                      color: '#E2E8F0',
                      border: '1px solid rgba(59, 130, 246, 0.3)',
                      borderRadius: '8px',
                      fontSize: '15px',
                      boxSizing: 'border-box',
                      outline: 'none',
                      transition: 'all 0.2s'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = 'rgba(59, 130, 246, 0.6)';
                      e.target.style.backgroundColor = 'rgba(59, 130, 246, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'rgba(59, 130, 246, 0.3)';
                      e.target.style.backgroundColor = 'rgba(59, 130, 246, 0.05)';
                    }}
                  />

                  {locationSuggestions.end.length > 0 && (
                    <div style={{
                      position: 'absolute',
                      top: '56px',
                      left: 0,
                      right: 0,
                      backgroundColor: 'rgba(30, 41, 59, 0.95)',
                      border: '1px solid rgba(59, 130, 246, 0.3)',
                      borderRadius: '8px',
                      marginTop: '4px',
                      zIndex: 10000,
                      maxHeight: '200px',
                      overflowY: 'auto',
                      boxShadow: '0 8px 20px rgba(0,0,0,0.3)'
                    }}>
                      {locationSuggestions.end.map((loc, idx) => (
                        <div
                          key={idx}
                          onClick={() => selectLocation(loc, 'end')}
                          style={{
                            padding: '12px 16px',
                            borderBottom: idx < locationSuggestions.end.length - 1 ? '1px solid #333' : 'none',
                            cursor: 'pointer',
                            fontSize: '14px',
                            transition: 'background 0.2s'
                          }}
                          onMouseOver={(e) => e.target.style.backgroundColor = '#2A2A2A'}
                          onMouseOut={(e) => e.target.style.backgroundColor = '#0A0A0A'}
                        >
                          <div style={{ fontWeight: 'bold', marginBottom: '2px' }}>📍 {loc.name}</div>
                          <div style={{ fontSize: '12px', color: '#AAA' }}>{loc.fullName}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Status Messages */}
              {error && (
                <div style={{
                  backgroundColor: '#5D1F1F',
                  color: '#FF6B6B',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  marginBottom: '16px',
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <span>❌</span> {error}
                </div>
              )}

              {searching && (
                <div style={{
                  backgroundColor: '#1F3D5D',
                  color: '#64B5F6',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  marginBottom: '16px',
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <span>⏳</span> Searching locations...
                </div>
              )}

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={() => setShowRouteModal(false)}
                  style={{
                    flex: 1,
                    padding: '14px',
                    backgroundColor: 'rgba(148, 163, 184, 0.1)',
                    color: '#CBD5E1',
                    border: '1px solid rgba(148, 163, 184, 0.2)',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '15px',
                    fontWeight: 'bold',
                    transition: 'all 0.2s'
                  }}
                  onMouseOver={(e) => {
                    e.target.style.backgroundColor = 'rgba(148, 163, 184, 0.15)';
                  }}
                  onMouseOut={(e) => {
                    e.target.style.backgroundColor = 'rgba(148, 163, 184, 0.1)';
                  }}
                >
                  Cancel
                </button>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    onClick={applyRoute}
                    disabled={!startLocation || !endLocation}
                    style={{
                      flex: 2,
                      padding: '14px',
                      background: startLocation && endLocation ? 'linear-gradient(135deg, rgb(34, 197, 94), rgb(16, 185, 129))' : 'rgba(148, 163, 184, 0.2)',
                      color: '#FFF',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: startLocation && endLocation ? 'pointer' : 'not-allowed',
                      fontSize: '15px',
                      fontWeight: 'bold',
                      transition: 'all 0.2s',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px'
                    }}
                    onMouseOver={(e) => {
                      if (startLocation && endLocation) {
                        e.target.style.transform = 'translateY(-2px)';
                        e.target.style.boxShadow = '0 6px 16px rgba(34, 197, 94, 0.3)';
                      }
                    }}
                    onMouseOut={(e) => {
                      if (startLocation && endLocation) {
                        e.target.style.transform = 'translateY(0)';
                        e.target.style.boxShadow = 'none';
                      }
                    }}
                  >
                    <span>🗺️</span> Show Route Without Potholes
                  </button>

                  <button
                    onClick={() => {
                      if (!startLocation || !endLocation) return
                      applyRoute()
                      try {
                        startTracking()
                      } catch (e) { }
                    }}
                    disabled={!startLocation || !endLocation}
                    style={{
                      flex: 1,
                      padding: '14px',
                      background: startLocation && endLocation ? 'linear-gradient(135deg, rgb(59,130,246), rgb(6,182,212))' : 'rgba(148,163,184,0.12)',
                      color: '#FFF',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: startLocation && endLocation ? 'pointer' : 'not-allowed',
                      fontSize: '14px',
                      fontWeight: '600',
                      transition: 'all 0.15s',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    ▶ Start Journey
                  </button>
                </div>
              </div>
            </div>

            {/* Inline Preview Map (shows when both start and end selected) */}
            {startLocation && endLocation && (
              <div style={{ marginTop: '12px', marginBottom: '18px', height: 220, borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(6,182,212,0.12)' }}>
                <RouteMap
                  startLocation={startLocation}
                  endLocation={endLocation}
                  reports={reports}
                  showAnalysis={false}
                  style={{ height: '100%' }}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Control Panel - Hidden - Map shows automatically */}
      {/* Map displays all potholes without needing live tracking */}
      {/* END NAVBAR & CONTROLS SECTION */}

      {/* Map Container - Separate Section */}
      <div style={{
        flex: 1,
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* STATUS BAR */}
        {isTracking && (
          <div style={{
            padding: '8px 15px',
            backgroundColor: 'rgba(26, 26, 26, 0.9)',
            borderBottom: '1px solid rgba(6, 182, 212, 0.2)',
            fontSize: '13px',
            color: '#AAA',
            position: 'relative',
            zIndex: 10
          }}>
            {error && `❌ ${error}`}
            {loading && '⏳ Loading pothole data...'}
            {isTracking && !error && (
              <span>
                🟢 Live tracking active •
                {location && ` 📍 ${location.lat.toFixed(5)}, ${location.lng.toFixed(5)}`}
                {location?.accuracy && ` • Accuracy: ±${Math.round(location.accuracy)}m`}
                {location?.speed && location.speed > 0 && ` • Speed: ${(location.speed * 3.6).toFixed(1)} km/h`}
              </span>
            )}
          </div>
        )}

        {/* MAP DISPLAY - absolute fill */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: '#1a2340'
        }}>
          {/* Real-time Pothole Statistics Panel */}
          {showStatistics && (
            <div style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              zIndex: 1000,
              backgroundColor: 'rgba(15, 23, 42, 0.95)',
              backdropFilter: 'blur(12px)',
              borderRadius: '12px',
              border: '1px solid rgba(6, 182, 212, 0.3)',
              padding: '20px',
              minWidth: '280px',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '10px',
                marginBottom: '15px',
                paddingBottom: '12px',
                borderBottom: '1px solid rgba(6, 182, 212, 0.2)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '24px' }}>📊</span>
                  <h3 style={{
                    margin: 0,
                    fontSize: '16px',
                    fontWeight: 'bold',
                    color: '#06B6D4'
                  }}>
                    Live Pothole Statistics
                  </h3>
                </div>
                <button
                  onClick={() => setShowStatistics(false)}
                  style={{
                    backgroundColor: 'transparent',
                    border: 'none',
                    color: '#94A3B8',
                    fontSize: '20px',
                    cursor: 'pointer',
                    padding: '0',
                    width: '28px',
                    height: '28px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '4px',
                    transition: 'all 0.2s'
                  }}
                  onMouseOver={(e) => {
                    e.target.style.backgroundColor = 'rgba(148, 163, 184, 0.1)';
                    e.target.style.color = '#E2E8F0';
                  }}
                  onMouseOut={(e) => {
                    e.target.style.backgroundColor = 'transparent';
                    e.target.style.color = '#94A3B8';
                  }}
                >
                  ✕
                </button>
              </div>

              {loading ? (
                <div style={{
                  textAlign: 'center',
                  padding: '20px',
                  color: '#94A3B8'
                }}>
                  <div style={{ fontSize: '32px', marginBottom: '10px' }}>⏳</div>
                  <div>Loading data...</div>
                </div>
              ) : error ? (
                <div style={{
                  textAlign: 'center',
                  padding: '20px',
                  color: '#EF4444'
                }}>
                  <div style={{ fontSize: '32px', marginBottom: '10px' }}>⚠️</div>
                  <div style={{ fontSize: '13px' }}>{error}</div>
                </div>
              ) : (
                <>
                  {/* Total Count */}
                  <div style={{
                    backgroundColor: 'rgba(6, 182, 212, 0.1)',
                    borderRadius: '8px',
                    padding: '15px',
                    marginBottom: '12px',
                    border: '1px solid rgba(6, 182, 212, 0.3)',
                    textAlign: 'center'
                  }}>
                    <div style={{
                      fontSize: '32px',
                      fontWeight: 'bold',
                      color: '#06B6D4',
                      marginBottom: '4px'
                    }}>
                      {severityStats.totalDetections}
                    </div>
                    <div style={{
                      fontSize: '13px',
                      color: '#94A3B8',
                      fontWeight: '500'
                    }}>
                      Total Potholes Detected
                    </div>
                    <div style={{
                      fontSize: '11px',
                      color: '#64748B',
                      marginTop: '4px'
                    }}>
                      {severityStats.total} Reports
                    </div>
                  </div>

                  {/* Severity Breakdown */}
                  <div style={{ fontSize: '14px' }}>
                    <div style={{
                      fontSize: '12px',
                      color: '#94A3B8',
                      marginBottom: '10px',
                      fontWeight: '600',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>
                      Severity Breakdown
                    </div>

                    {/* Major (Most Severe) */}
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '10px 12px',
                      backgroundColor: 'rgba(220, 38, 38, 0.1)',
                      borderRadius: '6px',
                      marginBottom: '8px',
                      border: '1px solid rgba(220, 38, 38, 0.3)'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '16px' }}>🔴</span>
                        <span style={{ color: '#FCA5A5', fontWeight: '500' }}>Major</span>
                      </div>
                      <span style={{
                        fontWeight: 'bold',
                        fontSize: '16px',
                        color: '#EF4444'
                      }}>
                        {severityStats.Major}
                      </span>
                    </div>

                    {/* Moderate */}
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '10px 12px',
                      backgroundColor: 'rgba(249, 115, 22, 0.1)',
                      borderRadius: '6px',
                      marginBottom: '8px',
                      border: '1px solid rgba(249, 115, 22, 0.3)'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '16px' }}>🟠</span>
                        <span style={{ color: '#FED7AA', fontWeight: '500' }}>Moderate</span>
                      </div>
                      <span style={{
                        fontWeight: 'bold',
                        fontSize: '16px',
                        color: '#F97316'
                      }}>
                        {severityStats.Moderate}
                      </span>
                    </div>

                    {/* Minor */}
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '10px 12px',
                      backgroundColor: 'rgba(234, 179, 8, 0.1)',
                      borderRadius: '6px',
                      border: '1px solid rgba(234, 179, 8, 0.3)'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '16px' }}>🟡</span>
                        <span style={{ color: '#FDE68A', fontWeight: '500' }}>Minor</span>
                      </div>
                      <span style={{
                        fontWeight: 'bold',
                        fontSize: '16px',
                        color: '#EAB308'
                      }}>
                        {severityStats.Minor}
                      </span>
                    </div>
                  </div>

                  {/* Last Updated */}
                  <div style={{
                    marginTop: '12px',
                    paddingTop: '12px',
                    borderTop: '1px solid rgba(6, 182, 212, 0.1)',
                    fontSize: '11px',
                    color: '#64748B',
                    textAlign: 'center'
                  }}>
                    🔄 Updates every 30 seconds
                  </div>
                </>
              )}
            </div>
          )}

          {/* Loading overlay when fetching data */}
          {loading && reports.length === 0 && (
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 999,
              backgroundColor: 'rgba(15, 23, 42, 0.95)',
              padding: '30px 50px',
              borderRadius: '16px',
              border: '1px solid rgba(6, 182, 212, 0.3)',
              textAlign: 'center',
              boxShadow: '0 10px 40px rgba(0, 0, 0, 0.5)'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '15px' }}>🗺️</div>
              <div style={{ fontSize: '18px', color: '#06B6D4', fontWeight: 'bold', marginBottom: '8px' }}>
                Loading Map
              </div>
              <div style={{ fontSize: '14px', color: '#94A3B8' }}>
                Fetching pothole data...
              </div>
            </div>
          )}

          {/* Map Info Overlay - Shows when map is ready */}
          {!useRouteMode && !loading && reports.length > 0 && showMapInfo && (
            <div style={{
              position: 'absolute',
              bottom: '20px',
              left: '20px',
              zIndex: 999,
              backgroundColor: 'rgba(15, 23, 42, 0.95)',
              backdropFilter: 'blur(12px)',
              padding: '16px 20px',
              borderRadius: '12px',
              border: '1px solid rgba(6, 182, 212, 0.3)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
              maxWidth: '300px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', marginBottom: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '24px' }}>🗺️</span>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#06B6D4' }}>
                      Interactive Pothole Map
                    </div>
                    <div style={{ fontSize: '11px', color: '#94A3B8' }}>
                      {reports.length} locations loaded
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setShowMapInfo(false)}
                  style={{
                    backgroundColor: 'transparent',
                    border: 'none',
                    color: '#94A3B8',
                    fontSize: '18px',
                    cursor: 'pointer',
                    padding: '0',
                    width: '24px',
                    height: '24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '4px',
                    transition: 'all 0.2s',
                    flexShrink: 0
                  }}
                  onMouseOver={(e) => {
                    e.target.style.backgroundColor = 'rgba(148, 163, 184, 0.1)';
                    e.target.style.color = '#E2E8F0';
                  }}
                  onMouseOut={(e) => {
                    e.target.style.backgroundColor = 'transparent';
                    e.target.style.color = '#94A3B8';
                  }}
                >
                  ✕
                </button>
              </div>
              <div style={{ fontSize: '12px', color: '#CBD5E1', lineHeight: '1.6' }}>
                <div style={{ marginBottom: '6px' }}>
                  📍 <strong>Click markers</strong> to see pothole details
                </div>
                <div style={{ marginBottom: '6px' }}>
                  🔍 <strong>Zoom & drag</strong> to explore the map
                </div>
                <div>
                  🎯 <strong>GPS tracking optional</strong> - expand footer for alerts
                </div>
              </div>
            </div>
          )}

          {/* Severity Legend on Map */}
          {!useRouteMode && !loading && reports.length > 0 && (
            <div style={{
              position: 'absolute',
              top: '20px',
              left: '20px',
              zIndex: 999,
              backgroundColor: 'rgba(15, 23, 42, 0.95)',
              backdropFilter: 'blur(12px)',
              padding: '12px 16px',
              borderRadius: '10px',
              border: '1px solid rgba(6, 182, 212, 0.3)',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3)'
            }}>
              <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#06B6D4', marginBottom: '8px' }}>
                Severity Legend
              </div>
              <div style={{ fontSize: '11px', color: '#CBD5E1' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px' }}>
                  <div style={{ width: '16px', height: '16px', backgroundColor: '#FF0000', borderRadius: '50%', border: '2px solid #FFF' }}></div>
                  <span>Major</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px' }}>
                  <div style={{ width: '16px', height: '16px', backgroundColor: '#FF6500', borderRadius: '50%', border: '2px solid #FFF' }}></div>
                  <span>Moderate</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '16px', height: '16px', backgroundColor: '#FFA500', borderRadius: '50%', border: '2px solid #FFF' }}></div>
                  <span>Minor</span>
                </div>
              </div>
            </div>
          )}

          <ErrorBoundary>
            {useRouteMode ? (
              startLocation && endLocation ? (
                <RouteMap
                  startLocation={startLocation}
                  endLocation={endLocation}
                  reports={reports}
                  showAnalysis={showRouteAnalysis}
                  onCloseAnalysis={() => setShowRouteAnalysis(false)}
                />
              ) : (
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  height: '100%',
                  fontSize: '18px',
                  color: '#AAA',
                  padding: '20px',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '48px', marginBottom: '20px' }}>🗺️</div>
                  <div style={{ maxWidth: '500px' }}>
                    Click <strong style={{ color: '#06B6D4' }}>"Plan Your Route"</strong> button above to enter your starting location and destination to see the route with all potholes marked
                  </div>
                </div>
              )
            ) : (
              // Always show the map with potholes, even without user location
              <PotholeAlertMap
                userLocation={location}
                reports={reports}
                alertRadius={alertRadius}
                showAlertZones={showAlertZones}
              />
            )}
          </ErrorBoundary>
        </div>
      </div>
      {/* END MAP CONTAINER SECTION */}

      {/* ===== FOOTER & CONTROLS SECTION ===== */}
      <div style={{ flexShrink: 0, backgroundColor: '#0f172a', borderTop: '1px solid rgba(6, 182, 212, 0.1)' }}>
        {/* Optional GPS Tracking Controls - Collapsed by default, map already shows */}
        {!useRouteMode && (
          <details style={{ backgroundColor: 'rgba(15, 23, 42, 0.9)' }}>
            <summary style={{
              padding: '12px 20px',
              cursor: 'pointer',
              textAlign: 'center',
              color: '#06B6D4',
              fontSize: '14px',
              fontWeight: '500',
              borderBottom: '1px solid rgba(6, 182, 212, 0.1)',
              listStyle: 'none',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '8px',
              userSelect: 'none'
            }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(6, 182, 212, 0.05)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <span>📱</span>
              <span>Optional: Enable GPS Tracking & Alerts</span>
              <span style={{ fontSize: '12px', opacity: 0.7 }}>▼</span>
            </summary>
            <div style={{
              padding: '15px 20px',
              display: 'flex',
              gap: '10px',
              justifyContent: 'center',
              flexWrap: 'wrap',
              maxWidth: '800px',
              margin: '0 auto',
              borderBottom: '1px solid rgba(6, 182, 212, 0.05)'
            }}>
              <button
                onClick={getCurrentLocation}
                disabled={isTracking}
                style={{
                  padding: '10px 20px',
                  backgroundColor: isTracking ? '#555' : '#4CAF50',
                  color: '#FFF',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: isTracking ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                  transition: 'all 0.2s'
                }}
                onMouseOver={(e) => {
                  if (!isTracking) e.target.style.backgroundColor = '#45A049';
                }}
                onMouseOut={(e) => {
                  if (!isTracking) e.target.style.backgroundColor = '#4CAF50';
                }}
              >
                📍 Get My Location
              </button>

              <button
                onClick={toggleTracking}
                style={{
                  padding: '10px 20px',
                  backgroundColor: isTracking ? '#F44336' : '#2196F3',
                  color: '#FFF',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  transition: 'all 0.2s'
                }}
                onMouseOver={(e) => {
                  e.target.style.backgroundColor = isTracking ? '#D32F2F' : '#1976D2';
                }}
                onMouseOut={(e) => {
                  e.target.style.backgroundColor = isTracking ? '#F44336' : '#2196F3';
                }}
              >
                {isTracking ? '⏹ Stop Live Tracking' : '▶ Start Live Tracking'}
              </button>

              {/* Alert Settings Row */}
              <div style={{
                width: '100%',
                display: 'flex',
                gap: '15px',
                flexWrap: 'wrap',
                justifyContent: 'center',
                marginTop: '10px',
                paddingTop: '10px',
                borderTop: '1px solid rgba(6, 182, 212, 0.1)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <label style={{ fontSize: '13px', color: '#94A3B8' }}>Alert Radius:</label>
                  <select
                    value={alertRadius}
                    onChange={(e) => setAlertRadius(Number(e.target.value))}
                    style={{
                      padding: '6px 10px',
                      backgroundColor: '#333',
                      color: '#FFF',
                      border: '1px solid #555',
                      borderRadius: '4px',
                      fontSize: '13px',
                      cursor: 'pointer'
                    }}
                  >
                    <option value={100}>100m</option>
                    <option value={250}>250m</option>
                    <option value={500}>500m</option>
                    <option value={1000}>1km</option>
                    <option value={2000}>2km</option>
                  </select>
                </div>

                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '13px', color: '#E2E8F0' }}>
                  <input
                    type="checkbox"
                    checked={showAlertZones}
                    onChange={(e) => setShowAlertZones(e.target.checked)}
                    style={{ cursor: 'pointer' }}
                  />
                  <span>Alert Zones</span>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '13px', color: '#E2E8F0' }}>
                  <input
                    type="checkbox"
                    checked={soundEnabled}
                    onChange={(e) => setSoundEnabled(e.target.checked)}
                    style={{ cursor: 'pointer' }}
                  />
                  <span>{soundEnabled ? '🔊' : '🔇'} Sound</span>
                </label>
              </div>
            </div>
          </details>
        )}
      </div>
      {/* END FOOTER & CONTROLS SECTION */}

      {/* Global styles for Leaflet map */}
      <style jsx global>{`
        .leaflet-container {
          background: #1a2340 !important;
          font-family: inherit;
        }
        
        .leaflet-tile {
          filter: brightness(0.9) contrast(1.1);
        }
        
        .leaflet-popup-content-wrapper {
          background: rgba(15, 23, 42, 0.95);
          color: #E2E8F0;
          border-radius: 8px;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
        }
        
        .leaflet-popup-tip {
          background: rgba(15, 23, 42, 0.95);
        }
        
        .leaflet-popup-close-button {
          color: #94A3B8 !important;
        }
        
        .leaflet-popup-close-button:hover {
          color: #E2E8F0 !important;
        }
        
        .custom-pothole-icon {
          background: none;
          border: none;
        }
        
        .user-location-icon {
          background: none;
          border: none;
        }
        
        .pulse-anim {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
        
        .leaflet-control-zoom a {
          background-color: rgba(15, 23, 42, 0.9) !important;
          color: #06B6D4 !important;
          border: 1px solid rgba(6, 182, 212, 0.3) !important;
        }
        
        .leaflet-control-zoom a:hover {
          background-color: rgba(6, 182, 212, 0.2) !important;
          color: #60A5FA !important;
        }
        
        .leaflet-control-attribution {
          background: rgba(15, 23, 42, 0.8) !important;
          color: #94A3B8 !important;
          font-size: 10px !important;
        }
        
        .leaflet-control-attribution a {
          color: #06B6D4 !important;
        }
      `}</style>
    </div>
  )
}
