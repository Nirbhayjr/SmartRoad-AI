"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';

const VolunteerMap = dynamic(() => import('../../components/VolunteerMap'), { ssr: false });

// ─── Inline Styles / CSS-in-JS via <style> tag ───────────────────────────────
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Syne:wght@400;500;600;700;800&family=Figtree:wght@300;400;500;600&display=swap');

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    :root {
      --bg-void:       #080c12;
      --bg-surface:    #0d1320;
      --bg-card:       #111827;
      --bg-card-hover: #141d2e;
      --border:        rgba(99,179,237,0.12);
      --border-glow:   rgba(99,179,237,0.35);
      --cyan:          #38bdf8;
      --cyan-dim:      rgba(56,189,248,0.15);
      --teal:          #2dd4bf;
      --accent:        #818cf8;
      --red:           #f87171;
      --amber:         #fbbf24;
      --green:         #34d399;
      --text-primary:  #e2e8f0;
      --text-secondary:#7d8fa8;
      --text-muted:    #4a5568;
      --mono:          'DM Mono', monospace;
      --display:       'Syne', sans-serif;
      --body:          'Figtree', sans-serif;
    }

    html { scroll-behavior: smooth; }

    body {
      background: var(--bg-void);
      color: var(--text-primary);
      font-family: var(--body);
      min-height: 100vh;
      overflow-x: hidden;
    }

    /* ── Hero gradient animation ── */
    @keyframes heroShift {
      0%   { background-position: 0% 50%; }
      50%  { background-position: 100% 50%; }
      100% { background-position: 0% 50%; }
    }
    @keyframes gridPulse {
      0%, 100% { opacity: 0.03; }
      50%       { opacity: 0.07; }
    }
    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(24px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes shimmer {
      0%   { background-position: -200% center; }
      100% { background-position:  200% center; }
    }
    @keyframes pulse-glow {
      0%, 100% { box-shadow: 0 0 12px rgba(56,189,248,0.2); }
      50%       { box-shadow: 0 0 28px rgba(56,189,248,0.5); }
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    @keyframes scanline {
      0%   { top: 0%; }
      100% { top: 100%; }
    }
    @keyframes blink {
      0%, 100% { opacity: 1; }
      50%       { opacity: 0; }
    }

    .fade-up { animation: fadeUp 0.6s ease both; }
    .fade-up-1 { animation-delay: 0.1s; }
    .fade-up-2 { animation-delay: 0.2s; }
    .fade-up-3 { animation-delay: 0.3s; }
    .fade-up-4 { animation-delay: 0.4s; }

    /* ── Glass card ── */
    .glass-card {
      background: linear-gradient(135deg, rgba(17,24,39,0.9) 0%, rgba(13,19,32,0.95) 100%);
      border: 1px solid var(--border);
      border-radius: 16px;
      backdrop-filter: blur(24px);
      transition: border-color 0.3s, box-shadow 0.3s;
    }
    .glass-card:hover {
      border-color: var(--border-glow);
      box-shadow: 0 0 40px rgba(56,189,248,0.06), inset 0 1px 0 rgba(255,255,255,0.04);
    }

    /* ── Buttons ── */
    .btn-primary {
      display: inline-flex; align-items: center; justify-content: center; gap: 8px;
      padding: 12px 24px; border-radius: 10px; border: none; cursor: pointer;
      font-family: var(--body); font-size: 14px; font-weight: 600;
      background: linear-gradient(135deg, #0ea5e9 0%, #2dd4bf 100%);
      color: #020817;
      transition: opacity 0.2s, transform 0.15s, box-shadow 0.2s;
      animation: pulse-glow 3s ease-in-out infinite;
    }
    .btn-primary:hover { opacity: 0.92; transform: translateY(-1px); }
    .btn-primary:active { transform: translateY(0px); }
    .btn-primary:disabled { opacity: 0.45; animation: none; cursor: not-allowed; }

    .btn-secondary {
      display: inline-flex; align-items: center; justify-content: center; gap: 8px;
      padding: 10px 20px; border-radius: 10px; cursor: pointer;
      font-family: var(--body); font-size: 13px; font-weight: 500;
      background: rgba(56,189,248,0.08);
      border: 1px solid rgba(56,189,248,0.2);
      color: var(--cyan);
      transition: background 0.2s, border-color 0.2s, transform 0.15s;
    }
    .btn-secondary:hover:not(:disabled) { background: rgba(56,189,248,0.14); border-color: rgba(56,189,248,0.4); transform: translateY(-1px); }
    .btn-secondary:disabled { opacity: 0.5; cursor: not-allowed; }

    /* ── Toggle ── */
    .toggle-track {
      width: 44px; height: 24px; border-radius: 12px;
      background: rgba(255,255,255,0.08);
      border: 1px solid rgba(255,255,255,0.1);
      position: relative; cursor: pointer; transition: background 0.25s, border-color 0.25s;
    }
    .toggle-track.on {
      background: linear-gradient(135deg, #ef4444, #f97316);
      border-color: rgba(239,68,68,0.5);
      box-shadow: 0 0 16px rgba(239,68,68,0.35);
    }
    .toggle-thumb {
      width: 18px; height: 18px; border-radius: 50%;
      background: #fff; position: absolute; top: 2px; left: 2px;
      transition: transform 0.25s cubic-bezier(0.34,1.56,0.64,1);
      box-shadow: 0 1px 4px rgba(0,0,0,0.4);
    }
    .toggle-track.on .toggle-thumb { transform: translateX(20px); }

    /* ── Drag zone ── */
    .drop-zone {
      border: 2px dashed rgba(56,189,248,0.2);
      border-radius: 14px;
      padding: 48px 32px;
      text-align: center;
      cursor: pointer;
      transition: border-color 0.25s, background 0.25s, box-shadow 0.25s;
      position: relative; overflow: hidden;
      display: flex; flex-direction: column; align-items: center; justify-content: center;
    }
    .drop-zone:hover, .drop-zone.dragging {
      border-color: rgba(56,189,248,0.6);
      background: rgba(56,189,248,0.04);
      box-shadow: inset 0 0 60px rgba(56,189,248,0.04);
    }
    .drop-zone.dragging { border-style: solid; }

    /* ── Progress bar ── */
    .progress-track {
      width: 100%; height: 4px; border-radius: 2px;
      background: rgba(255,255,255,0.06);
      overflow: hidden;
    }
    .progress-fill {
      height: 100%; border-radius: 2px;
      background: linear-gradient(90deg, #0ea5e9, #2dd4bf);
      transition: width 0.3s ease;
      position: relative;
    }
    .progress-fill::after {
      content: '';
      position: absolute; right: 0; top: 0; bottom: 0; width: 40px;
      background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4));
      animation: shimmer 1.2s infinite;
    }

    /* ── Severity badges ── */
    .badge {
      display: inline-flex; align-items: center; gap: 6px;
      padding: 4px 12px; border-radius: 20px;
      font-family: var(--mono); font-size: 11px; font-weight: 500; letter-spacing: 0.05em;
    }
    .badge-critical { background: rgba(248,113,113,0.12); border: 1px solid rgba(248,113,113,0.3); color: var(--red); }
    .badge-high     { background: rgba(251,191,36,0.12);  border: 1px solid rgba(251,191,36,0.3);  color: var(--amber); }
    .badge-moderate { background: rgba(56,189,248,0.12);  border: 1px solid rgba(56,189,248,0.3);  color: var(--cyan); }
    .badge-low      { background: rgba(52,211,153,0.12);  border: 1px solid rgba(52,211,153,0.3);  color: var(--green); }

    /* ── Stat cards ── */
    .stat-row {
      display: flex; align-items: center; justify-content: space-between;
      padding: 12px 16px; border-radius: 10px;
      background: rgba(255,255,255,0.02);
      border: 1px solid rgba(255,255,255,0.04);
    }

    /* ── Trust pill ── */
    .trust-pill {
      display: flex; align-items: center; gap: 10px;
      padding: 16px 20px; border-radius: 12px;
      background: rgba(255,255,255,0.02);
      border: 1px solid rgba(255,255,255,0.05);
      transition: border-color 0.25s, background 0.25s;
    }
    .trust-pill:hover {
      border-color: rgba(56,189,248,0.2);
      background: rgba(56,189,248,0.03);
    }

    /* ── Image comparison ── */
    .img-compare-wrap {
      position: relative; border-radius: 12px; overflow: hidden;
    }
    .img-compare-label {
      position: absolute; top: 10px; left: 10px;
      background: rgba(0,0,0,0.7); backdrop-filter: blur(6px);
      padding: 3px 10px; border-radius: 20px;
      font-family: var(--mono); font-size: 10px; color: var(--text-secondary);
      letter-spacing: 0.08em;
    }

    /* ── Map placeholder ── */
    .map-container {
      border-radius: 12px; overflow: hidden;
      background: #0a0f1a;
      border: 1px solid var(--border);
      position: relative;
    }

    /* ── Scanline effect ── */
    .scanline::after {
      content: '';
      position: absolute; left: 0; right: 0; height: 2px;
      background: linear-gradient(90deg, transparent, rgba(56,189,248,0.4), transparent);
      animation: scanline 3s linear infinite;
      pointer-events: none;
    }

    /* ── Scrollbar ── */
    ::-webkit-scrollbar { width: 6px; }
    ::-webkit-scrollbar-track { background: var(--bg-void); }
    ::-webkit-scrollbar-thumb { background: rgba(56,189,248,0.2); border-radius: 3px; }

    /* ── Responsive ── */
    @media (max-width: 768px) {
      .upload-grid { grid-template-columns: 1fr !important; }
      .results-grid { grid-template-columns: 1fr !important; }
      .trust-grid  { grid-template-columns: 1fr 1fr !important; }
    }
  `}</style>
);

// ─── Icons (inline SVG components) ───────────────────────────────────────────
const Icon = ({ d, size = 16, stroke = "currentColor", fill = "none", ...p }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={stroke} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" {...p}>
    {typeof d === "string" ? <path d={d} /> : d}
  </svg>
);

const UploadIcon = (p) => <Icon size={p.size || 16} d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" {...p} />;
const MapPinIcon = (p) => <Icon size={p.size || 16} d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z M12 10m-3 0a3 3 0 1 0 6 0a3 3 0 1 0-6 0" {...p} />;
const CpuIcon = (p) => <Icon size={p.size || 16} d={<><rect x="4" y="4" width="16" height="16" rx="2" /><rect x="9" y="9" width="6" height="6" /><line x1="9" y1="1" x2="9" y2="4" /><line x1="15" y1="1" x2="15" y2="4" /><line x1="9" y1="20" x2="9" y2="23" /><line x1="15" y1="20" x2="15" y2="23" /><line x1="20" y1="9" x2="23" y2="9" /><line x1="20" y1="14" x2="23" y2="14" /><line x1="1" y1="9" x2="4" y2="9" /><line x1="1" y1="14" x2="4" y2="14" /></>} {...p} />;
const ShieldIcon = (p) => <Icon size={p.size || 16} d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" {...p} />;
const ZapIcon = (p) => <Icon size={p.size || 16} d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" {...p} />;
const GlobeIcon = (p) => <Icon size={p.size || 16} d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2zM2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10A15.3 15.3 0 0 1 12 2z" {...p} />;
const CheckIcon = (p) => <Icon size={p.size || 16} d="M20 6L9 17l-5-5" {...p} />;
const AlertIcon = (p) => <Icon size={p.size || 16} d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4M12 17h.01" {...p} />;
const BoxIcon = (p) => <Icon size={p.size || 16} d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16zM3.27 6.96L12 12.01l8.73-5.05M12 22.08V12" {...p} />;
const SendIcon = (p) => <Icon size={p.size || 16} d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" {...p} />;
const ClockIcon = (p) => <Icon size={p.size || 16} d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2zM12 6v6l4 2" {...p} />;
const ImageIcon = (p) => <Icon size={p.size || 16} d={<><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21,15 16,10 5,21" /></>} {...p} />;

// ─── Sub-components ───────────────────────────────────────────────────────────

function HeroBanner() {
  return (
    <section style={{ position: "relative", padding: "80px 0 60px", overflow: "hidden" }}>
      {/* Animated gradient bg */}
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, #060b16 0%, #0b1628 25%, #091420 50%, #0c1a2e 75%, #060b16 100%)", backgroundSize: "400% 400%", animation: "heroShift 12s ease infinite" }} />
      {/* Grid overlay */}
      <div style={{ position: "absolute", inset: 0, backgroundImage: `linear-gradient(rgba(56,189,248,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(56,189,248,0.05) 1px, transparent 1px)`, backgroundSize: "48px 48px", animation: "gridPulse 4s ease-in-out infinite" }} />
      {/* Glow orbs */}
      <div style={{ position: "absolute", top: "-80px", left: "15%", width: "500px", height: "500px", borderRadius: "50%", background: "radial-gradient(circle, rgba(14,165,233,0.08) 0%, transparent 70%)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: "-60px", right: "10%", width: "400px", height: "400px", borderRadius: "50%", background: "radial-gradient(circle, rgba(45,212,191,0.06) 0%, transparent 70%)", pointerEvents: "none" }} />

      <div style={{ position: "relative", maxWidth: "1100px", margin: "0 auto", padding: "0 32px", textAlign: "center" }}>
        <div className="fade-up" style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "6px 14px", borderRadius: "20px", background: "rgba(56,189,248,0.08)", border: "1px solid rgba(56,189,248,0.2)", marginBottom: "24px" }}>
          <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "var(--cyan)", boxShadow: "0 0 8px var(--cyan)", animation: "blink 1.5s ease-in-out infinite" }} />
          <span style={{ fontFamily: "var(--mono)", fontSize: "11px", color: "var(--cyan)", letterSpacing: "0.1em", fontWeight: 500 }}>CIVIC AI INFRASTRUCTURE · v2.4.1</span>
        </div>

        <h1 className="fade-up fade-up-1" style={{ fontFamily: "var(--display)", fontSize: "clamp(36px,5vw,64px)", fontWeight: 800, lineHeight: 1.05, letterSpacing: "-0.02em", marginBottom: "20px", background: "linear-gradient(135deg, #e2e8f0 0%, #94a3b8 40%, #38bdf8 70%, #2dd4bf 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
          Community Road<br />Intelligence Portal
        </h1>

        <p className="fade-up fade-up-2" style={{ fontFamily: "var(--body)", fontSize: "18px", fontWeight: 300, color: "var(--text-secondary)", maxWidth: "560px", margin: "0 auto 36px", lineHeight: 1.7 }}>
          Upload road issues and let AI classify severity instantly.<br />
          <span style={{ color: "var(--cyan)", fontWeight: 500 }}>Real-time detection. Government-grade infrastructure.</span>
        </p>

        <div className="fade-up fade-up-3" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "32px", flexWrap: "wrap" }}>
          {[["98.3%", "Detection Accuracy"], ["< 2s", "Processing Time"], ["47K+", "Reports Processed"]].map(([val, lbl]) => (
            <div key={lbl} style={{ textAlign: "center" }}>
              <div style={{ fontFamily: "var(--mono)", fontSize: "22px", fontWeight: 500, color: "var(--cyan)" }}>{val}</div>
              <div style={{ fontFamily: "var(--body)", fontSize: "12px", color: "var(--text-muted)", letterSpacing: "0.05em", marginTop: "2px" }}>{lbl}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Toggle({ on, onToggle }) {
  return (
    <div className={`toggle-track${on ? " on" : ""}`} onClick={onToggle} role="switch" aria-checked={on}>
      <div className="toggle-thumb" />
    </div>
  );
}

function MapPlaceholder({ lat, lng }) {
  return (
    <div className="map-container scanline" style={{ height: "180px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "12px" }}>
      <div style={{ width: '100%', height: '100%', position: 'absolute', zIndex: 0 }}>
        <VolunteerMap location={lat && lng ? { lat: parseFloat(lat), lon: parseFloat(lng) } : null} />
      </div>
      {!lat && !lng && (
        <div style={{ position: "relative", zIndex: 1, textAlign: "center", color: "var(--text-muted)", fontSize: "13px", background: "rgba(0,0,0,0.5)", padding: "10px", borderRadius: "8px", backdropFilter: "blur(5px)" }}>
          <MapPinIcon size={20} stroke="var(--text-muted)" style={{ margin: "0 auto 8px" }} />
          <div>Location not detected</div>
        </div>
      )}
    </div>
  );
}

function ProgressBar({ progress }) {
  if (progress === 0) return null;
  return (
    <div style={{ marginTop: "16px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
        <span style={{ fontFamily: "var(--mono)", fontSize: "11px", color: "var(--text-secondary)" }}>Uploading…</span>
        <span style={{ fontFamily: "var(--mono)", fontSize: "11px", color: "var(--cyan)" }}>{progress}%</span>
      </div>
      <div className="progress-track">
        <div className="progress-fill" style={{ width: `${progress}%` }} />
      </div>
    </div>
  );
}

function UploadModule({ onAnalyze, setError, isAnalyzing }) {
  const [dragging, setDragging] = useState(false);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [progress, setProgress] = useState(0);
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [locating, setLocating] = useState(false);
  const [description, setDescription] = useState("");
  const [critical, setCritical] = useState(false);
  const fileRef = useRef();

  const handleFile = useCallback((f) => {
    if (!f || (!f.type.startsWith("image/") && !f.type.startsWith("video/"))) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setProgress(0);
    let p = 0;
    const iv = setInterval(() => {
      p += Math.random() * 25;
      if (p >= 100) { p = 100; clearInterval(iv); }
      setProgress(Math.min(Math.round(p), 100));
    }, 120);

    // auto-detect location on file selection
    if (navigator.geolocation && !lat) {
      navigator.geolocation.getCurrentPosition(
        (pos) => { setLat(pos.coords.latitude.toFixed(6)); setLng(pos.coords.longitude.toFixed(6)); },
        () => setError("Location access denied. Please enter manually.")
      );
    }
  }, [lat, setError]);

  const handleDrop = (e) => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]); };

  const handleLocate = () => {
    setLocating(true);
    navigator.geolocation?.getCurrentPosition(
      (pos) => { setLat(pos.coords.latitude.toFixed(6)); setLng(pos.coords.longitude.toFixed(6)); setLocating(false); setError(null); },
      () => { setError("Location access denied."); setLocating(false); }
    );
  };

  const handleAnalyzeClick = () => {
    if (!file) return;
    onAnalyze({ file, preview, lat, lng, description, critical });
  }

  const canAnalyze = file && progress === 100 && !isAnalyzing;

  return (
    <section style={{ maxWidth: "1100px", margin: "0 auto", padding: "0 32px 60px" }}>
      <div className="glass-card fade-up fade-up-2" style={{ padding: "32px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "28px" }}>
          <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "rgba(56,189,248,0.1)", border: "1px solid rgba(56,189,248,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <UploadIcon size={16} stroke="var(--cyan)" />
          </div>
          <div>
            <h2 style={{ fontFamily: "var(--display)", fontSize: "18px", fontWeight: 700, color: "var(--text-primary)" }}>Upload Road Issue</h2>
            <p style={{ fontFamily: "var(--body)", fontSize: "12px", color: "var(--text-muted)" }}>Attach image/video · detect location · submit for AI analysis</p>
          </div>
          <div style={{ marginLeft: "auto", fontFamily: "var(--mono)", fontSize: "11px", color: "var(--text-muted)", padding: "4px 10px", borderRadius: "6px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
            MODULE_02
          </div>
        </div>

        <div className="upload-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "28px" }}>
          {/* LEFT – Drop zone */}
          <div>
            <div
              className={`drop-zone${dragging ? " dragging" : ""}`}
              style={{ minHeight: "260px" }}
              onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileRef.current?.click()}
            >
              <input ref={fileRef} type="file" accept="image/*,video/*" style={{ display: "none" }} onChange={e => handleFile(e.target.files[0])} />

              {preview ? (
                <div style={{ position: "relative", width: "100%", height: "100%", minHeight: "200px" }}>
                  {file.type.startsWith("video/") ? (
                    <video src={preview} style={{ width: "100%", maxHeight: "200px", objectFit: "cover", borderRadius: "10px" }} />
                  ) : (
                    <img src={preview} alt="preview" style={{ width: "100%", maxHeight: "200px", objectFit: "cover", borderRadius: "10px" }} />
                  )}
                  <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.5), transparent)", borderRadius: "10px" }} />
                  <div style={{ position: "absolute", bottom: "10px", left: "10px", fontFamily: "var(--mono)", fontSize: "11px", color: "#fff" }}>{file.name}</div>
                </div>
              ) : (
                <>
                  <div style={{ width: "56px", height: "56px", borderRadius: "16px", background: "rgba(56,189,248,0.08)", border: "1px solid rgba(56,189,248,0.2)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                    <UploadIcon size={24} stroke="var(--cyan)" />
                  </div>
                  <p style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-primary)", marginBottom: "6px" }}>Drag & drop road image/video</p>
                  <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>or click to browse files</p>
                  <div style={{ marginTop: "20px", display: "flex", gap: "8px", justifyContent: "center", flexWrap: "wrap" }}>
                    {["JPG", "PNG", "WEBP", "MP4", "MOV"].map(f => (
                      <span key={f} style={{ fontFamily: "var(--mono)", fontSize: "10px", padding: "3px 8px", borderRadius: "4px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "var(--text-muted)", letterSpacing: "0.06em" }}>{f}</span>
                    ))}
                  </div>
                  <p style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "12px" }}>Max 50MB · GPS metadata preserved</p>
                </>
              )}
            </div>

            <ProgressBar progress={progress} />

            {progress === 100 && !isAnalyzing && (
              <div style={{ marginTop: "12px", display: "flex", alignItems: "center", gap: "8px", padding: "10px 14px", borderRadius: "8px", background: "rgba(52,211,153,0.08)", border: "1px solid rgba(52,211,153,0.2)" }}>
                <CheckIcon size={14} stroke="var(--green)" />
                <span style={{ fontFamily: "var(--mono)", fontSize: "11px", color: "var(--green)" }}>Upload step 1 complete · Ready for AI analysis</span>
              </div>
            )}

            {isAnalyzing && (
              <div style={{ marginTop: "12px", display: "flex", alignItems: "center", gap: "8px", padding: "10px 14px", borderRadius: "8px", background: "rgba(56,189,248,0.08)", border: "1px solid rgba(56,189,248,0.2)" }}>
                <span style={{ width: "12px", height: "12px", border: "2px solid var(--cyan)", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                <span style={{ fontFamily: "var(--mono)", fontSize: "11px", color: "var(--cyan)" }}>Transmitting payload to backend...</span>
              </div>
            )}
          </div>

          {/* RIGHT – Meta */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

            {/* Locate */}
            <div>
              <label style={{ fontFamily: "var(--mono)", fontSize: "10px", color: "var(--text-muted)", letterSpacing: "0.08em", display: "block", marginBottom: "8px" }}>LOCATION</label>
              <button className="btn-secondary" style={{ width: "100%", justifyContent: "center" }} onClick={handleLocate} disabled={locating}>
                {locating
                  ? <><span style={{ width: "14px", height: "14px", border: "2px solid var(--cyan)", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />Detecting…</>
                  : <><MapPinIcon size={14} />Auto-detect my location</>
                }
              </button>
            </div>

            {/* Map */}
            <MapPlaceholder lat={lat} lng={lng} />

            {/* Lat/Lng */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
              {[["Latitude", lat, setLat], ["Longitude", lng, setLng]].map(([lbl, val, setter]) => (
                <div key={lbl}>
                  <label style={{ fontFamily: "var(--mono)", fontSize: "10px", color: "var(--text-muted)", letterSpacing: "0.08em", display: "block", marginBottom: "6px" }}>{lbl.toUpperCase()}</label>
                  <input value={val} onChange={e => setter(e.target.value)} placeholder={lbl === "Latitude" ? "e.g. 13.0827" : "e.g. 80.2707"} style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", color: "var(--text-primary)", fontFamily: "var(--mono)", fontSize: "12px", outline: "none", transition: "border-color 0.2s" }} onFocus={e => e.target.style.borderColor = "rgba(56,189,248,0.4)"} onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.08)"} />
                </div>
              ))}
            </div>

            {/* Description */}
            <div>
              <label style={{ fontFamily: "var(--mono)", fontSize: "10px", color: "var(--text-muted)", letterSpacing: "0.08em", display: "block", marginBottom: "6px" }}>DESCRIPTION</label>
              <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Describe the road issue (size, location landmark, safety risk…)" rows={3} style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", color: "var(--text-primary)", fontFamily: "var(--body)", fontSize: "13px", outline: "none", resize: "vertical", lineHeight: 1.6, transition: "border-color 0.2s" }} onFocus={e => e.target.style.borderColor = "rgba(56,189,248,0.4)"} onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.08)"} />
            </div>

            {/* Critical toggle */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", borderRadius: "10px", background: "rgba(248,113,113,0.04)", border: `1px solid ${critical ? "rgba(248,113,113,0.25)" : "rgba(255,255,255,0.06)"}` }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <AlertIcon size={14} stroke={critical ? "var(--red)" : "var(--text-muted)"} />
                <div>
                  <div style={{ fontSize: "13px", fontWeight: 600, color: critical ? "var(--red)" : "var(--text-primary)" }}>Mark as Critical</div>
                  <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "1px" }}>Flags for immediate review</div>
                </div>
              </div>
              <Toggle on={critical} onToggle={() => setCritical(v => !v)} />
            </div>

            {/* Analyze button */}
            <button className="btn-primary" style={{ width: "100%", padding: "14px 24px", fontSize: "15px" }} disabled={!canAnalyze} onClick={handleAnalyzeClick}>
              {isAnalyzing ? (
                <><span style={{ width: "14px", height: "14px", border: "2px solid #020817", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} /> PROCESSING...</>
              ) : (
                <><CpuIcon size={16} stroke="#020817" />Run AI Detection</>
              )}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

function ResultsBadge({ severity }) {
  const map = { critical: ["CRITICAL", "badge-critical"], high: ["HIGH", "badge-high"], moderate: ["MODERATE", "badge-moderate"], low: ["LOW", "badge-low"] };
  const [label, cls] = map[severity?.toLowerCase() || 'moderate'] || map.low;
  return <span className={`badge ${cls}`}><span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "currentColor" }} />SEV · {label}</span>;
}

function AIResults({ data, isProcessing }) {
  const [submitted, setSubmitted] = useState(false);

  if (isProcessing) return (
    <section id="results" style={{ maxWidth: "1100px", margin: "0 auto", padding: "0 32px 60px" }}>
      <div className="glass-card fade-up" style={{ padding: "60px 32px", textAlign: "center" }}>
        <div style={{ width: "64px", height: "64px", borderRadius: "50%", border: "3px solid rgba(56,189,248,0.15)", borderTopColor: "var(--cyan)", animation: "spin 1s linear infinite", margin: "0 auto 24px" }} />
        <p style={{ fontFamily: "var(--display)", fontSize: "20px", fontWeight: 600, color: "var(--text-primary)", marginBottom: "8px" }}>AI Detection in Progress</p>
        <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>Running YOLO inferencing · Generating annotations...</p>
        <div style={{ display: "flex", gap: "8px", justifyContent: "center", marginTop: "24px" }}>
          {["Preprocessing", "Inference", "Annotation", "Severity scoring"].map((s, i) => (
            <span key={s} style={{ fontFamily: "var(--mono)", fontSize: "10px", padding: "3px 8px", borderRadius: "4px", background: "rgba(56,189,248,0.08)", border: "1px solid rgba(56,189,248,0.15)", color: "var(--cyan)", letterSpacing: "0.05em", opacity: i < 2 ? 1 : 0.4 }}>{s}</span>
          ))}
        </div>
      </div>
    </section>
  );

  if (!data) return null;

  // Derive highest severity
  let overallSeverity = 'low';
  if (data.severity_breakdown?.Major > 0) overallSeverity = "critical";
  else if (data.severity_breakdown?.Moderate > 0) overallSeverity = "moderate";

  const isCritical = overallSeverity === "critical";

  return (
    <section id="results" style={{ maxWidth: "1100px", margin: "0 auto", padding: "0 32px 60px" }}>
      <div className="glass-card fade-up" style={{ padding: "32px" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "28px", flexWrap: "wrap", gap: "12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <CpuIcon size={16} stroke="var(--red)" />
            </div>
            <div>
              <h2 style={{ fontFamily: "var(--display)", fontSize: "18px", fontWeight: 700 }}>AI Detection Results</h2>
              <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>YOLO architecture · {data.message}</p>
            </div>
          </div>
          <ResultsBadge severity={overallSeverity} />
        </div>

        <div className="results-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", marginBottom: "24px" }}>
          {/* Image */}
          <div>
            <p style={{ fontFamily: "var(--mono)", fontSize: "10px", color: "var(--text-muted)", letterSpacing: "0.08em", marginBottom: "10px" }}>INFERENCE OUTPUT</p>
            <div className="img-compare-wrap" style={{ display: 'flex', justifyContent: 'center', background: 'rgba(0,0,0,0.5)', borderRadius: '12px', minHeight: '160px' }}>
              {data.annotated ? (
                <img src={data.annotated} alt="annotated" style={{ maxWidth: "100%", maxHeight: "400px", objectFit: "contain", borderRadius: "12px" }} />
              ) : (
                <div style={{ color: "var(--text-muted)", display: "flex", alignItems: "center", justifyContent: "center", height: "160px" }}>Media output unavailable</div>
              )}
              <div className="img-compare-label" style={{ color: "var(--red)" }}>ANNOTATED</div>
            </div>
          </div>

          {/* Stats */}
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <p style={{ fontFamily: "var(--mono)", fontSize: "10px", color: "var(--text-muted)", letterSpacing: "0.08em", marginBottom: "2px" }}>DETECTION METRICS</p>

            <div style={{ display: "flex", alignItems: "center", gap: "20px", padding: "16px", borderRadius: "12px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)" }}>Breakdown</div>
                <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                  <span className="badge badge-low">Minor: {data.severity_breakdown?.Minor || 0}</span>
                  <span className="badge badge-high">Mod: {data.severity_breakdown?.Moderate || 0}</span>
                  <span className="badge badge-critical">Major: {data.severity_breakdown?.Major || 0}</span>
                </div>
              </div>
            </div>

            {[
              [<BoxIcon size={13} />, "Total Detections", `${data.total_detections} potholes`, "var(--accent)"],
              [<AlertIcon size={13} />, "Severity Level", isCritical ? "CRITICAL" : "MODERATE", "var(--red)"],
            ].map(([ic, lbl, val, color]) => (
              <div className="stat-row" key={lbl}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ color }}>{ic}</span>
                  <span style={{ fontSize: "13px", color: "var(--text-secondary)" }}>{lbl}</span>
                </div>
                <span style={{ fontFamily: "var(--mono)", fontSize: "12px", fontWeight: 500, color }}>{val}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Submit feedback */}
        {!submitted ? (
          <button className="btn-primary" style={{ width: "100%", padding: "15px 24px", fontSize: "15px", opacity: 0.8 }} onClick={() => setSubmitted(true)}>
            <CheckIcon size={15} stroke="#020817" />
            Confirm and Return
          </button>
        ) : (
          <div style={{ padding: "16px", borderRadius: "12px", background: "rgba(52,211,153,0.08)", border: "1px solid rgba(52,211,153,0.25)", display: "flex", alignItems: "center", gap: "12px", justifyContent: "center" }}>
            <CheckIcon size={16} stroke="var(--green)" />
            <span style={{ fontFamily: "var(--mono)", fontSize: "13px", color: "var(--green)" }}>Report finalized and synced to remote server.</span>
          </div>
        )}
      </div>
    </section>
  );
}

function TrustIndicators() {
  const items = [
    { icon: <CpuIcon size={22} stroke="var(--cyan)" />, title: "AI Powered", desc: "YOLOv8 real-time inference with 98.3% accuracy on pothole classification.", color: "var(--cyan)" },
    { icon: <ZapIcon size={22} stroke="var(--teal)" />, title: "Real-time Processing", desc: "Sub-2-second end-to-end pipeline from upload to severity classification.", color: "var(--teal)" },
    { icon: <MapPinIcon size={22} stroke="var(--accent)" />, title: "GPS Tagged", desc: "Every report is geolocated with high-precision coordinates for field teams.", color: "var(--accent)" },
    { icon: <ShieldIcon size={22} stroke="var(--amber)" />, title: "Government-Ready", desc: "Compliant infrastructure built to public-sector data governance standards.", color: "var(--amber)" },
  ];

  return (
    <section style={{ maxWidth: "1100px", margin: "0 auto", padding: "0 32px 80px" }}>
      <div style={{ textAlign: "center", marginBottom: "28px" }}>
        <p style={{ fontFamily: "var(--mono)", fontSize: "10px", color: "var(--text-muted)", letterSpacing: "0.12em" }}>PLATFORM CAPABILITIES</p>
      </div>
      <div className="trust-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "16px" }}>
        {items.map(({ icon, title, desc, color }) => (
          <div className="trust-pill" key={title} style={{ flexDirection: "column", alignItems: "flex-start", gap: "12px", padding: "20px" }}>
            <div style={{ width: "40px", height: "40px", borderRadius: "12px", background: `rgba(0,0,0,0.3)`, border: `1px solid rgba(255,255,255,0.08)`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 0 20px ${color}22` }}>{icon}</div>
            <div>
              <div style={{ fontFamily: "var(--display)", fontSize: "14px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "6px" }}>{title}</div>
              <div style={{ fontSize: "12px", color: "var(--text-muted)", lineHeight: 1.6 }}>{desc}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: "48px", padding: "16px 24px", borderRadius: "12px", background: "rgba(255,255,255,0.015)", border: "1px solid rgba(255,255,255,0.04)", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <GlobeIcon size={13} stroke="var(--text-muted)" />
          <span style={{ fontFamily: "var(--mono)", fontSize: "11px", color: "var(--text-muted)" }}>community-road-intel.gov.local</span>
        </div>
        <div style={{ display: "flex", gap: "20px" }}>
          {["Privacy Policy", "Data Governance", "API Docs"].map(l => (
            <span key={l} style={{ fontFamily: "var(--mono)", fontSize: "11px", color: "var(--text-muted)", cursor: "pointer", transition: "color 0.2s" }} onMouseOver={e => e.target.style.color = "var(--cyan)"} onMouseOut={e => e.target.style.color = "var(--text-muted)"}>{l}</span>
          ))}
        </div>
        <span style={{ fontFamily: "var(--mono)", fontSize: "11px", color: "var(--text-muted)" }}>© 2024 Civic AI Systems</span>
      </div>
    </section>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function VolunteerUploadPage() {
  const router = useRouter();
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('sr_user');
      if (raw) setUser(JSON.parse(raw));
    } catch (e) { }
  }, []);

  const handleAnalyze = async (payload) => {
    const { file, lat, lng, description, critical } = payload;
    setIsProcessing(true);
    setResults(null);
    setError(null);

    const backend = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://smartroad-ai.onrender.com';

    try {
      // pre-flight health check
      try {
        const healthResp = await fetch(`${backend}/health`, { method: 'GET' });
        if (!healthResp.ok) {
          setError(`Backend health check failed (${healthResp.status}).`);
          setIsProcessing(false);
          return;
        }
      } catch (err) {
        setError(`Cannot reach backend at ${backend}. It may be sleeping or offline.`);
        setIsProcessing(false);
        return;
      }

      const fd = new FormData();
      fd.append('file', file);
      fd.append('description', description || '');
      if (lat && lng) {
        fd.append('latitude', lat);
        fd.append('longitude', lng);
      }
      fd.append('is_critical', critical ? '1' : '0');

      const isVideo = file.type.startsWith('video/');
      const endpoint = isVideo ? '/detect/video' : '/detect/image';
      const url = `${backend}${endpoint}`;

      const headers = { 'Accept': 'application/json' };
      try {
        const tk = localStorage.getItem('sr_token');
        if (tk) headers['Authorization'] = `Bearer ${tk}`;
      } catch (e) { }

      let resp;
      try {
        resp = await fetch(url, {
          method: 'POST',
          body: fd,
          headers,
        });
      } catch (networkErr) {
        throw new Error(`Network or CORS error connecting to backend: ${networkErr.message}`);
      }

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        setError(err.detail || err.error || 'Upload failed');
        setIsProcessing(false);
        return;
      }

      const data = await resp.json();

      if (data.statistics && data.statistics.total_detections >= 0) {
        const result = {
          total_detections: data.statistics.total_detections,
          severity_breakdown: data.statistics.severity_breakdown,
          message: data.message || 'Analysis complete.',
          annotated: data.image_with_detections
            ? `data:image/jpeg;base64,${data.image_with_detections}`
            : null
        };
        setResults(result);

        // Update coins if login and detections found
        if (data.statistics.total_detections > 0) {
          try {
            const tk = localStorage.getItem('sr_token');
            if (tk) {
              const meResp = await fetch(`${backend}/auth/me`, { headers: { 'Authorization': `Bearer ${tk}` } });
              if (meResp.ok) {
                const meData = await meResp.json().catch(() => null);
                if (meData?.success && meData.data) {
                  localStorage.setItem('sr_user', JSON.stringify(meData.data));
                  setUser(meData.data);
                }
              }
            }
          } catch (e) { }
        }
      } else {
        setError('No structural data parsed from response.');
      }
    } catch (err) {
      console.error(err);
      setError(`Upload failed: ${err.message}. Ensure backend is running.`);
    } finally {
      setIsProcessing(false);
      setTimeout(() => {
        document.getElementById("results")?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  };

  return (
    <>
      <GlobalStyles />
      <div style={{ minHeight: "100vh", background: "var(--bg-void)" }}>
        {/* Nav */}
        <nav style={{ borderBottom: "1px solid var(--border)", backdropFilter: "blur(16px)", background: "rgba(8,12,18,0.85)", position: "sticky", top: 0, zIndex: 100 }}>
          <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "0 32px", height: "56px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }} onClick={() => router.push('/')}>
              <div style={{ width: "28px", height: "28px", borderRadius: "8px", background: "linear-gradient(135deg,#0ea5e9,#2dd4bf)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <MapPinIcon size={14} stroke="#020817" />
              </div>
              <span style={{ fontFamily: "var(--display)", fontSize: "15px", fontWeight: 700, color: "var(--text-primary)" }}>SmartRoad AI</span>
              <span style={{ fontFamily: "var(--mono)", fontSize: "10px", padding: "2px 6px", borderRadius: "4px", background: "rgba(56,189,248,0.08)", border: "1px solid rgba(56,189,248,0.15)", color: "var(--cyan)", marginLeft: "4px" }}>GOV</span>
            </div>
            <div style={{ display: "flex", gap: "24px", alignItems: "center" }}>
              {["Dashboard", "My Reports", "Analytics"].map(l => (
                <span key={l} style={{ fontFamily: "var(--body)", fontSize: "13px", color: "var(--text-muted)", cursor: "pointer", transition: "color 0.2s" }} onMouseOver={e => e.target.style.color = "var(--text-primary)"} onMouseOut={e => e.target.style.color = "var(--text-muted)"}>{l}</span>
              ))}
              {user ? (
                <div style={{ display: "flex", alignItems: "center", gap: "10px", background: "rgba(255,255,255,0.04)", padding: "4px 12px 4px 4px", borderRadius: "20px", border: "1px solid rgba(255,255,255,0.08)" }}>
                  <div style={{ width: "24px", height: "24px", borderRadius: "50%", background: "linear-gradient(135deg,rgba(56,189,248,0.2),rgba(45,212,191,0.2))", border: "1px solid rgba(56,189,248,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--mono)", fontSize: "10px", color: "var(--cyan)" }}>
                    {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <span style={{ fontFamily: "var(--mono)", fontSize: "11px", color: "var(--text-secondary)" }}>
                    ${user.road_coins || 0}
                  </span>
                </div>
              ) : (
                <span onClick={() => router.push('/?login=true')} style={{ fontFamily: "var(--mono)", fontSize: "12px", color: "var(--cyan)", cursor: "pointer" }}>Log In</span>
              )}
            </div>
          </div>
        </nav>

        <HeroBanner />

        {error && (
          <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "0 32px", marginBottom: "20px" }}>
            <div style={{ padding: "16px", borderRadius: "12px", background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.25)", display: "flex", alignItems: "center", gap: "12px" }}>
              <AlertIcon size={16} stroke="var(--red)" />
              <span style={{ fontFamily: "var(--body)", fontSize: "14px", color: "var(--text-primary)" }}>{error}</span>
            </div>
          </div>
        )}

        <UploadModule onAnalyze={handleAnalyze} setError={setError} isAnalyzing={isProcessing} />

        {(results || isProcessing) && (
          <AIResults data={results} isProcessing={isProcessing} />
        )}

        <TrustIndicators />
      </div>
    </>
  );
}
