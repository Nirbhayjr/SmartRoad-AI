"use client"

import { useState, useEffect } from 'react'

export default function RoadCoinsModal({ open, onClose }) {
  const [user, setUser] = useState(null)
  const backend = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'

  useEffect(() => {
    if (!open) return
    try {
      const raw = localStorage.getItem('sr_user')
      if (raw) setUser(JSON.parse(raw))
    } catch (e) {}

    // Try to refresh user from backend if token available
    (async () => {
      try {
        const token = localStorage.getItem('sr_token') || localStorage.getItem('token')
        if (!token) return
        const res = await fetch(`${backend}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        if (!res.ok) return
        const data = await res.json()
        if (data && data.data) {
          setUser(data.data)
          try { localStorage.setItem('sr_user', JSON.stringify(data.data)) } catch (e) {}
        }
      } catch (e) {
        // ignore refresh errors
      }
    })()
  }, [open])

  const handleLogout = () => {
    localStorage.removeItem('sr_user')
    localStorage.removeItem('sr_token')
    setUser(null)
    onClose && onClose()
    window.location.reload()
  }

  if (!open) return null

  return (
    <div style={{ position:'fixed', inset:0, display:'flex', alignItems:'center', justifyContent:'center', zIndex:2000 }}>
      <div style={{ position:'absolute', inset:0, background:'rgba(2,6,23,0.6)' }} onClick={() => onClose && onClose()} />
      <div style={{ width:480, borderRadius:12, padding:18, background:'rgba(10,15,30,0.98)', border:'1px solid rgba(255,255,255,0.06)', boxShadow:'0 20px 60px rgba(0,0,0,0.6)', zIndex:2010 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
          <div style={{ fontFamily:"'Rajdhani',sans-serif", fontWeight:700, color:'#e2e8f0' }}>Road Coins</div>
          <div>
            <button onClick={() => onClose && onClose()} style={{ background:'transparent', border:'none', color:'#64748b', cursor:'pointer' }}>✕</button>
          </div>
        </div>

        <div style={{ marginBottom:12 }}>
          <div style={{ color:'#94a3b8' }}>Signed in as</div>
          <div style={{ fontSize:18, fontWeight:700, color:'#e2e8f0' }}>{user?.name || 'Unknown'}</div>
          <div style={{ color:'#9ca3af', fontSize:13 }}>{user?.email}</div>
        </div>

        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:12, borderRadius:8, background:'rgba(255,255,255,0.02)', marginBottom:12 }}>
          <div>
            <div style={{ color:'#94a3b8', fontSize:12 }}>Uploads</div>
            <div style={{ fontSize:16, color:'#e2e8f0' }}>{(user?.uploads || []).length}</div>
          </div>
        </div>

        <div style={{ maxHeight:220, overflow:'auto' }}>
          <div style={{ color:'#94a3b8', marginBottom:8 }}>Recent activity</div>
          {user?.uploads && user.uploads.length > 0 ? (
            user.uploads.slice().reverse().map((u) => (
              <div key={u.id} style={{ padding:10, borderRadius:8, background:'rgba(255,255,255,0.01)', marginBottom:8 }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', gap:8 }}>
                  <div style={{ color:'#e2e8f0' }}>{u.meta?.type || 'report'}</div>
                  <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                    {u.meta?.status && (
                      <div style={{ fontSize:11, padding:'4px 8px', borderRadius:999, background:'rgba(255,255,255,0.03)', color:'#94a3b8' }}>{u.meta.status}</div>
                    )}
                    <div style={{ color:'#94a3b8', fontSize:12 }}>{new Date(u.timestamp).toLocaleString()}</div>
                  </div>
                </div>
                <div style={{ color:'#9ca3af', fontSize:13 }}>{u.coins} SR Coins</div>
              </div>
            ))
          ) : (
            <div style={{ color:'#9ca3af' }}>No uploads yet.</div>
          )}
        </div>

        <button onClick={handleLogout} style={{ width:'100%', padding:10, marginTop:16, borderRadius:8, background:'#dc2626', color:'#fff', border:'none', fontWeight:600, cursor:'pointer', fontSize:14 }}>
          Logout
        </button>

      </div>
    </div>
  )
}
