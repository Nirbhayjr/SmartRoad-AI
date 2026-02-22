"use client"

import { useEffect, useRef } from 'react'

export default function AdminMap({ reports }) {
  const mapRef = useRef(null)
  const markersRef = useRef([])

  // Load Leaflet CSS/JS from CDN
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!window.L) {
      const link = document.createElement('link')
      link.rel = 'stylesheet'
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
      document.head.appendChild(link)

      const script = document.createElement('script')
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
      script.async = true
      document.body.appendChild(script)
      script.onload = () => initMap()
    } else {
      initMap()
    }

    function initMap() {
      if (mapRef.current || !window.L) return
      const L = window.L
      mapRef.current = L.map('adminmap', { zoomControl: true }).setView([28, 79], 5)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(mapRef.current)
    }

    return () => {
      // don't destroy map between updates to preserve state
    }
  }, [])

  // Update markers when reports change
  useEffect(() => {
    if (!mapRef.current || !window.L) return
    const L = window.L

    // clear existing markers
    markersRef.current.forEach(m => m.remove())
    markersRef.current = []

    // Add new markers for reports with valid lat/lng
    reports && reports.forEach(r => {
      const lat = parseFloat(r.lat)
      const lng = parseFloat(r.lng)
      if (!isFinite(lat) || !isFinite(lng)) return

      let color = '#4ade80'
      if (r.severity && r.severity.Major > 0) color = '#f87171'
      else if (r.severity && r.severity.Moderate > 0) color = '#fbbf24'

      const marker = L.circleMarker([lat, lng], {
        radius: 8,
        color: '#111',
        weight: 1,
        fillColor: color,
        fillOpacity: 0.9
      }).addTo(mapRef.current)

      const popupHtml = `ID: ${r.id} <br/> ${r.type} · ${r.source} <br/> Severity: ${r.severity ? (r.severity.Major>0? 'Major': r.severity.Moderate>0? 'Moderate':'Minor') : 'Unknown'}`
      marker.bindPopup(popupHtml)
      markersRef.current.push(marker)
    })

  }, [reports])

  return (
    <div style={{ width: '100%', height: '600px' }}>
      <div id="adminmap" style={{ width: '100%', height: '100%' }} />
    </div>
  )
}
