'use client'

import { useRef } from 'react'
import { useRouter } from 'next/navigation'

function Hero() {
  const fileInputRef = useRef(null)
  const router = useRouter()

  const scrollTo = (id) => {
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }

  const handleUploadClick = () => {
    router.push('/volunteer')
  }

  const handleDemoClick = () => {
    router.push('/demo')
  }

  const handleFileChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    // Scroll to results/upload section
    scrollTo('upload-section')

    const formData = new FormData()
    formData.append('file', file)

    try {
      const res = await fetch('http://localhost:5000/detect', {
        method: 'POST',
        body: formData,
      })
      const data = await res.json()
      console.log('Detection result:', data)
      // TODO: pass `data` to your results component
    } catch (err) {
      console.error('Upload failed:', err)
    }
  }

  return (
    <section className="hero" id="home">
      <div className="hero-bg">
        <div className="grid-overlay"></div>
        <div className="orb orb-1"></div>
        <div className="orb orb-2"></div>
        <div className="orb orb-3"></div>
      </div>
      <div className="hero-content">
        <div className="hero-badge">
          <span className="badge-dot"></span>
          AI-Powered Infrastructure Intelligence
        </div>
        <h1 className="hero-title">
          <span className="title-line">AI-Powered</span>
          <span className="title-line accent-gradient">Smart Road</span>
          <span className="title-line">Monitoring System</span>
        </h1>
        <p className="hero-subtitle">
          Pothole Detection & Road Damage Classification for Indian Cities —
          transforming reactive maintenance into proactive infrastructure management.
        </p>
        <div className="hero-stats">
          <div className="stat">
            <span className="stat-num">3.5M+</span>
            <span className="stat-label">Potholes Detected</span>
          </div>
          <div className="stat-divider"></div>
          <div className="stat">
            <span className="stat-num">98.2%</span>
            <span className="stat-label">AI Accuracy</span>
          </div>
          <div className="stat-divider"></div>
          <div className="stat">
            <span className="stat-num">72hr</span>
            <span className="stat-label">Avg. Repair Time</span>
          </div>
        </div>
        <div className="hero-buttons">
          <button className="btn-primary" onClick={handleUploadClick}>
            <span className="btn-icon">▲</span> Report with image or video
          </button>
          <button className="btn-secondary" onClick={handleDemoClick}>
            <span className="btn-icon">▶</span> Live Demo
          </button>
          <button className="btn-secondary" onClick={() => scrollTo('solution')}>
            <span className="btn-icon">⬡</span> Explore Solution
          </button>
        </div>
        <div className="hero-scroll-hint">
          <span>Scroll to explore</span>
          <div className="scroll-line"></div>
        </div>
      </div>
    </section>
  )
}

export default Hero