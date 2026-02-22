function Benefits() {
  const benefits = [
    {
      icon: '🛡️',
      title: 'Reduced Accidents',
      stat: '60%',
      statLabel: 'fewer road accidents',
      desc: 'Proactive pothole repair before they cause tyre blowouts, vehicle loss-of-control, and pedestrian injuries.'
    },
    {
      icon: '⚡',
      title: 'Faster Repairs',
      stat: '3×',
      statLabel: 'faster repair cycle',
      desc: 'AI-driven work orders with GPS coordinates reach repair crews instantly — no manual paperwork, no delays.'
    },
    {
      icon: '💰',
      title: 'Efficient Budget Use',
      stat: '40%',
      statLabel: 'cost reduction',
      desc: 'Shift from reactive emergency repairs to planned maintenance cycles, reducing per-repair cost by up to 40%.'
    },
    {
      icon: '🤝',
      title: 'Improved Citizen Trust',
      stat: '89%',
      statLabel: 'satisfaction rate',
      desc: 'Transparent tracking portals let citizens see their report status — accountability that builds public trust in governance.'
    },
    {
      icon: '🌆',
      title: 'Smarter Cities',
      stat: '∞',
      statLabel: 'scalability',
      desc: 'A replicable, data-driven infrastructure model that works for Mumbai, Delhi, and any Indian city — regardless of scale.'
    }
  ]

  return (
    <section className="section benefits-section" id="benefits">
      <div className="container">
        <div className="section-header">
          <span className="section-tag">Impact</span>
          <h2 className="section-title">Measurable <span className="accent">Benefits</span></h2>
          <p className="section-subtitle">SmartRoad AI delivers concrete, quantifiable improvements to road safety, municipal efficiency, and citizen experience.</p>
        </div>
        <div className="benefits-grid">
          {benefits.map((b, i) => (
            <div className="glass-card benefit-card" key={i}>
              <div className="benefit-icon">{b.icon}</div>
              <div className="benefit-stat">
                <span className="benefit-num accent-gradient">{b.stat}</span>
                <span className="benefit-stat-label">{b.statLabel}</span>
              </div>
              <h3 className="benefit-title">{b.title}</h3>
              <p className="card-desc">{b.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Benefits
