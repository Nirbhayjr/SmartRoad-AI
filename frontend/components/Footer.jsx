function Footer() {
  return (
    <footer className="footer">
      <div className="footer-glow"></div>
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <div className="footer-logo">
              <span className="logo-icon">⬡</span>
              <span>SmartRoad <em>AI</em></span>
            </div>
            <p className="footer-tagline">AI-powered road damage detection for safer Indian cities. Built with passion at the intersection of technology and public good.</p>
            <div className="footer-badges">
              <span className="footer-badge">🏆 Enyugma 2026</span>
              <span className="footer-badge">🇮🇳 Made in India</span>
            </div>
          </div>

          <div className="footer-links-group">
            <h4 className="footer-heading">Navigation</h4>
            <ul className="footer-links">
              <li><a href="#home">Home</a></li>
              <li><a href="#problem">Problem</a></li>
              <li><a href="#solution">AI Solution</a></li>
              <li><a href="#severity">Severity</a></li>
              <li><a href="#dashboard">Dashboard</a></li>
            </ul>
          </div>

          <div className="footer-links-group">
            <h4 className="footer-heading">Technology</h4>
            <ul className="footer-links">
              <li><span>YOLOv8 Detection</span></li>
              <li><span>Computer Vision</span></li>
              <li><span>GPS Geotagging</span></li>
              <li><span>React Frontend</span></li>
              <li><span>Cloud Processing</span></li>
            </ul>
          </div>

          <div className="footer-links-group">
            <h4 className="footer-heading">Contact & Links</h4>
            <ul className="footer-links footer-contact">
              <li>
                <span className="contact-icon">📧</span>
                <a href="mailto:team@smartroad.ai">team@smartroad.ai</a>
              </li>
              <li>
                <span className="contact-icon">🐙</span>
                <a href="https://github.com/Nirbhayjr/smart-road" target="_blank" rel="noreferrer">GitHub Repository</a>
              </li>
              <li>
                <span className="contact-icon">🏆</span>
                <span>Enyugma 2026 — IIIT Bhagalpur Hackathon</span>
              </li>
              <li>
                <span className="contact-icon">📍</span>
                <span>India</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© 2026 SmartRoad AI — Built for Enyugma 2026, IIIT Bhagalpur Hackathon. All rights reserved.</p>
          <p className="footer-team">Made with ❤️ by Prem Kumar, Nishu Singh, Priyanshu Yadav, Nirbhay Kumar & Jayram Kumar</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
