"use client"

import { useEffect, useRef, useState } from "react";

// Color mapping for severity
const SEV_COLOR = { Minor: "#4ade80", Moderate: "#fbbf24", Major: "#f87171" };

export default function AdminLeafletMap({ reports }) {
  const [error, setError] = useState(null);
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const loadLeaflet = async () => {
      try {
        // inject CSS link if missing
        if (!document.querySelector('link[href*="leaflet"]')) {
          const link = document.createElement('link');
          link.rel = 'stylesheet';
          link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
          document.head.appendChild(link);
        }
      } catch (e) {
        // ignore CSS injection errors
      }

      try {
        if (!window.L) {
          await new Promise((res, rej) => {
            const script = document.createElement('script');
            script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
            script.onload = res;
            script.onerror = () => rej(new Error('Leaflet failed to load'));
            document.body.appendChild(script);
          });
        }

        const L = window.L;
        if (!mapRef.current && containerRef.current) {
            try {
              mapRef.current = L.map(containerRef.current).setView([22.0, 78.0], 5);
              L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap',
              }).addTo(mapRef.current);
              // ensure layout calculations run after mount
              setTimeout(() => {
                try {
                  mapRef.current.invalidateSize && mapRef.current.invalidateSize();
                } catch (e) {
                  console.warn('invalidateSize failed', e);
                }
              }, 200);
            } catch (err) {
              console.error('Leaflet init error', err);
              setError('Map initialization failed');
            }
        }
      } catch (err) {
        console.error('Failed to load Leaflet:', err);
        setError('Failed to load map resources');
      }
    };

    loadLeaflet();

    return () => {
      // remove markers safely first
      try {
        if (mapRef.current && Array.isArray(markersRef.current)) {
          markersRef.current.forEach((m) => {
            try { m && mapRef.current && mapRef.current.removeLayer && mapRef.current.removeLayer(m); } catch (e) { /* ignore */ }
          });
          markersRef.current = [];
        }
      } catch (e) {
        // ignore
      }

      if (mapRef.current) {
        try { mapRef.current.remove(); } catch (e) { /* ignore */ }
        mapRef.current = null;
      }
    };
  }, []);

  // update markers when reports change
  useEffect(() => {
    const L = typeof window !== "undefined" ? window.L : null;
    if (!L || !mapRef.current) return;

    // remove old markers (guard mapRef)
    try {
      if (mapRef.current && Array.isArray(markersRef.current)) {
        markersRef.current.forEach((m) => {
          try { m && mapRef.current.removeLayer && mapRef.current.removeLayer(m); } catch (e) { /* ignore */ }
        });
      }
    } catch (e) {
      // ignore
    }
    markersRef.current = [];

    (reports || []).forEach((r) => {
      try {
        const latRaw = r.lat ?? r.latitude ?? r.lat ?? null;
        const lngRaw = r.lng ?? r.longitude ?? r.lng ?? null;
        const lat = latRaw != null ? Number(latRaw) : NaN;
        const lng = lngRaw != null ? Number(lngRaw) : NaN;
        if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;

        const sev = (r.severity && (r.severity.Major > 0 ? 'Major' : r.severity.Moderate > 0 ? 'Moderate' : 'Minor')) || 'Minor';
        const color = SEV_COLOR[sev] || '#4ade80';

        const marker = L.circleMarker([lat, lng], {
          radius: 8,
          color: color,
          fillColor: color,
          fillOpacity: 0.85,
        }).addTo(mapRef.current);

        const popupHtml = `<div style="min-width:160px"><div style="font-weight:700;color:${color}">${r.id}</div><div style="margin-top:6px">${r.location || r.description || 'Location'}</div><div style="margin-top:8px;font-size:12px"><strong>Detections:</strong> ${r.detections ?? r.total_detections ?? '—'}</div></div>`;

        marker.bindPopup(popupHtml);
        markersRef.current.push(marker);
      } catch (markerErr) {
        console.warn('Skipping invalid report marker', r && r.id, markerErr);
      }
    });

    return () => {
      try {
        if (mapRef.current && Array.isArray(markersRef.current)) {
          markersRef.current.forEach((m) => {
            try { m && mapRef.current.removeLayer && mapRef.current.removeLayer(m); } catch (e) { /* ignore */ }
          });
        }
      } catch (e) {
        // ignore
      }
      markersRef.current = [];
    };
  }, [reports]);

  if (error) {
    return (
      <div style={{ width: '100%', height: 480, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#071025', color: '#f87171', borderRadius: 8 }}>
        <div>
          <div style={{ fontWeight: 700, marginBottom: 6 }}>Map unavailable</div>
          <div style={{ fontSize: 13, color: '#fca5a5' }}>{error}</div>
        </div>
      </div>
    );
  }

  return <div ref={containerRef} style={{ width: '100%', height: '100%', minHeight: 480 }} />;
}
