"use client"

import { useState } from 'react'

export default function AuthModal({ open, onClose, onAuth }) {
  const [mode, setMode] = useState('login') // 'login' | 'signup'
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState(null)
  const backend = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'

  if (!open) return null

  const submit = async (e) => {
    e && e.preventDefault()
    setMessage(null)
    const url = `${backend}/auth/${mode}`
    const form = new FormData()
    if (mode === 'signup') form.append('name', name)
    form.append('email', email)
    form.append('password', password)

    try {
      const res = await fetch(url, { method: 'POST', body: form })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || data.message || 'Request failed')
      // save token
      if (data?.data?.token) {
        try {
          localStorage.setItem('sr_token', data.data.token);
          const userObj = { id: data.data.id, name: data.data.name, email: data.data.email, coins: data.data.coins || 0, uploads: data.data.uploads || [] };
          localStorage.setItem('sr_user', JSON.stringify(userObj));
        } catch (e) {}
      }
      setMessage(data.message || 'Success')
      onAuth && onAuth(data.data || null)
      setTimeout(() => { onClose && onClose() }, 600)
    } catch (err) {
      setMessage(err.message || 'Failed')
    }
  }

  return (
    <div style={{ position:'fixed', inset:0, display:'flex', alignItems:'center', justifyContent:'center', zIndex:2000 }}>
      <div style={{ position:'absolute', inset:0, background:'rgba(2,6,23,0.6)' }} onClick={() => onClose && onClose()} />
      <form onSubmit={submit} style={{ width:420, borderRadius:12, padding:18, background:'rgba(10,15,30,0.98)', border:'1px solid rgba(255,255,255,0.06)', boxShadow:'0 20px 60px rgba(0,0,0,0.6)', zIndex:2010 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
          <div style={{ fontFamily:"'Rajdhani',sans-serif", fontWeight:700, color:'#e2e8f0' }}>{mode === 'signup' ? 'Create an account' : 'Sign in'}</div>
          <div style={{ display:'flex', gap:8 }}>
            <button type="button" onClick={() => setMode(mode === 'login' ? 'signup' : 'login')} style={{ background:'transparent', border:'1px solid rgba(255,255,255,0.06)', color:'#94a3b8', padding:'6px 10px', borderRadius:8, cursor:'pointer' }}>{mode === 'login' ? 'Sign up' : 'Log in'}</button>
            <button type="button" onClick={() => onClose && onClose()} style={{ background:'transparent', border:'none', color:'#64748b', cursor:'pointer' }}>✕</button>
          </div>
        </div>

        {mode === 'signup' && (
          <div style={{ marginBottom:10 }}>
            <label style={{ display:'block', fontSize:12, color:'#94a3b8', marginBottom:6 }}>Full name</label>
            <input value={name} onChange={e=>setName(e.target.value)} required style={{ width:'100%', padding:'10px', borderRadius:8, border:'1px solid rgba(255,255,255,0.06)', background:'rgba(255,255,255,0.02)', color:'#e2e8f0' }} />
          </div>
        )}

        <div style={{ marginBottom:10 }}>
          <label style={{ display:'block', fontSize:12, color:'#94a3b8', marginBottom:6 }}>Email</label>
          <input type="email" value={email} onChange={e=>setEmail(e.target.value)} required style={{ width:'100%', padding:'10px', borderRadius:8, border:'1px solid rgba(255,255,255,0.06)', background:'rgba(255,255,255,0.02)', color:'#e2e8f0' }} />
        </div>

        <div style={{ marginBottom:12 }}>
          <label style={{ display:'block', fontSize:12, color:'#94a3b8', marginBottom:6 }}>Password</label>
          <input type="password" value={password} onChange={e=>setPassword(e.target.value)} required style={{ width:'100%', padding:'10px', borderRadius:8, border:'1px solid rgba(255,255,255,0.06)', background:'rgba(255,255,255,0.02)', color:'#e2e8f0' }} />
        </div>

        {message && <div style={{ marginBottom:10, color:'#cbd5e1' }}>{message}</div>}

        <div style={{ display:'flex', gap:8, justifyContent:'flex-end' }}>
          <button type="button" onClick={() => onClose && onClose()} style={{ padding:'8px 12px', borderRadius:8, background:'transparent', border:'1px solid rgba(255,255,255,0.06)', color:'#94a3b8', cursor:'pointer' }}>Cancel</button>
          <button type="submit" style={{ padding:'8px 14px', borderRadius:8, background:'linear-gradient(90deg,#1d4ed8,#0ea5e9)', border:'none', color:'#fff', cursor:'pointer' }}>{mode==='signup'?'Create account':'Sign in'}</button>
        </div>
      </form>
    </div>
  )
}
