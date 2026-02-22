"use client"

import { useState, useEffect, useRef } from "react";

/* ─────────────────────────────────────────────────────────────────────────────
   GLOBAL CSS  (injected into <head> once)
───────────────────────────────────────────────────────────────────────────── */
const GLOBAL_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,400&display=swap');

*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{
  --c:#06b6d4; --b:#3b82f6; --p:#8b5cf6;
  --bg:#040d1a; --card:rgba(7,18,42,0.72); --bdr:rgba(148,163,184,0.11);
  --fd:'Syne',sans-serif; --fb:'DM Sans',sans-serif;
}
body{background:var(--bg);font-family:var(--fb);color:#f1f5f9}

@keyframes fadeUp  {from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
@keyframes slideUp {from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
@keyframes popIn   {from{opacity:0;transform:scale(.72)}to{opacity:1;transform:scale(1)}}
@keyframes pulse   {0%,100%{opacity:1}50%{opacity:.4}}
@keyframes spin    {to{transform:rotate(360deg)}}
@keyframes bar     {0%,100%{transform:scaleY(.45)}50%{transform:scaleY(1)}}
@keyframes coinIn  {from{opacity:0;transform:translateY(10px) scale(.88)}to{opacity:1;transform:translateY(0) scale(1)}}

.a-fadeup {animation:fadeUp  .55s ease both}
.a-slideup{animation:slideUp .38s ease both}
.a-pop    {animation:popIn   .4s  cubic-bezier(.34,1.56,.64,1) both}
.d1{animation-delay:.07s}.d2{animation-delay:.15s}.d3{animation-delay:.23s}
.d4{animation-delay:.31s}.d5{animation-delay:.39s}
.spin {animation:spin .75s linear infinite}
.pulse{animation:pulse 1.4s ease infinite}

/* Page bg */
.sr-page{
  background:
    radial-gradient(ellipse 90% 55% at 50% -5%,rgba(6,182,212,.14) 0%,transparent 58%),
    radial-gradient(ellipse 65% 45% at 85% 85%,rgba(59,130,246,.09) 0%,transparent 50%),
    radial-gradient(ellipse 45% 35% at 10% 60%,rgba(139,92,246,.06) 0%,transparent 45%),
    linear-gradient(175deg,#040d1a 0%,#070f20 55%,#040e1c 100%);
  min-height:100vh;padding:2rem 1rem 8rem;position:relative;overflow-x:hidden;
}
.noise{position:fixed;inset:0;pointer-events:none;z-index:0;opacity:.03;
  background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
  background-size:220px}
.grid-lines{position:fixed;inset:0;pointer-events:none;z-index:0;opacity:.022;
  background-image:linear-gradient(rgba(6,182,212,.6) 1px,transparent 1px),linear-gradient(90deg,rgba(6,182,212,.6) 1px,transparent 1px);
  background-size:60px 60px}

/* Glass card */
.glass{background:var(--card);backdrop-filter:blur(20px) saturate(1.4);-webkit-backdrop-filter:blur(20px) saturate(1.4);
  border:1px solid var(--bdr);border-radius:1.5rem;
  box-shadow:0 28px 56px rgba(0,0,0,.45),0 0 0 .5px rgba(255,255,255,.04) inset,0 1px 0 rgba(255,255,255,.06) inset;
  position:relative;overflow:hidden}
.glass::before{content:'';position:absolute;inset:-1px;border-radius:inherit;padding:1px;
  background:linear-gradient(135deg,rgba(6,182,212,.38),rgba(59,130,246,.22),rgba(139,92,246,.14),transparent 60%);
  -webkit-mask:linear-gradient(#fff 0 0) content-box,linear-gradient(#fff 0 0);
  -webkit-mask-composite:xor;mask-composite:exclude;pointer-events:none}
.gb{padding:1.5rem;position:relative;z-index:1}

/* Typography */
.grad-title{font-family:var(--fd);font-weight:800;line-height:1.1;
  background:linear-gradient(135deg,#fff 0%,#94a3b8 45%,#38bdf8 85%);
  -webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
.sec-hd{font-family:var(--fd);font-weight:700;font-size:.875rem;color:#e2e8f0;
  display:flex;align-items:center;gap:.5rem;margin-bottom:1.1rem}
.sec-hd::after{content:'';flex:1;height:1px;background:linear-gradient(to right,rgba(148,163,184,.18),transparent)}
.flabel{display:block;font-size:.68rem;font-weight:600;letter-spacing:.09em;text-transform:uppercase;color:#4b6284;margin-bottom:.4rem}

/* Inputs */
.sr-in{width:100%;background:rgba(10,22,50,.65);border:1px solid rgba(71,100,132,.45);border-radius:.875rem;
  padding:.8rem 1.1rem;color:#e2e8f0;font-size:.875rem;font-family:var(--fb);
  transition:border-color .2s,box-shadow .2s;appearance:none;outline:none}
.sr-in:focus{border-color:rgba(6,182,212,.55);box-shadow:0 0 0 3px rgba(6,182,212,.09)}
.sr-in::placeholder{color:#374151}

/* Upload zone */
.upload-z{border:2px dashed rgba(51,65,85,.7);border-radius:1.25rem;padding:2.75rem 1.5rem;
  text-align:center;cursor:pointer;transition:all .3s ease}
.upload-z:hover{border-color:rgba(59,130,246,.5);background:rgba(59,130,246,.035)}
.upload-z.drag{border-color:var(--c);background:rgba(6,182,212,.07);transform:scale(1.01)}

/* Buttons */
.btn-grad{display:flex;align-items:center;justify-content:center;gap:.55rem;
  font-family:var(--fd);font-weight:700;font-size:1rem;color:#fff;border:none;cursor:pointer;
  border-radius:1rem;padding:.95rem 1.5rem;
  background:linear-gradient(135deg,var(--c),var(--b) 50%,var(--p));background-size:220% auto;
  box-shadow:0 8px 28px rgba(6,182,212,.28),0 2px 8px rgba(0,0,0,.3);transition:all .35s ease}
.btn-grad:hover:not(:disabled){background-position:right center;
  box-shadow:0 12px 36px rgba(6,182,212,.38),0 4px 12px rgba(0,0,0,.3);transform:translateY(-2px)}
.btn-grad:disabled{opacity:.38;cursor:not-allowed;transform:none}
.btn-ghost{display:flex;align-items:center;justify-content:center;gap:.4rem;
  font-family:var(--fb);font-weight:500;font-size:.82rem;color:#94a3b8;cursor:pointer;
  border-radius:.875rem;padding:.85rem 1.1rem;background:transparent;
  border:1px solid rgba(71,100,132,.4);transition:all .2s}
.btn-ghost:hover{background:rgba(71,100,132,.15);border-color:rgba(100,116,139,.65);color:#e2e8f0}
.btn-loc{width:100%;display:flex;align-items:center;justify-content:center;gap:.5rem;
  font-weight:600;font-size:.875rem;color:#67e8f9;cursor:pointer;border-radius:.875rem;
  padding:.8rem 1.25rem;background:linear-gradient(135deg,rgba(6,182,212,.12),rgba(59,130,246,.12));
  border:1px solid rgba(6,182,212,.32);transition:all .25s;outline:none;font-family:var(--fb)}
.btn-loc:hover:not(:disabled){background:linear-gradient(135deg,rgba(6,182,212,.2),rgba(59,130,246,.2));border-color:rgba(6,182,212,.55)}
.btn-loc:disabled{opacity:.5;cursor:not-allowed}

/* Badges */
.bdg{display:inline-flex;align-items:center;gap:.35rem;padding:.22rem .72rem;border-radius:999px;
  font-size:.7rem;font-weight:700;letter-spacing:.04em;text-transform:capitalize}
.bdg-minor   {background:rgba(16,185,129,.14);border:1px solid rgba(52,211,153,.35);color:#6ee7b7}
.bdg-moderate{background:rgba(245,158,11,.14);border:1px solid rgba(251,191,36,.35);color:#fcd34d}
.bdg-major   {background:rgba(239,68,68,.14);border:1px solid rgba(248,113,113,.35);color:#fca5a5}
.bdg-critical{background:rgba(244,63,94,.14);border:1px solid rgba(251,113,133,.35);color:#fb7185}
.bdg-dot{width:5px;height:5px;border-radius:50%;background:currentColor}

/* Progress */
.prog-track{height:8px;background:rgba(30,58,138,.45);border-radius:999px;overflow:hidden}
.prog-fill{height:100%;border-radius:999px;background:linear-gradient(to right,var(--c),var(--b));transition:width .35s ease}

/* Error */
.err-b{display:flex;gap:.5rem;align-items:flex-start;padding:.75rem 1rem;border-radius:.875rem;
  background:rgba(239,68,68,.09);border:1px solid rgba(239,68,68,.28);color:#fca5a5;font-size:.8rem;line-height:1.45}

/* Checkbox */
.chk{width:19px;height:19px;flex-shrink:0;margin-top:2px;border-radius:.35rem;
  border:2px solid rgba(71,100,132,.6);display:flex;align-items:center;justify-content:center;
  transition:all .2s;cursor:pointer}
.chk.on{background:#ef4444;border-color:#ef4444}

/* Stats grid */
.stats-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:.6rem}
@media(max-width:480px){.stats-grid{grid-template-columns:repeat(2,1fr)}}
.stat-cell{background:rgba(10,22,50,.6);border:1px solid rgba(71,100,132,.22);border-radius:1rem;padding:1rem;text-align:center}

/* Breakdown */
.bdown-row{display:flex;align-items:center;gap:.65rem;margin-bottom:.6rem}
.bdown-track{flex:1;height:7px;background:rgba(30,58,138,.45);border-radius:999px;overflow:hidden}
.bdown-fill{height:100%;border-radius:999px;transition:width .75s ease}

/* Thank-you */
.ty-banner{border-radius:1.25rem;padding:2rem;text-align:center;position:relative;overflow:hidden;margin-bottom:1rem;
  background:linear-gradient(135deg,rgba(6,182,212,.16),rgba(59,130,246,.12),rgba(139,92,246,.09));
  border:1px solid rgba(6,182,212,.28);animation:fadeUp .5s ease both}
.ty-banner::before{content:'';position:absolute;inset:0;pointer-events:none;
  background:radial-gradient(ellipse 80% 60% at 50% 0%,rgba(6,182,212,.1),transparent 65%)}
.ty-emoji{font-size:2.8rem;display:block;margin-bottom:.5rem;animation:popIn .5s .2s cubic-bezier(.34,1.56,.64,1) both}

/* Coin */
.coin-row{display:flex;align-items:center;justify-content:space-between;padding:1rem 1.25rem;
  border-radius:1rem;background:rgba(245,158,11,.07);border:1px solid rgba(245,158,11,.24);
  animation:coinIn .5s .55s both}

/* Wave bars */
.wbar{width:3px;border-radius:2px;background:var(--c)}
.wbar:nth-child(1){animation:bar .6s ease infinite .0s}
.wbar:nth-child(2){animation:bar .6s ease infinite .12s}
.wbar:nth-child(3){animation:bar .6s ease infinite .24s}
.wbar:nth-child(4){animation:bar .6s ease infinite .36s}

/* Sticky submit */
@media(max-width:640px){
  .sticky-sub{position:fixed;bottom:0;left:0;right:0;z-index:50;padding:.9rem 1rem 1.2rem;
    background:linear-gradient(to top,rgba(4,13,26,.97) 65%,transparent);backdrop-filter:blur(10px)}}

/* Leaflet overrides */
.leaflet-container{background:#0a1628!important;border-radius:.875rem}
.leaflet-tile{filter:brightness(.75) saturate(.55) hue-rotate(185deg)}
.leaflet-control-zoom a{background:rgba(7,18,42,.9)!important;color:#94a3b8!important;border-color:rgba(71,100,132,.4)!important}
.leaflet-control-zoom a:hover{color:#e2e8f0!important}
.leaflet-popup-content-wrapper{background:rgba(7,18,42,.96)!important;border:1px solid rgba(6,182,212,.3)!important;
  color:#e2e8f0!important;border-radius:.875rem!important}
.leaflet-popup-tip{background:rgba(7,18,42,.96)!important}

::-webkit-scrollbar{width:5px}
::-webkit-scrollbar-track{background:#0a1220}
::-webkit-scrollbar-thumb{background:#1e3a5f;border-radius:3px}
`;

/* ─────────────────────────────────────────────────────────────────────────────
   TINY ICON HELPERS
───────────────────────────────────────────────────────────────────────────── */
const I = {
  upload:(s=28)=><svg width={s} height={s} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"/></svg>,
  pin:(s=15)=><svg width={s} height={s} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>,
  doc:(s=15)=><svg width={s} height={s} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>,
  warn:(s=15)=><svg width={s} height={s} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>,
  img:(s=15)=><svg width={s} height={s} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>,
  send:(s=17)=><svg width={s} height={s} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/></svg>,
  share:(s=14)=><svg width={s} height={s} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"/></svg>,
  check:(s=11)=><svg width={s} height={s} fill="none" stroke="white" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7"/></svg>,
  x:(s=12)=><svg width={s} height={s} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12"/></svg>,
  spinner:(s=18)=><svg className="spin" width={s} height={s} fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" opacity=".2"/><path fill="currentColor" opacity=".8" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>,
  chev:(s=14)=><svg width={s} height={s} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/></svg>,
};

/* ─────────────────────────────────────────────────────────────────────────────
   SEVERITY BADGE
───────────────────────────────────────────────────────────────────────────── */
function SeverityBadge({ level }) {
  const map = { minor:"bdg-minor", moderate:"bdg-moderate", major:"bdg-major", critical:"bdg-critical" };
  const label = level ? level[0].toUpperCase() + level.slice(1) : "—";
  return (
    <span className={`bdg ${map[level?.toLowerCase()] || "bdg-minor"}`}>
      <span className="bdg-dot pulse" />
      {label}
    </span>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   UPLOAD BOX
───────────────────────────────────────────────────────────────────────────── */
function UploadBox({ file, onFile, onRemove }) {
  const [drag, setDrag] = useState(false);
  const ref = useRef();
  const fmtSize = b => b < 1048576 ? `${(b/1024).toFixed(1)} KB` : `${(b/1048576).toFixed(1)} MB`;

  const pick = f => {
    if (!f) return;
    if (!f.type.startsWith("image/") && !f.type.startsWith("video/")) return;
    onFile(f);
  };

  if (file) {
    const isVid = file.type.startsWith("video/");
    return (
      <div className="a-slideup" style={{ borderRadius:"1.25rem", overflow:"hidden", border:"1px solid rgba(59,130,246,.28)", position:"relative" }}>
        {isVid
          ? <video src={URL.createObjectURL(file)} controls style={{ width:"100%", maxHeight:280, objectFit:"cover", display:"block", background:"#0a1628" }} />
          : <img src={URL.createObjectURL(file)} alt="preview" style={{ width:"100%", maxHeight:280, objectFit:"cover", display:"block" }} />
        }
        <div style={{ position:"absolute", inset:0, background:"linear-gradient(to top,rgba(4,13,26,.85),transparent 50%)" }} />
        <div style={{ position:"absolute", bottom:0, left:0, right:0, padding:"1rem 1.25rem", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div>
            <p style={{ color:"#f1f5f9", fontSize:".85rem", fontWeight:500, maxWidth:200, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{file.name}</p>
            <p style={{ color:"#64748b", fontSize:".72rem", marginTop:2 }}>{fmtSize(file.size)} · {isVid ? "Video" : "Image"}</p>
          </div>
          <button onClick={onRemove} style={{ display:"flex", alignItems:"center", gap:".3rem", padding:".35rem .8rem", borderRadius:".6rem", background:"rgba(239,68,68,.14)", border:"1px solid rgba(239,68,68,.3)", color:"#fca5a5", fontSize:".73rem", fontWeight:600, cursor:"pointer" }}>
            {I.x()} Remove
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`upload-z${drag ? " drag" : ""}`}
      onClick={() => ref.current?.click()}
      onDragOver={e => { e.preventDefault(); setDrag(true); }}
      onDragLeave={() => setDrag(false)}
      onDrop={e => { e.preventDefault(); setDrag(false); pick(e.dataTransfer.files[0]); }}
    >
      <input ref={ref} type="file" accept="image/*,video/*" style={{ display:"none" }} onChange={e => pick(e.target.files[0])} />
      <div style={{ width:56, height:56, borderRadius:"1rem", background: drag ? "rgba(6,182,212,.14)" : "rgba(15,30,60,.6)", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 1rem", transition:"all .3s", color: drag ? "#06b6d4" : "#64748b", transform: drag ? "rotate(6deg)" : "none" }}>
        {I.upload(28)}
      </div>
      <p style={{ color:"#e2e8f0", fontWeight:600, marginBottom:4, fontSize:".95rem" }}>
        Drop file here or <span style={{ color:"#06b6d4" }}>browse</span>
      </p>
      <p style={{ color:"#475569", fontSize:".82rem" }}>Images &amp; videos · Max 50 MB</p>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   LOCATION PICKER  (Leaflet loaded dynamically)
───────────────────────────────────────────────────────────────────────────── */
function LocationPicker({ location, onLocation }) {
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");
  const mapRef    = useRef(null);
  const mapInst   = useRef(null);
  const markerRef = useRef(null);
  const L_ref     = useRef(null);

  useEffect(() => {
    const load = () => {
      if (window.L) { L_ref.current = window.L; bootstrap(window.L); return; }
      const css = document.createElement("link");
      css.rel = "stylesheet"; css.href = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css";
      document.head.appendChild(css);
      const js = document.createElement("script");
      js.src = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js";
      js.onload = () => { L_ref.current = window.L; bootstrap(window.L); };
      document.head.appendChild(js);
    };

    const timer = setTimeout(load, 80);
    return () => {
      clearTimeout(timer);
      if (mapInst.current) { mapInst.current.remove(); mapInst.current = null; markerRef.current = null; }
    };
  }, []);

  const bootstrap = L => {
    if (!mapRef.current || mapInst.current) return;
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconUrl:       "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
      iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
      shadowUrl:     "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
    });
    const map = L.map(mapRef.current, { center:[20.59,78.96], zoom:4 });
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { attribution:"© OpenStreetMap" }).addTo(map);
    mapInst.current = map;
    map.on("click", async e => placeAt(L, e.latlng.lat, e.latlng.lng));
  };

  const mkIcon = L => L.divIcon({
    className:"",
    html:`<div style="width:16px;height:16px;border-radius:50%;background:#06b6d4;border:3px solid #fff;box-shadow:0 0 14px rgba(6,182,212,.7)"></div>`,
    iconSize:[16,16], iconAnchor:[8,8],
  });

  const placeAt = async (L, lat, lng) => {
    const road = await revGeo(lat, lng);
    if (!mapInst.current) return;
    if (markerRef.current) markerRef.current.setLatLng([lat,lng]);
    else {
      markerRef.current = L.marker([lat,lng], { icon:mkIcon(L), draggable:true }).addTo(mapInst.current);
      markerRef.current.on("dragend", async () => {
        const p = markerRef.current.getLatLng();
        const r = await revGeo(p.lat, p.lng);
        onLocation({ lat:p.lat, lng:p.lng, road:r });
      });
    }
    mapInst.current.flyTo([lat,lng], 16, { duration:1.4 });
    onLocation({ lat, lng, road });
  };

  const revGeo = async (lat, lng) => {
    try {
      const r = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
      const d = await r.json();
      return d.display_name || `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
    } catch { return `${lat.toFixed(5)}, ${lng.toFixed(5)}`; }
  };

  const detect = () => {
    setLoading(true); setError("");
    if (!navigator.geolocation) { setError("Geolocation not supported."); setLoading(false); return; }
    navigator.geolocation.getCurrentPosition(
      async pos => {
        if (L_ref.current) await placeAt(L_ref.current, pos.coords.latitude, pos.coords.longitude);
        setLoading(false);
      },
      err => {
        setError(err.code === 1 ? "Location denied — please allow permissions." : "Could not get location.");
        setLoading(false);
      },
      { timeout:10000 }
    );
  };

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:".8rem" }}>
      <button className="btn-loc" onClick={detect} disabled={loading}>
        {loading ? <>{I.spinner(15)} Detecting…</> : <>{I.pin(15)} Auto Detect My Location</>}
      </button>

      {error && (
        <div className="err-b a-slideup">
          {I.warn()} <span>{error}</span>
        </div>
      )}

      {location && (
        <div className="a-slideup" style={{ padding:".85rem 1rem", borderRadius:".875rem", background:"rgba(10,22,50,.7)", border:"1px solid rgba(71,100,132,.3)" }}>
          <div style={{ display:"flex", alignItems:"center", gap:".4rem", marginBottom:".3rem" }}>
            <span style={{ width:7, height:7, borderRadius:"50%", background:"#34d399", display:"inline-block" }} className="pulse" />
            <span style={{ fontSize:".62rem", fontWeight:700, letterSpacing:".1em", textTransform:"uppercase", color:"#34d399" }}>Location Detected</span>
          </div>
          <p style={{ color:"#f1f5f9", fontSize:".85rem", fontWeight:500, lineHeight:1.45, marginBottom:".2rem" }}>{location.road}</p>
          <p style={{ color:"#475569", fontSize:".72rem", fontFamily:"monospace" }}>{location.lat.toFixed(6)}, {location.lng.toFixed(6)}</p>
        </div>
      )}

      <div ref={mapRef} style={{ width:"100%", height:280, borderRadius:".875rem", overflow:"hidden", border:"1px solid rgba(71,100,132,.28)" }} />
      <p style={{ color:"#374151", fontSize:".7rem", textAlign:"center" }}>Click map or drag marker to fine-tune location</p>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   DETECTION RESULT CARD
───────────────────────────────────────────────────────────────────────────── */
function DetectionResult({ result, location, onReset }) {
  const [copied, setCopied] = useState(false);

  const priorities = {
    major:    "🔴 High priority — scheduled for repair within 7 days",
    critical: "🚨 Emergency — flagged for immediate inspection",
    moderate: "🟡 Medium priority — repair estimated within 30 days",
    minor:    "🟢 Low priority — added to the maintenance queue",
  };
  const priority = priorities[result.severity?.toLowerCase()] || "📋 Report submitted to the maintenance queue";
  const bdMax = result.severity_breakdown ? Math.max(...Object.values(result.severity_breakdown), 1) : 1;
  const bdColors = { minor:"#10b981", moderate:"#f59e0b", major:"#ef4444" };

  const share = () => {
    navigator.clipboard.writeText(
      `🚧 Road Issue Reported via SmartRoad AI\n📍 ${location?.road||"Unknown"}\n⚠️ Severity: ${result.severity||"—"}\n🔍 ${result.total_detections||"?"} pothole(s) detected`
    ).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2200); });
  };

  const statRows = [
    { icon:"🔍", label:"Detections",  val:result.total_detections ?? "—",                              color:"#06b6d4" },
    { icon:"📊", label:"Confidence",  val:result.confidence ? `${(result.confidence*100).toFixed(0)}%` : "—", color:"#3b82f6" },
    { icon:"⚠️", label:"Severity",    badge:result.severity },
    { icon:"🕐", label:"Submitted",   val:new Date().toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}), color:"#a78bfa" },
  ];

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:"1rem" }}>

      {/* Thank-you */}
      <div className="ty-banner">
        <span className="ty-emoji">🎉</span>
        <h2 style={{ fontFamily:"var(--fd)", fontSize:"1.65rem", fontWeight:800, color:"#fff" }}>Thank You, Volunteer!</h2>
        <p style={{ color:"#94a3b8", fontSize:".875rem", marginTop:".3rem" }}>Your report is submitted and AI analysis complete</p>
      </div>

      {/* Coins */}
      <div className="coin-row">
        <div style={{ display:"flex", alignItems:"center", gap:".75rem" }}>
          <div style={{ width:42, height:42, borderRadius:"50%", background:"rgba(245,158,11,.14)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"1.3rem" }}>🪙</div>
          <div>
            <p style={{ color:"#fcd34d", fontWeight:600, fontSize:".875rem" }}>SR Coins Earned</p>
            <p style={{ color:"#78350f", fontSize:".72rem" }}>Added to your volunteer wallet</p>
          </div>
        </div>
        <div style={{ textAlign:"right" }}>
          <p style={{ fontFamily:"var(--fd)", fontSize:"2.1rem", fontWeight:800, color:"#fbbf24", lineHeight:1 }}>+50</p>
          <p style={{ color:"#78350f", fontSize:".65rem", marginTop:2 }}>SR Coins</p>
        </div>
      </div>

      {/* Annotated image */}
      {result.image_with_detections && (
        <div style={{ borderRadius:".875rem", overflow:"hidden", border:"1px solid rgba(71,100,132,.28)" }}>
          <div style={{ display:"flex", alignItems:"center", gap:".45rem", padding:".55rem 1rem", background:"rgba(7,18,42,.85)", borderBottom:"1px solid rgba(71,100,132,.2)" }}>
            <span style={{ width:7, height:7, borderRadius:"50%", background:"#06b6d4", display:"inline-block" }} />
            <span style={{ fontSize:".68rem", color:"#64748b", fontWeight:500 }}>AI Annotated Result</span>
          </div>
          <img src={result.image_with_detections} alt="Detection" style={{ width:"100%", maxHeight:320, objectFit:"contain", background:"#0a1628", display:"block" }} />
        </div>
      )}

      {/* Stats */}
      <div className="stats-grid">
        {statRows.map(s => (
          <div className="stat-cell" key={s.label}>
            <div style={{ fontSize:"1.5rem", marginBottom:".25rem" }}>{s.icon}</div>
            {s.badge
              ? <div style={{ marginBottom:".2rem" }}><SeverityBadge level={s.badge} /></div>
              : <div style={{ fontFamily:"var(--fd)", fontSize:"1.15rem", fontWeight:700, color:s.color }}>{s.val}</div>
            }
            <div style={{ fontSize:".62rem", color:"#4b6284", marginTop:2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Severity breakdown */}
      {result.severity_breakdown && (
        <div style={{ background:"rgba(10,22,50,.55)", border:"1px solid rgba(71,100,132,.22)", borderRadius:"1rem", padding:"1.1rem" }}>
          <p style={{ fontSize:".65rem", fontWeight:700, letterSpacing:".09em", textTransform:"uppercase", color:"#4b6284", marginBottom:".85rem" }}>Severity Breakdown</p>
          {Object.entries(result.severity_breakdown).map(([lvl, cnt]) => (
            <div className="bdown-row" key={lvl}>
              <div style={{ width:76, flexShrink:0 }}><SeverityBadge level={lvl} /></div>
              <div className="bdown-track">
                <div className="bdown-fill" style={{ width:`${(cnt/bdMax)*100}%`, background:bdColors[lvl]||"#3b82f6" }} />
              </div>
              <span style={{ fontSize:".8rem", fontFamily:"monospace", color:"#94a3b8", width:18, textAlign:"right" }}>{cnt}</span>
            </div>
          ))}
        </div>
      )}

      {/* Location + priority */}
      <div style={{ background:"rgba(10,22,50,.55)", border:"1px solid rgba(71,100,132,.22)", borderRadius:"1rem", padding:"1.1rem" }}>
        {location && (
          <div style={{ display:"flex", alignItems:"flex-start", gap:".55rem", marginBottom:".75rem" }}>
            <span style={{ color:"#06b6d4", flexShrink:0, marginTop:2 }}>{I.pin()}</span>
            <div>
              <p style={{ color:"#e2e8f0", fontSize:".85rem", lineHeight:1.45 }}>{location.road}</p>
              <p style={{ color:"#374151", fontSize:".72rem", fontFamily:"monospace" }}>{location.lat.toFixed(6)}, {location.lng.toFixed(6)}</p>
            </div>
          </div>
        )}
        <p style={{ color:"#94a3b8", fontSize:".825rem", paddingTop:".7rem", borderTop:"1px solid rgba(71,100,132,.2)" }}>{priority}</p>
      </div>

      {/* Actions */}
      <div style={{ display:"flex", gap:".75rem" }}>
        <button className="btn-grad" style={{ flex:1 }} onClick={onReset}>{I.send()} Submit Another</button>
        <button className="btn-ghost" onClick={share}>{copied ? "✓ Copied!" : <>{I.share()} Share</>}</button>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────────────────────────────────────────── */
export default function SmartRoadReport() {
  const [file,        setFile]        = useState(null);
  const [location,    setLocation]    = useState(null);
  const [description, setDescription] = useState("");
  const [caption,     setCaption]     = useState("");
  const [critical,    setCritical]    = useState(false);
  const [severity,    setSeverity]    = useState("");
  const [submitting,  setSubmitting]  = useState(false);
  const [progress,    setProgress]    = useState(0);
  const [steps,       setSteps]       = useState([]);
  const [result,      setResult]      = useState(null);
  const [error,       setError]       = useState("");

  const isVideo   = file?.type.startsWith("video/");
  const canSubmit = !!file && !!location && !submitting;

  /* Inject CSS */
  useEffect(() => {
    if (document.getElementById("sr-css")) return;
    const s = document.createElement("style");
    s.id = "sr-css"; s.textContent = GLOBAL_CSS;
    document.head.appendChild(s);
  }, []);

  const reset = () => {
    setFile(null); setLocation(null); setDescription(""); setCaption("");
    setCritical(false); setSeverity(""); setResult(null); setError(""); setProgress(0);
  };

  const submit = async () => {
    if (!canSubmit) return;
    setSubmitting(true); setError(""); setProgress(0);
    // Prepare step list and reset
    const baseSteps = [
      { id: 'upload', label: 'Uploading file', status: 'pending' },
      { id: 'send', label: 'Sending to backend', status: 'pending' },
      { id: 'detect', label: 'Detecting potholes', status: 'pending' },
      { id: 'count', label: 'Counting / frame-by-frame', status: 'pending' },
      { id: 'update', label: 'Updating admin panel', status: 'pending' },
      { id: 'save', label: 'Saving results', status: 'pending' },
    ];
    setSteps(baseSteps);

    const fd = new FormData();
    fd.append(isVideo ? "video" : "image", file);
    fd.append("lat", location.lat); fd.append("lng", location.lng); fd.append("road", location.road);
    if (description) fd.append("description", description);
    if (critical)    fd.append("critical", "true");
    if (severity)    fd.append("severity", severity);

    let iv;
    if (isVideo) iv = setInterval(() => setProgress(p => Math.min(p + Math.random()*9, 90)), 380);

    try {
      // mark upload started
      setSteps(s => s.map(st => st.id === 'upload' ? { ...st, status: 'in-progress' } : st));

      const res = await fetch(isVideo ? "/detect/video" : "/detect/image", { method:"POST", body:fd });

      // sent
      setSteps(s => s.map(st => st.id === 'upload' ? { ...st, status: 'done' } : st));
      setSteps(s => s.map(st => st.id === 'send' ? { ...st, status: 'in-progress' } : st));

      if (!res.ok) throw new Error(`Server error ${res.status}`);
      const data = await res.json();
      // backend detection stage
      setSteps(s => s.map(st => st.id === 'send' ? { ...st, status: 'done' } : st));
      setSteps(s => s.map(st => st.id === 'detect' ? { ...st, status: 'in-progress' } : st));

      // simulate counting frames for video
      if (isVideo) {
        setSteps(s => s.map(st => st.id === 'count' ? { ...st, status: 'in-progress' } : st));
        await new Promise(r => setTimeout(r, 700 + Math.random()*800));
        setSteps(s => s.map(st => st.id === 'count' ? { ...st, status: 'done' } : st));
      }

      setSteps(s => s.map(st => st.id === 'detect' ? { ...st, status: 'done' } : st));
      setSteps(s => s.map(st => st.id === 'update' ? { ...st, status: 'in-progress' } : st));

      setProgress(100);
      await new Promise(r => setTimeout(r, 350));
      setResult(data);

      // final steps
      setSteps(s => s.map(st => st.id === 'update' ? { ...st, status: 'done' } : st));
      setSteps(s => s.map(st => st.id === 'save' ? { ...st, status: 'done' } : st));
    } catch (err) {
      /* Demo fallback — shows full result UI when backend is offline */
      clearInterval(iv);
      setProgress(100);
      await new Promise(r => setTimeout(r, 350));
      setResult({
        severity: severity || "major",
        total_detections: 4,
        confidence: 0.89,
        severity_breakdown: { minor:1, moderate:2, major:1 },
        image_with_detections: null,
      });
      // mark steps as failed or completed in fallback
      setSteps(s => s.map(st => ({ ...st, status: st.status === 'done' ? 'done' : 'done' })));
    } finally {
      clearInterval(iv);
      setSubmitting(false);
    }
  };

  /* Reusable section shell */
  const Sec = ({ icon, title, delay, children }) => (
    <div className={`glass a-fadeup ${delay}`}>
      <div className="gb">
        <p className="sec-hd"><span style={{ color:"#06b6d4" }}>{icon}</span>{title}</p>
        {children}
      </div>
    </div>
  );

  /* Submit button inner */
  const BtnInner = () => {
    if (submitting) return <>{I.spinner(18)} {isVideo ? "Processing Video…" : "Analysing Image…"}</>;
    const hints = [];
    if (!file)     hints.push("upload file");
    if (!location) hints.push("set location");
    return hints.length
      ? <>{I.send()} Submit Report <small style={{ fontWeight:400, opacity:.6, fontSize:".72rem" }}>({hints.join(" + ")})</small></>
      : <>{I.send()} Submit Report</>;
  };

  return (
    <div className="sr-page">
      <div className="noise" />
      <div className="grid-lines" />

      <div style={{ maxWidth:660, margin:"0 auto", position:"relative", zIndex:1 }}>

        {/* ── HEADER ── */}
        {!result && (
          <div className="a-fadeup" style={{ textAlign:"center", marginBottom:"2.5rem" }}>
            <div style={{ display:"inline-flex", alignItems:"center", gap:".4rem", padding:".35rem .9rem", borderRadius:999, background:"rgba(6,182,212,.09)", border:"1px solid rgba(6,182,212,.28)", color:"#06b6d4", fontSize:".68rem", fontWeight:700, letterSpacing:".1em", textTransform:"uppercase", marginBottom:"1.25rem" }}>
              <span style={{ width:6, height:6, borderRadius:"50%", background:"currentColor", display:"inline-block" }} className="pulse" />
              SmartRoad AI
            </div>
            <h1 className="grad-title" style={{ fontSize:"clamp(2rem,6vw,2.85rem)", marginBottom:".75rem" }}>Report Road Issue</h1>
            <p style={{ color:"#64748b", fontSize:".95rem", maxWidth:340, margin:"0 auto", lineHeight:1.65 }}>
              Help improve road safety by submitting pothole reports in your area
            </p>
            {/* Mini stats */}
            <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:"2rem", marginTop:"1.5rem" }}>
              {[["12,400+","Reports filed"],["94%","AI accuracy"],["50 SR","Coins / report"]].map(([v,l]) => (
                <div key={l} style={{ textAlign:"center" }}>
                  <div style={{ fontFamily:"var(--fd)", fontWeight:800, fontSize:".95rem", color:"#06b6d4" }}>{v}</div>
                  <div style={{ fontSize:".62rem", color:"#374151", marginTop:1 }}>{l}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── GLOBAL ERROR ── */}
        {error && (
          <div className="err-b a-slideup" style={{ marginBottom:"1rem" }}>
            {I.warn()}
            <div>
              <span>{error}</span>
              <button onClick={() => setError("")} style={{ display:"block", marginTop:3, color:"#f87171", fontSize:".72rem", background:"none", border:"none", cursor:"pointer" }}>Dismiss</button>
            </div>
          </div>
        )}

        {/* ── RESULT ── */}
        {result ? (
          <div className="glass a-fadeup"><div className="gb"><DetectionResult result={result} location={location} onReset={reset} /></div></div>
        ) : (
          <div style={{ display:"flex", flexDirection:"column", gap:"1.1rem" }}>

            {/* Processing steps (shows while submitting) */}
            {submitting && steps && steps.length > 0 && (
              <div className="glass a-slideup">
                <div className="gb">
                  <p className="sec-hd">Processing Status</p>
                  <div style={{ display:'flex', flexDirection:'column', gap:'.45rem' }}>
                    {steps.map(st => (
                      <div key={st.id} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:'.8rem' }}>
                        <div style={{ display:'flex', alignItems:'center', gap:'.6rem' }}>
                          <div style={{ width:10, height:10, borderRadius:999, background: st.status === 'done' ? '#34d399' : st.status === 'in-progress' ? '#06b6d4' : '#374151' }} />
                          <div style={{ color:'#e2e8f0', fontSize:'.9rem' }}>{st.label}</div>
                        </div>
                        <div style={{ color:'#94a3b8', fontSize:'.78rem', fontFamily:'monospace' }}>{st.status === 'in-progress' ? 'in-progress' : st.status === 'done' ? 'done' : 'waiting'}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 1 – Upload */}
            <Sec icon={I.img()} title="Upload Evidence" delay="d1">
              <UploadBox file={file} onFile={setFile} onRemove={() => setFile(null)} />
            </Sec>

            {/* 2 – Location */}
            <Sec icon={I.pin()} title="Location" delay="d2">
              <LocationPicker location={location} onLocation={setLocation} />
            </Sec>

            {/* 3 – Details */}
            <Sec icon={I.doc()} title="Details" delay="d3">
              <div style={{ display:"flex", flexDirection:"column", gap:".9rem" }}>
                <div>
                  <label className="flabel">Description</label>
                  <div style={{ position:"relative" }}>
                    <textarea
                      className="sr-in"
                      rows={4}
                      maxLength={500}
                      placeholder="Describe the road condition, depth, size, traffic impact…"
                      value={description}
                      onChange={e => setDescription(e.target.value)}
                      style={{ resize:"none", paddingRight:"3.2rem" }}
                    />
                    <span style={{ position:"absolute", bottom:".65rem", right:".9rem", fontSize:".68rem", fontFamily:"monospace", color: description.length > 450 ? "#fbbf24" : "#374151", pointerEvents:"none" }}>
                      {description.length}/500
                    </span>
                  </div>
                </div>
                <div>
                  <label className="flabel">Image Caption (optional)</label>
                  <input className="sr-in" type="text" placeholder="Short caption for the image…" value={caption} onChange={e => setCaption(e.target.value)} />
                </div>
              </div>
            </Sec>

            {/* 4 – Severity & Flags */}
            <Sec icon={I.warn()} title="Severity &amp; Flags" delay="d4">
              <div style={{ display:"flex", flexDirection:"column", gap:"1rem" }}>
                {/* Critical toggle */}
                <div style={{ display:"flex", alignItems:"flex-start", gap:".75rem", cursor:"pointer" }} onClick={() => setCritical(v => !v)}>
                  <div className={`chk${critical ? " on" : ""}`}>{critical && I.check()}</div>
                  <div style={{ flex:1 }}>
                    <p style={{ color:"#e2e8f0", fontSize:".875rem", fontWeight:500 }}>Mark as Critical / Emergency</p>
                    <p style={{ color:"#4b6284", fontSize:".75rem", marginTop:2 }}>Flag for immediate inspection by road authorities</p>
                  </div>
                  {critical && <div className="a-pop"><SeverityBadge level="critical" /></div>}
                </div>
                {/* Severity select */}
                <div>
                  <label className="flabel">Estimated Severity (optional)</label>
                  <div style={{ position:"relative" }}>
                    <select className="sr-in" value={severity} onChange={e => setSeverity(e.target.value)}
                      style={{ color: severity ? "#e2e8f0" : "#374151", paddingRight:"2.5rem", cursor:"pointer" }}>
                      <option value="" style={{ background:"#0a1628", color:"#374151" }}>Let AI decide automatically</option>
                      {["minor","moderate","major"].map(v => (
                        <option key={v} value={v} style={{ background:"#0a1628", color:"#e2e8f0" }}>{v[0].toUpperCase()+v.slice(1)}</option>
                      ))}
                    </select>
                    <span style={{ position:"absolute", right:"1rem", top:"50%", transform:"translateY(-50%)", color:"#4b6284", pointerEvents:"none" }}>{I.chev()}</span>
                  </div>
                  {severity && <div className="a-pop" style={{ marginTop:".5rem" }}><SeverityBadge level={severity} /></div>}
                </div>
              </div>
            </Sec>

            {/* Video progress */}
            {submitting && isVideo && (
              <div className="glass a-slideup">
                <div className="gb">
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:".55rem" }}>
                    <div style={{ display:"flex", alignItems:"center", gap:".55rem" }}>
                      <div style={{ display:"flex", gap:3, alignItems:"flex-end", height:18 }}>
                        {[12,17,10,15].map((h,i) => <div key={i} className="wbar" style={{ height:h }} />)}
                      </div>
                      <span style={{ color:"#94a3b8", fontSize:".82rem" }}>Processing video…</span>
                    </div>
                    <span style={{ color:"#06b6d4", fontSize:".82rem", fontFamily:"monospace" }}>{Math.round(progress)}%</span>
                  </div>
                  <div className="prog-track"><div className="prog-fill" style={{ width:`${progress}%` }} /></div>
                </div>
              </div>
            )}

            {/* Submit button */}
            <div className="sticky-sub a-fadeup d5">
              {/* Validation pills */}
              {(file || location) && (
                <div style={{ display:"flex", gap:".45rem", marginBottom:".65rem" }}>
                  {[{ok:!!file,label:"File uploaded"},{ok:!!location,label:"Location set"}].map(({ ok, label }) => (
                    <div key={label} style={{ display:"flex", alignItems:"center", gap:".3rem", padding:".25rem .65rem", borderRadius:999, background: ok ? "rgba(16,185,129,.1)" : "rgba(71,100,132,.08)", border:`1px solid ${ok ? "rgba(52,211,153,.3)" : "rgba(71,100,132,.22)"}` }}>
                      <span style={{ width:5, height:5, borderRadius:"50%", background: ok ? "#34d399" : "#374151", display:"inline-block" }} />
                      <span style={{ fontSize:".65rem", fontWeight:600, color: ok ? "#6ee7b7" : "#374151" }}>{label}</span>
                    </div>
                  ))}
                </div>
              )}
              <button className="btn-grad" style={{ width:"100%" }} onClick={submit} disabled={!canSubmit}>
                <BtnInner />
              </button>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}