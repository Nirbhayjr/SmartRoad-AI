"use client"

import { useState, useEffect } from 'react'
import AuthModal from '../components/AuthModal'
import RoadCoinsModal from '../components/RoadCoinsModal'
import Hero from '../components/Hero'
import Problem from '../components/Problem'
import Challenges from '../components/Challenges'
import AISolution from '../components/AISolution'
import Architecture from '../components/Architecture'
import Severity from '../components/Severity'
import Reporting from '../components/Reporting'
import Benefits from '../components/Benefits'
import Team from '../components/Team'

function Home() {
  const [authOpen, setAuthOpen] = useState(false)
  const [coinsOpen, setCoinsOpen] = useState(false)
  const [user, setUser] = useState(null)

  useEffect(()=>{
    try { const raw = localStorage.getItem('sr_user'); if (raw) setUser(JSON.parse(raw)) } catch(e){}
  }, [])

  return (
    <main>
      {/* Sign In button on public home page */}
      <div style={{ position: 'fixed', top: 18, right: 18, zIndex: 1200 }}>
        {user ? (
          <button onClick={()=>setCoinsOpen(true)} style={{ padding: '8px 12px', borderRadius: 10, border: '1px solid rgba(0,0,0,0.08)', background: 'transparent', color: '#fff', cursor: 'pointer' }}>{user.name}</button>
        ) : (
          <button onClick={() => setAuthOpen(true)} style={{ padding: '8px 12px', borderRadius: 10, border: '1px solid rgba(0,0,0,0.08)', background: 'linear-gradient(90deg,#1d4ed8,#0ea5e9)', color: '#fff', cursor: 'pointer' }}>👤 Sign In / Sign Up</button>
        )}
      </div>
      <AuthModal open={authOpen} onClose={() => { setAuthOpen(false); try{ const raw = localStorage.getItem('sr_user'); if(raw) setUser(JSON.parse(raw)) }catch(e){} }} onAuth={(u)=>{ try{ const raw = localStorage.getItem('sr_user'); if(raw) setUser(JSON.parse(raw)) }catch(e){} }} />
      <RoadCoinsModal open={coinsOpen} onClose={() => { setCoinsOpen(false); try{ const raw = localStorage.getItem('sr_user'); if(raw) setUser(JSON.parse(raw)) }catch(e){} }} />

      <Hero />
      <Problem />
      <Challenges />
      <AISolution />
      <Architecture />
      <Severity />
      <Reporting />
      <Benefits />
      <Team />
    </main>
  )
}

export default Home