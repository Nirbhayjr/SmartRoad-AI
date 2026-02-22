'use client'

import dynamic from 'next/dynamic'
import { useEffect, useState, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Dynamic imports to avoid SSR issues
const MapContainer = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), { ssr: false })
const TileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false })
const Marker = dynamic(() => import('react-leaflet').then(mod => mod.Marker), { ssr: false })
const Popup = dynamic(() => import('react-leaflet').then(mod => mod.Popup), { ssr: false })

// Custom icons
const createIcon = (color, label) => {
  return L.icon({
    iconUrl: `data:image/svg+xml;base64,${btoa(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${color}" width="32" height="32">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
      </svg>
    `)}`,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
  })
}

/**
 * RouteMap Component
 * Displays route planning and navigation with pothole avoidance
 */
export default function RouteMap({
  location,
  startLocation,
  endLocation,
  reports = [],
  stats = {},
  showRouteModal = false,
  onRouteClick
}) {
  const [mapReady, setMapReady] = useState(false)
  const [routeCoords, setRouteCoords] = useState([])
  const [map, setMap] = useState(null)
  const routeLineRef = useRef(null)

  // Default location for map center
  const defaultLocation = location || { lat: 37.7749, lng: -122.4194 }

  useEffect(() => {
    setMapReady(true)
  }, [])

  // Mock route generation between start and end points
  useEffect(() => {
    if (startLocation && endLocation) {
      // Simple direct route - in production, use OSRM or Google Maps API
      const mockRoute = [
        [startLocation.lat, startLocation.lng],
        [(startLocation.lat + endLocation.lat) / 2, (startLocation.lng + endLocation.lng) / 2],
        [endLocation.lat, endLocation.lng]
      ]
      setRouteCoords(mockRoute)
    }
  }, [startLocation, endLocation])

  // Draw route line directly on map using Leaflet API
  useEffect(() => {
    if (map && routeCoords && routeCoords.length > 0) {
      try {
        // Remove old route line if exists
        if (routeLineRef.current) {
          map.removeLayer(routeLineRef.current)
        }

        // Create and add new polyline
        const polyline = L.polyline(routeCoords, {
          color: '#3B82F6',
          weight: 4,
          opacity: 0.8,
          lineCap: 'round',
          lineJoin: 'round'
        }).addTo(map)

        routeLineRef.current = polyline

        // Fit bounds to route
        const bounds = L.latLngBounds(routeCoords)
        map.fitBounds(bounds, { padding: [50, 50] })

        // Trigger map resize
        setTimeout(() => {
          map.invalidateSize && map.invalidateSize()
        }, 200)
      } catch (err) {
        console.error('Error drawing route:', err)
      }
    }
  }, [map, routeCoords])

  // Cleanup polyline on unmount
  useEffect(() => {
    return () => {
      if (map && routeLineRef.current) {
        try {
          map.removeLayer(routeLineRef.current)
        } catch (e) {}
      }
    }
  }, [map])

  if (!mapReady) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-lg">
        <p className="text-gray-600">Loading map...</p>
      </div>
    )
  }

  return (
    <div className="relative w-full h-full rounded-lg shadow-lg border border-gray-200 overflow-hidden" style={{ minHeight: '500px' }}>
      <MapContainer
        center={[defaultLocation.lat, defaultLocation.lng]}
        zoom={14}
        whenCreated={(m) => setMap(m)}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Start location marker */}
        {startLocation && (
          <Marker position={[startLocation.lat, startLocation.lng]} icon={createIcon('#22C55E', 'S')}>
            <Popup>
              <div className="text-center">
                <p className="font-semibold text-green-600">Start Point</p>
                <p className="text-sm text-gray-600">{startLocation.lat?.toFixed(4)}, {startLocation.lng?.toFixed(4)}</p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* End location marker */}
        {endLocation && (
          <Marker position={[endLocation.lat, endLocation.lng]} icon={createIcon('#EF4444', 'E')}>
            <Popup>
              <div className="text-center">
                <p className="font-semibold text-red-600">End Point</p>
                <p className="text-sm text-gray-600">{endLocation.lat?.toFixed(4)}, {endLocation.lng?.toFixed(4)}</p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Current location marker */}
        {location && (
          <Marker position={[location.lat, location.lng]} icon={createIcon('#3B82F6', 'Y')}>
            <Popup>
              <div className="text-center">
                <p className="font-semibold text-blue-600">Current Location</p>
                <p className="text-sm text-gray-600">{location.lat?.toFixed(4)}, {location.lng?.toFixed(4)}</p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Pothole markers along route */}
        {reports.map((report, idx) => (
          <Marker
            key={idx}
            position={[report.latitude || report.lat, report.longitude || report.lng]}
            icon={L.icon({
              iconUrl: `data:image/svg+xml;base64,${btoa(`
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#DC2626" width="24" height="24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
                </svg>
              `)}`,
              iconSize: [24, 24],
              iconAnchor: [12, 24],
              popupAnchor: [0, -24]
            })}
          >
            <Popup>
              <div className="text-center">
                <p className="font-semibold text-red-600">⚠️ Pothole</p>
                <p className="text-sm text-gray-600">Severity: {report.severity || 'Unknown'}</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Stats overlay */}
      <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg p-4 text-sm max-w-xs z-50 bg-opacity-95 border border-gray-200">
        <p className="font-semibold text-gray-800 mb-3">Route Analysis</p>
        <div className="space-y-2 text-gray-700">
          <div className="flex justify-between">
            <span>📏 Distance:</span>
            <span className="font-medium">{(stats.totalDistance || 0).toFixed(2)} km</span>
          </div>
          <div className="flex justify-between">
            <span>🚨 Potholes:</span>
            <span className="font-medium text-red-600">{stats.potholesPassed || 0}</span>
          </div>
          <div className="flex justify-between">
            <span>🔔 Alerts:</span>
            <span className="font-medium text-orange-600">{stats.alertsShown || 0}</span>
          </div>
        </div>
        {startLocation && endLocation && (
          <div className="mt-3 pt-3 border-t border-gray-200 text-xs text-gray-600">
            <p>✅ Route planned</p>
            <p>⚠️ {reports.length} hazards detected</p>
          </div>
        )}
      </div>
    </div>
  )
}
