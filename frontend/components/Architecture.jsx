function Architecture() {
  const steps = [
    { icon: '📷', label: 'Camera / Upload', desc: 'Video input', color: '#3b82f6' },
    { icon: '☁️', label: 'Cloud Upload', desc: 'Secure transfer', color: '#8b5cf6' },
    { icon: '⚙️', label: 'AI Processing', desc: 'Frame analysis', color: '#06b6d4' },
    { icon: '🎯', label: 'Detection', desc: 'Pothole found', color: '#10b981' },
    { icon: '🚦', label: 'Severity', desc: 'Risk scoring', color: '#f59e0b' },
    { icon: '📊', label: 'Dashboard', desc: 'Live reporting', color: '#ef4444' },
  ]

  return (
    <section className="section arch-section" id="architecture">
      <div className="container">
        <div className="section-header">
          <span className="section-tag">System Design</span>
          <h2 className="section-title">Technical <span className="accent">Architecture</span></h2>
          <p className="section-subtitle">End-to-end pipeline from raw camera feed to municipal repair order — fully automated, real-time, and scalable.</p>
        </div>
        <div className="arch-flow">
          {steps.map((step, i) => (
            <div className="arch-flow-item" key={i}>
              <div className="arch-node" style={{ '--node-color': step.color }}>
                <div className="arch-node-inner">
                  <span className="arch-node-icon">{step.icon}</span>
                </div>
                <div className="arch-node-ring"></div>
              </div>
              <div className="arch-label">
                <span className="arch-label-main">{step.label}</span>
                <span className="arch-label-sub">{step.desc}</span>
              </div>
              {i < steps.length - 1 && (
                <div className="arch-connector">
                  <div className="connector-line"></div>
                  <div className="connector-arrow">›</div>
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="arch-note">
          <span className="arch-note-icon">⚡</span>
          Average end-to-end processing time: <strong>2.8 seconds</strong> from upload to detection report
        </div>
      </div>
    </section>
  )
}

export default Architecture
