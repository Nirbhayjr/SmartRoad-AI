function Reporting() {
  const steps = [
    {
      step: '01',
      icon: '📱',
      title: 'Citizen Upload',
      desc: 'Any citizen captures road damage via smartphone and uploads through our web app or WhatsApp bot — no registration required.',
      color: '#3b82f6'
    },
    {
      step: '02',
      icon: '🤖',
      title: 'AI Validation',
      desc: "Our model verifies the image contains actual road damage, filters blurry or irrelevant uploads, and classifies the damage type and severity automatically.",
      color: '#8b5cf6'
    },
    {
      step: '03',
      icon: '🔽',
      title: 'Smart Filtering',
      desc: 'Duplicate submissions are merged, spam is eliminated, and reports from the same location within 48 hours are consolidated into a single actionable alert.',
      color: '#06b6d4'
    },
    {
      step: '04',
      icon: '📍',
      title: 'Location Verification',
      desc: 'GPS metadata is extracted, cross-referenced with city road maps, and assigned to the correct municipal ward for immediate dispatch to the responsible team.',
      color: '#10b981'
    }
  ]

  return (
    <section className="section reporting-section" id="reporting">
      <div className="container">
        <div className="section-header">
          <span className="section-tag">Citizen Participation</span>
          <h2 className="section-title">Crowdsourced <span className="accent">Reporting</span> System</h2>
          <p className="section-subtitle">Turning every citizen into a road inspector — validated, de-duplicated, and geo-verified reports flowing directly to municipal teams.</p>
        </div>
        <div className="reporting-flow">
          {steps.map((step, i) => (
            <div className="reporting-step" key={i}>
              <div className="step-connector-wrap">
                <div className="step-node" style={{ '--step-color': step.color }}>
                  <span className="step-icon">{step.icon}</span>
                  <div className="step-pulse"></div>
                </div>
                {i < steps.length - 1 && <div className="step-line" style={{ '--step-color': step.color }}></div>}
              </div>
              <div className="glass-card step-card">
                <div className="step-header">
                  <span className="step-number" style={{ color: step.color }}>{step.step}</span>
                  <h4 className="step-title">{step.title}</h4>
                </div>
                <p className="step-desc">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Reporting
