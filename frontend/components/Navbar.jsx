"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

function Navbar() {
  const pathname = usePathname ? usePathname() : '';
  // Hide global navbar on admin routes
  if (pathname && pathname.startsWith('/admin')) return null;
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [showLogin, setShowLogin] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [loginMode, setLoginMode] = useState('user')

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = showLogin ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [showLogin])

  const scrollTo = (id) => {
    setMenuOpen(false)
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }

  const handleLogin = (e) => {
    e.preventDefault()
    if (!email || !password) { setLoginError('Please fill in all fields.'); return }
    const m = email.match(/^(.+)@municipal$/i)
    if (m) {
      const cityPart = m[1]
      if (password === `${cityPart}@123`) {
        window.location.href = '/admin'
        return
      }
    }
    setLoginError('Invalid admin credentials.')
  }

  const closeModal = () => { setShowLogin(false); setLoginError(''); setEmail(''); setPassword('') }

  return (
    <>
      <nav className={`navbar ${scrolled ? 'navbar-scrolled' : ''}`}>
        <div className="navbar-container">
          <div className="navbar-logo" style={{ cursor: 'pointer' }} onClick={() => {
            setMenuOpen(false)
            const el = document.getElementById('home')
            if (el) el.scrollIntoView({ behavior: 'smooth' })
            else window.location.href = '/'
          }}>
            <span className="logo-icon">⬡</span>
            <span className="logo-text">SmartRoad <em>AI</em></span>
          </div>

          <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">
            <span className={`bar ${menuOpen ? 'open' : ''}`}></span>
            <span className={`bar ${menuOpen ? 'open' : ''}`}></span>
            <span className={`bar ${menuOpen ? 'open' : ''}`}></span>
          </button>

          <ul className={`navbar-links ${menuOpen ? 'menu-open' : ''}`}>
            <li><button className="nav-btn-link" onClick={() => { setMenuOpen(false); const el = document.getElementById('home'); if (el) el.scrollIntoView({ behavior: 'smooth' }); else window.location.href = '/' }}>Home</button></li>
            <li><a href="/deployment" className="nav-btn-link" target="_blank" rel="noopener noreferrer">Installation</a></li>
            <li><a href="/navigation" className="nav-btn-link" target="_blank" rel="noopener noreferrer">Navigation</a></li>
            <li><button onClick={() => scrollTo('solution')} className="nav-btn-link">Solution</button></li>
            <li><button onClick={() => scrollTo('team-section')} className="nav-btn-link">Team</button></li>
            <li>
              <button className="nav-admin-btn" onClick={() => {
                setMenuOpen(false)
                const cityRaw = (() => {
                  try {
                    const meta = document.querySelector('meta[name="city"]')
                    if (meta && meta.content) return meta.content
                    const host = window?.location?.hostname || ''
                    if (host && !host.includes('localhost')) return host.split('.')[0]
                  } catch (e) {}
                  return 'City'
                })()
                const city = cityRaw ? (cityRaw.charAt(0).toUpperCase() + cityRaw.slice(1)) : 'City'
                setEmail(`${city}@municipal`)
                setPassword(`${city}@123`)
                setLoginMode('admin')
                setShowLogin(true)
              }}>
                <span>🔒</span> Admin Portal
              </button>
            </li>
          </ul>

          
        </div>
      </nav>

      {showLogin && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeModal}>✕</button>
            <div className="modal-header">
              <div className="modal-icon">🛡️</div>
              <h2 className="modal-title">{loginMode === 'admin' ? 'Admin Portal' : 'User Login'}</h2>
              <p className="modal-subtitle">{loginMode === 'admin' ? 'Restricted — Municipal officers only' : 'Sign in to your account'}</p>
            </div>
            <form className="login-form" onSubmit={handleLogin}>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input className="form-input" type="email" placeholder="admin@smartroad.gov.in"
                  value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
              </div>
              <div className="form-group">
                <label className="form-label">Password</label>
                <input className="form-input" type="password" placeholder="••••••••"
                  value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
              </div>
              {loginError && <div className="login-error">{loginError}</div>}
              <button type="submit" className="login-submit">Sign In to Dashboard →</button>
              <p className="login-note">Access is monitored and logged for security compliance.</p>
            </form>
          </div>
        </div>
      )}
    </>
  )
}

export default Navbar
