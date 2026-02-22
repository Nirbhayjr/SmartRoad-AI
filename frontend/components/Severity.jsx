function Severity() {
  const levels = [
    {
      color: '#22c55e',
      glow: 'rgba(34,197,94,0.3)',
      level: 'Level 1',
      label: 'Minor Crack',
      icon: '🟢',
      desc: 'Surface hairline cracks with no structural compromise. Road remains safe for normal traffic. Scheduled for next maintenance cycle.',
      action: 'Monitor & Schedule',
      urgency: 'Within 30 days',
      metrics: [
        { label: 'Depth', value: '< 2cm' },
        { label: 'Width', value: '< 5mm' },
        { label: 'Risk', value: 'Low' }
      ]
    },
    {
      color: '#eab308',
      glow: 'rgba(234,179,8,0.3)',
      level: 'Level 2',
      label: 'Moderate Damage',
      icon: '🟡',
      desc: 'Visible potholes causing vehicle discomfort. Risk of tyre damage and suspension wear. Requires prioritized repair before deterioration.',
      action: 'Priority Repair',
      urgency: 'Within 7 days',
      metrics: [
        { label: 'Depth', value: '2–10cm' },
        { label: 'Width', value: '5–30cm' },
        { label: 'Risk', value: 'Medium' }
      ]
    },
    {
      color: '#ef4444',
      glow: 'rgba(239,68,68,0.3)',
      level: 'Level 3',
      label: 'Dangerous Pothole',
      icon: '🔴',
      desc: 'Deep structural failure posing immediate safety hazard. High probability of accidents, vehicle damage, and injury. Emergency response required.',
      action: 'Emergency Response',
      urgency: 'Within 24 hours',
      metrics: [
        { label: 'Depth', value: '> 10cm' },
        { label: 'Width', value: '> 30cm' },
        { label: 'Risk', value: 'Critical' }
      ]
    }
  ]

  return (
    <section className="section severity-section" id="severity">
      <div className="container">
        <div className="section-header">
          <span className="section-tag">Classification Engine</span>
          <h2 className="section-title">AI Severity <span className="accent">Classification</span></h2>
          <p className="section-subtitle">Our model doesn't just detect — it diagnoses. Each detection is scored across multiple dimensions to determine urgency and resource requirements.</p>
        </div>
        <div className="cards-grid cards-3">
          {levels.map((level, i) => (
            <div
              className="glass-card severity-card"
              key={i}
              style={{ '--sev-color': level.color, '--sev-glow': level.glow }}
            >
              <div className="severity-header">
                <div className="severity-badge" style={{ background: level.color }}>
                  {level.level}
                </div>
                <span className="severity-icon">{level.icon}</span>
              </div>
              <h3 className="severity-label" style={{ color: level.color }}>{level.label}</h3>
              <p className="card-desc">{level.desc}</p>
              <div className="severity-metrics">
                {level.metrics.map((m, j) => (
                  <div className="severity-metric" key={j}>
                    <span className="metric-label">{m.label}</span>
                    <span className="metric-value" style={{ color: level.color }}>{m.value}</span>
                  </div>
                ))}
              </div>
              <div className="severity-action" style={{ borderColor: level.color }}>
                <span className="action-label">Action:</span>
                <span className="action-value" style={{ color: level.color }}>{level.action}</span>
                <span className="action-urgency">{level.urgency}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Severity
