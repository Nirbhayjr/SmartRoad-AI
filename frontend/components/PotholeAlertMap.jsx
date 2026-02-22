'use client'

import dynamic from 'next/dynamic'
import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Dynamic import to avoid SSR issues
const MapContainer = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), { ssr: false })
const TileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false })
const Marker = dynamic(() => import('react-leaflet').then(mod => mod.Marker), { ssr: false })
const Popup = dynamic(() => import('react-leaflet').then(mod => mod.Popup), { ssr: false })
const Circle = dynamic(() => import('react-leaflet').then(mod => mod.Circle), { ssr: false })
const useMap = dynamic(() => import('react-leaflet').then(mod => mod.useMap), { ssr: false })

// Custom icons
const createIcon = (color) => {
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
 * PotholeAlertMap Component
 * Displays pothole alerts on an interactive Leaflet map with real-time location tracking
 */
export default function PotholeAlertMap({
  location,
  reports = [],
  alertRadius = 500,
  showAlertZones = true,
  onPotholeClick,
  isTracking = false
}) {
  const [mapReady, setMapReady] = useState(false)
  const mapRef = useRef(null)

  // Default location (center of map if no location provided)
  const defaultLocation = location || { lat: 37.7749, lng: -122.4194 }

  useEffect(() => {
    setMapReady(true)
  }, [])

  if (!mapReady) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-lg">
        <p className="text-gray-600">Loading map...</p>
      </div>
    )
  }

  return (
    <div className="w-full h-full rounded-lg shadow-lg border border-gray-200 overflow-hidden" style={{ minHeight: '500px' }}>
      <MapContainer
        center={[defaultLocation.lat, defaultLocation.lng]}
        zoom={15}
        style={{ height: '100%', width: '100%' }}
        ref={mapRef}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* User location marker */}
        {location && (
          <Marker position={[location.lat, location.lng]} icon={createIcon('#3B82F6')}>
            <Popup>
              <div className="text-center">
                <p className="font-semibold">Your Location</p>
                <p className="text-sm text-gray-600">{location.lat.toFixed(4)}, {location.lng.toFixed(4)}</p>
                {isTracking && <p className="text-sm text-green-600 font-medium">🟢 Tracking Active</p>}
              </div>
            </Popup>
          </Marker>
        )}

        {/* Alert radius circle */}
        {location && showAlertZones && (
          <Circle
            center={[location.lat, location.lng]}
            radius={alertRadius}
            pathOptions={{
              color: '#3B82F6',
              fillColor: '#3B82F6',
              fillOpacity: 0.1,
              weight: 2,
              dashArray: '5, 5'
            }}
          />
        )}

        {/* Pothole markers */}
        {reports.map((report, idx) => (
          <Marker
            key={idx}
            position={[report.latitude || report.lat, report.longitude || report.lng]}
            icon={createIcon('#EF4444')}
            eventHandlers={{
              click: () => onPotholeClick && onPotholeClick(report)
            }}
          >
            <Popup>
              <div className="text-center">
                <p className="font-semibold text-red-600">Pothole Alert</p>
                <p className="text-sm text-gray-600">Severity: {report.severity || 'Unknown'}</p>
                <p className="text-sm text-gray-500">{report.lat?.toFixed(4)}, {report.lng?.toFixed(4)}</p>
                {report.timestamp && <p className="text-xs text-gray-400">{new Date(report.timestamp).toLocaleString()}</p>}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Stats overlay */}
      <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg p-3 text-sm max-w-xs z-50 bg-opacity-95">
        <p className="font-semibold text-gray-800 mb-2">Status</p>
        <p className="text-gray-700">📍 Location: {location ? `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}` : 'Waiting for GPS...'}</p>
        <p className="text-gray-700">🚨 Potholes: {reports.length}</p>
        {showAlertZones && <p className="text-gray-700">⚠️ Alert Radius: {alertRadius}m</p>}
      </div>
    </div>
  )
}
