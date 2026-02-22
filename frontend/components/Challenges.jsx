function Challenges() {
  const left = [
    { icon: '🔍', title: 'Manual Inspection', desc: 'Road officials physically drive routes to identify damage — slow, inconsistent, and heavily dependent on human judgment. Coverage is sparse and periodic at best.' },
    { icon: '📋', title: 'Paper-Based Reporting', desc: 'Complaints logged via paper forms or rudimentary portals get lost in bureaucratic queues, with no tracking, verification, or prioritization mechanism.' },
    { icon: '🗺️', title: 'No Geo-Mapping', desc: 'Without precise GPS-tagged damage records, repair teams waste time locating potholes and municipalities lack data-driven insights for budget allocation.' },
  ]
  const right = [
    { icon: '⏳', title: 'Delayed Response', desc: 'Average repair time stretches weeks or months due to approval chains, contractor scheduling conflicts, and poor coordination between departments.' },
    { icon: '📉', title: 'No Severity Prioritization', desc: 'All damage reports are treated equally, causing dangerous potholes to wait behind cosmetic crack repairs — a fundamentally backwards allocation of resources.' },
    { icon: '💰', title: 'Budget Misallocation', desc: 'Without data, municipalities spend reactively rather than strategically. Emergency repairs cost 3–5x more than proactive scheduled maintenance.' },
  ]

  return (
    <section className="section challenges-section" id="challenges">
      <div className="container">
        <div className="section-header">
          <span className="section-tag">Current Reality</span>
          <h2 className="section-title">Why Traditional Methods <span className="accent">Fail</span></h2>
          <p className="section-subtitle">The gap between infrastructure need and institutional response is widening. Here's why the status quo is unsustainable.</p>
        </div>
        <div className="challenges-grid">
          <div className="challenges-col">
            {left.map((item, i) => (
              <div className="challenge-item" key={i}>
                <div className="challenge-icon-wrap">{item.icon}</div>
                <div className="challenge-content">
                  <h4>{item.title}</h4>
                  <p>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="challenges-center">
            <div className="vs-circle">
              <span>VS</span>
              <div className="vs-label">Traditional</div>
              <div className="vs-label vs-label-2">Smart AI</div>
            </div>
          </div>
          <div className="challenges-col">
            {right.map((item, i) => (
              <div className="challenge-item challenge-item-right" key={i}>
                <div className="challenge-icon-wrap challenge-icon-right">{item.icon}</div>
                <div className="challenge-content">
                  <h4>{item.title}</h4>
                  <p>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default Challenges
