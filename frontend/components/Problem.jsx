function Problem() {
  const problems = [
    {
      icon: '💥',
      stat: '1.5 Lakh+',
      title: 'Rising Accidents & Vehicle Damage',
      desc: 'India records over 1.5 lakh road accident deaths annually. Potholes contribute significantly to tyre blowouts, suspension failures, and fatal accidents across urban and rural roads.',
      color: '#ef4444'
    },
    {
      icon: '💸',
      stat: '₹3000 Cr+',
      title: 'Financial Loss Due to Potholes',
      desc: 'The Indian economy loses thousands of crores annually due to road damage — vehicle repair costs, delayed goods transport, and inefficient municipal spending on reactive maintenance.',
      color: '#f59e0b'
    },
    {
      icon: '⚠️',
      stat: '40% Roads',
      title: 'Poor Road Safety Standards',
      desc: 'Nearly 40% of Indian roads are below acceptable safety standards. Without real-time monitoring systems, deterioration goes undetected until catastrophic failure or citizen complaint.',
      color: '#3b82f6'
    }
  ]

  return (
    <section className="section problem-section" id="problem">
      <div className="container">
        <div className="section-header">
          <span className="section-tag">The Crisis</span>
          <h2 className="section-title">India's Road Problem is <span className="accent">Massive</span></h2>
          <p className="section-subtitle">Every year, deteriorating road infrastructure costs lives, damages vehicles, and drains municipal budgets — all preventable with intelligent monitoring.</p>
        </div>
        <div className="cards-grid cards-3">
          {problems.map((p, i) => (
            <div className="glass-card problem-card" key={i} style={{ '--card-accent': p.color }}>
              <div className="problem-icon">{p.icon}</div>
              <div className="problem-stat" style={{ color: p.color }}>{p.stat}</div>
              <h3 className="card-title">{p.title}</h3>
              <p className="card-desc">{p.desc}</p>
              <div className="card-accent-line" style={{ background: p.color }}></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Problem
