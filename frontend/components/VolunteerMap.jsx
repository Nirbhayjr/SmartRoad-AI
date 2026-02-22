'use client'

import { useEffect, useRef } from 'react'

export default function VolunteerMap({ location }) {
  const mapContainer = useRef(null)
  const map = useRef(null)
  const marker = useRef(null)

  useEffect(() => {
    // Dynamically load Leaflet
    if (!window.L) {
      // Load Leaflet CSS
      const link = document.createElement('link')
      link.rel = 'stylesheet'
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
      document.head.appendChild(link)

      // Load Leaflet JS
      const script = document.createElement('script')
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
      script.onload = () => {
        initMap()
      }
      document.body.appendChild(script)
    } else {
      initMap()
    }
  }, [])

  useEffect(() => {
    // Update map when location changes
    if (map.current && window.L && location) {
      const L = window.L
      const newLocation = [location.lat, location.lon]
      
      // Set view to new location
      map.current.setView(newLocation, 15)
      
      // Remove old marker if exists
      if (marker.current) {
        map.current.removeLayer(marker.current)
      }
      
      // Add new marker
      marker.current = L.marker(newLocation, {
        title: 'Pothole Location',
      })
        .addTo(map.current)
        .bindPopup(`<b>Pothole Location</b><br>Lat: ${location.lat.toFixed(5)}<br>Lon: ${location.lon.toFixed(5)}`)
        .openPopup()
    }
  }, [location])

  const initMap = () => {
    if (!mapContainer.current || map.current) return

    const L = window.L
    const defaultLocation = [20.5937, 78.9629] // Default to India center

    map.current = L.map(mapContainer.current).setView(defaultLocation, 4)

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map.current)
  }

  return <div ref={mapContainer} style={{ width: '100%', height: '100%', minHeight: '160px' }} />
}
