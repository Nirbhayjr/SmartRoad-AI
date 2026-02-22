function AISolution() {
  const solutions = [
    {
      icon: '📷',
      number: '01',
      title: 'Automated Data Capture',
      desc: 'Dashcam footage, drone imagery, and citizen uploads feed continuously into our pipeline. No manual inspection required — the city becomes its own sensor network.',
      features: ['CCTV Integration', 'Drone Feeds', 'Crowdsourced Uploads', '24/7 Monitoring']
    },
    {
      icon: '🧠',
      number: '02',
      title: 'Intelligent AI Analysis',
      desc: 'Our deep learning model — trained on 500K+ Indian road images — detects, classifies, and geo-tags damage with 98.2% accuracy in under 3 seconds per frame.',
      features: ['YOLOv8 Detection', 'Severity Scoring', 'GPS Tagging', 'Real-time Processing']
    },
    {
      icon: '🛠️',
      number: '03',
      title: 'Proactive Repair Planning',
      desc: 'AI-generated repair schedules prioritize by severity and traffic impact. Municipal teams receive precise work orders with location, materials estimate, and urgency rating.',
      features: ['Auto Prioritization', 'Budget Forecasting', 'Contractor Assignment', 'Progress Tracking']
    }
  ]

  return (
    <section className="section ai-section" id="solution">
      <div className="container">
        <div className="section-header">
          <span className="section-tag">Our Approach</span>
          <h2 className="section-title">The <span className="accent">AI Solution</span> Pipeline</h2>
          <p className="section-subtitle">Three integrated stages transform raw video into actionable repair intelligence — automatically, accurately, and at city scale.</p>
        </div>
        <div className="cards-grid cards-3">
          {solutions.map((s, i) => (
            <div className="glass-card ai-card" key={i}>
              <div className="ai-card-header">
                <span className="ai-number">{s.number}</span>
                <span className="ai-icon">{s.icon}</span>
              </div>
              <h3 className="card-title">{s.title}</h3>
              <p className="card-desc">{s.desc}</p>
              <ul className="feature-list">
                {s.features.map((f, j) => (
                  <li key={j}><span className="feature-dot">◆</span>{f}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default AISolution
