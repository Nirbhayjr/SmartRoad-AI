"use client"

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import AuthModal from './AuthModal'
import RoadCoinsModal from './RoadCoinsModal'

function Navbar() {
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (mounted && pathname && pathname.startsWith('/admin')) return null;
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  // Admin login modal
  const [showLogin, setShowLogin] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState('')

  // User auth modal
  const [authOpen, setAuthOpen] = useState(false)
  const [coinsOpen, setCoinsOpen] = useState(false)
  const [user, setUser] = useState(null)

  // Load user from localStorage on mount
  useEffect(() => {
    const loadUser = () => {
      try {
        const raw = localStorage.getItem('sr_user')
        setUser(raw ? JSON.parse(raw) : null)
      } catch (_) { setUser(null) }
    }
    loadUser()
  }, [])

  const refreshUser = () => {
    try {
      const raw = localStorage.getItem('sr_user')
      setUser(raw ? JSON.parse(raw) : null)
    } catch (_) { setUser(null) }
  }

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = (showLogin || authOpen || coinsOpen) ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [showLogin, authOpen, coinsOpen])

  const scrollTo = (id) => {
    setMenuOpen(false)
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }

  const handleLogin = (e) => {
    e.preventDefault()
    if (!email || !password) { setLoginError('Please fill in all fields.'); return }
    const m = email.match(/^(.+)@municipal$/i)
    if (m && password === `${m[1]}@123`) {
      window.location.href = '/admin'
      return
    }
    setLoginError('Invalid admin credentials.')
  }

  const closeAdminModal = () => { setShowLogin(false); setLoginError(''); setEmail(''); setPassword('') }

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
            {/* Home */}
            <li>
              <button className="nav-btn-link" onClick={() => {
                setMenuOpen(false)
                const el = document.getElementById('home')
                if (el) el.scrollIntoView({ behavior: 'smooth' })
                else window.location.href = '/'
              }}>Home</button>
            </li>

            {/* Installation */}
            <li><a href="/deployment" className="nav-btn-link" target="_blank" rel="noopener noreferrer">Installation</a></li>

            {/* Navigation */}
            <li><a href="/navigation" className="nav-btn-link" target="_blank" rel="noopener noreferrer">Navigation</a></li>

            {/* Solution */}
            <li><button onClick={() => scrollTo('solution')} className="nav-btn-link">Solution</button></li>

            {/* Team */}
            <li><button onClick={() => scrollTo('team-section')} className="nav-btn-link">Team</button></li>

            {/* ── Sign In / User avatar ── */}
            <li>
              {user ? (
                <button
                  className="nav-user-btn"
                  onClick={() => { setMenuOpen(false); setCoinsOpen(true) }}
                  title="View your profile & coins"
                >
                  <span className="nav-user-avatar">{user.name ? user.name[0].toUpperCase() : '?'}</span>
                  <span>{user.name}</span>
                </button>
              ) : (
                <button
                  className="nav-btn-link"
                  onClick={() => { setMenuOpen(false); setAuthOpen(true) }}
                >
                  Sign In / Sign Up
                </button>
              )}
            </li>

            {/* ── Admin Portal ── */}
            <li>
              <button className="nav-btn-link" onClick={() => {
                setMenuOpen(false)
                const cityRaw = (() => {
                  try {
                    const meta = document.querySelector('meta[name="city"]')
                    if (meta && meta.content) return meta.content
                    const host = window?.location?.hostname || ''
                    if (host && !host.includes('localhost')) return host.split('.')[0]
                  } catch (e) { }
                  return 'City'
                })()
                const city = cityRaw ? (cityRaw.charAt(0).toUpperCase() + cityRaw.slice(1)) : 'City'
                setEmail(`${city}@municipal`)
                setPassword(`${city}@123`)
                setShowLogin(true)
              }}>
                <span>🔒</span> Admin Portal
              </button>
            </li>
          </ul>
        </div>
      </nav>

      {/* ── Admin Login Modal ── */}
      {showLogin && (
        <div className="modal-overlay" onClick={closeAdminModal}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeAdminModal}>✕</button>
            <div className="modal-header">
              <div className="modal-icon">🛡️</div>
              <h2 className="modal-title">Admin Portal</h2>
              <p className="modal-subtitle">Restricted — Municipal officers only</p>
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

      {/* ── User Auth Modal (Sign In / Sign Up) ── */}
      <AuthModal
        open={authOpen}
        onClose={() => { setAuthOpen(false); refreshUser() }}
        onAuth={() => { refreshUser() }}
      />

      {/* ── Road Coins / Profile Modal ── */}
      <RoadCoinsModal
        open={coinsOpen}
        onClose={() => { setCoinsOpen(false); refreshUser() }}
      />
    </>
  )
}

export default Navbar
