function Team() {
  const members = [
    {
      name: 'Prem Kumar',
      role: 'Team Leader',
      emoji: '👨‍💻',
      desc: 'Leads project vision, architecture decisions, and system integration. Coordinates between all workstreams to deliver cohesive AI solutions.',
      skills: ['System Architecture', 'AI Strategy', 'Project Management'],
      color: '#3b82f6'
    },
    {
      name: 'Nishu Singh',
      role: 'Co-Lead',
      emoji: '👩‍🔬',
      desc: 'Drives research methodology, dataset curation, and model performance benchmarking. Ensures AI outputs meet real-world accuracy standards.',
      skills: ['Research Design', 'Data Curation', 'Model Evaluation'],
      color: '#8b5cf6'
    },
    {
      name: 'Priyanshu Yadav',
      role: 'Research & Technical Contributor',
      emoji: '🧠',
      desc: 'Deep dives into computer vision algorithms, fine-tuning detection models, and documenting technical specifications for reproducibility.',
      skills: ['Computer Vision', 'Deep Learning', 'Documentation'],
      color: '#06b6d4'
    },
    {
      name: 'Nirbhay Kumar',
      role: 'Implementation & Testing',
      emoji: '🔧',
      desc: 'Responsible for end-to-end system deployment, QA testing across edge cases, and performance optimization in production environments.',
      skills: ['DevOps', 'QA Testing', 'Performance Tuning'],
      color: '#10b981'
    },
    {
      name: 'Jayram Kumar',
      role: 'Frontend & Integration',
      emoji: '🎨',
      desc: 'Crafts the user-facing interfaces and ensures seamless integration between AI backend services and the municipal reporting dashboard.',
      skills: ['UI Development', 'API Integration', 'Responsive Design'],
      color: '#f59e0b'
    }
  ]

  return (
    <section className="section team-section" id="team-section">
      <div className="container">
        <div className="section-header">
          <span className="section-tag">The People</span>
          <h2 className="section-title">Meet the <span className="accent">Team</span></h2>
          <p className="section-subtitle">Four dedicated engineers united by a mission to make Indian roads safer through the power of artificial intelligence.</p>
        </div>
        <div className="cards-grid cards-5">
          {members.map((m, i) => (
            <div className="glass-card team-card" key={i} style={{ '--team-color': m.color }}>
              <div className="team-avatar" style={{ background: `linear-gradient(135deg, ${m.color}33, ${m.color}11)`, borderColor: m.color + '44' }}>
                <span className="team-emoji">{m.emoji}</span>
              </div>
              <h3 className="team-name">{m.name}</h3>
              <span className="team-role" style={{ color: m.color }}>{m.role}</span>
              <p className="team-desc">{m.desc}</p>
              <div className="team-skills">
                {m.skills.map((s, j) => (
                  <span className="skill-tag" key={j} style={{ borderColor: m.color + '44', color: m.color }}>{s}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Team
