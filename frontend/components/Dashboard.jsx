function Dashboard() {
  const stats = [
    { label: 'Total Reports', value: '12,847', change: '+234 today', up: true, color: '#3b82f6' },
    { label: 'Active Potholes', value: '3,291', change: '-18 fixed', up: false, color: '#ef4444' },
    { label: 'Repairs Completed', value: '9,556', change: '+47 today', up: true, color: '#22c55e' },
    { label: 'Avg Response Time', value: '38hrs', change: '-2hrs this week', up: false, color: '#f59e0b' },
  ]

  const repairs = [
    { id: 'MH-001', location: 'Bandra-Kurla Complex, Mumbai', severity: 'Critical', status: 'In Progress', progress: 65 },
    { id: 'DL-042', location: 'Connaught Place, New Delhi', severity: 'High', status: 'Assigned', progress: 20 },
    { id: 'BLR-117', location: 'Koramangala, Bengaluru', severity: 'Medium', status: 'Completed', progress: 100 },
    { id: 'HYD-089', location: 'Hitech City, Hyderabad', severity: 'High', status: 'In Progress', progress: 45 },
    { id: 'CH-023', location: 'Anna Nagar, Chennai', severity: 'Low', status: 'Scheduled', progress: 5 },
  ]

  const severityColor = (s) => ({
    Critical: '#ef4444', High: '#f59e0b', Medium: '#eab308', Low: '#22c55e'
  })[s] || '#888'

  const statusColor = (s) => ({
    'In Progress': '#3b82f6', 'Assigned': '#8b5cf6', 'Completed': '#22c55e', 'Scheduled': '#06b6d4'
  })[s] || '#888'

  return (
    <section className="section dashboard-section" id="dashboard">
      <div className="container">
        <div className="section-header">
          <span className="section-tag">Command Center</span>
          <h2 className="section-title">Municipal <span className="accent">Dashboard</span> Preview</h2>
          <p className="section-subtitle">Real-time visibility across every pothole, every ward, every repair — all in one command center.</p>
        </div>

        <div className="dashboard-wrapper glass-card">
          {/* Header bar */}
          <div className="dash-topbar">
            <div className="dash-title-row">
              <div className="dash-status-dot"></div>
              <span className="dash-live">LIVE</span>
              <span className="dash-title-text">SmartRoad Municipal Operations Center</span>
            </div>
            <div className="dash-meta">
              <span>Mumbai Metropolitan Region</span>
              <span className="dash-time">Updated: Just now</span>
            </div>
          </div>

          {/* Stats */}
          <div className="dash-stats">
            {stats.map((s, i) => (
              <div className="dash-stat-card" key={i}>
                <span className="dash-stat-label">{s.label}</span>
                <span className="dash-stat-value" style={{ color: s.color }}>{s.value}</span>
                <span className={`dash-stat-change ${s.up ? 'up' : 'down'}`}>{s.change}</span>
              </div>
            ))}
          </div>

          {/* Map + Table */}
          <div className="dash-body">
            {/* Map Placeholder */}
            <div className="dash-map">
              <div className="map-placeholder">
                <div className="map-grid"></div>
                <div className="map-pin pin-1">📍</div>
                <div className="map-pin pin-2">📍</div>
                <div className="map-pin pin-3">📍</div>
                <div className="map-pin pin-4">📍</div>
                <div className="map-pin pin-5">📍</div>
                <div className="map-overlay-text">
                  <span>🗺️</span>
                  <span>Live Geo Map</span>
                  <span className="map-sub">GPS-Tagged Damage Points</span>
                </div>
              </div>
              <div className="map-legend">
                <span className="legend-item"><span className="legend-dot" style={{ background: '#ef4444' }}></span>Critical</span>
                <span className="legend-item"><span className="legend-dot" style={{ background: '#f59e0b' }}></span>High</span>
                <span className="legend-item"><span className="legend-dot" style={{ background: '#22c55e' }}></span>Resolved</span>
              </div>
            </div>

            {/* Repair Tracking */}
            <div className="dash-table-wrap">
              <div className="dash-table-header">
                <h4>Repair Status Tracking</h4>
                <span className="dash-filter">Filter ▾</span>
              </div>
              <div className="dash-table">
                {repairs.map((r, i) => (
                  <div className="dash-row" key={i}>
                    <div className="dash-row-id">{r.id}</div>
                    <div className="dash-row-loc">{r.location}</div>
                    <div className="dash-row-sev" style={{ color: severityColor(r.severity) }}>
                      {r.severity}
                    </div>
                    <div className="dash-row-status">
                      <span className="status-badge" style={{ background: statusColor(r.status) + '22', color: statusColor(r.status), borderColor: statusColor(r.status) }}>
                        {r.status}
                      </span>
                    </div>
                    <div className="dash-row-progress">
                      <div className="progress-bar">
                        <div
                          className="progress-fill"
                          style={{ width: `${r.progress}%`, background: statusColor(r.status) }}
                        ></div>
                      </div>
                      <span className="progress-pct">{r.progress}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Dashboard
