import { useNavigate } from "react-router-dom";
import aimLogo from "../assets/aim-logo1.png";

export default function Placement() {
  const navigate = useNavigate();

  return (
    <div style={styles.page}>
      {/* Ambient starfield */}
      <div style={styles.starField}>
        {STARS.map((s, i) => (
          <span
            key={i}
            style={{
              position: "absolute",
              top: s.top,
              left: s.left,
              width: s.size,
              height: s.size,
              borderRadius: "50%",
              background: "#5eead4",
              opacity: s.opacity,
              boxShadow: `0 0 ${s.size * 4}px rgba(94, 234, 212, ${s.opacity})`,
            }}
          />
        ))}
      </div>
      <svg style={styles.arcField} viewBox="0 0 1700 950" preserveAspectRatio="none">
        <circle cx="1850" cy="900" r="520" fill="none" stroke="rgba(52,211,153,0.14)" strokeWidth="1" />
        <circle cx="1850" cy="900" r="680" fill="none" stroke="rgba(52,211,153,0.09)" strokeWidth="1" />
        <circle cx="1850" cy="900" r="840" fill="none" stroke="rgba(52,211,153,0.06)" strokeWidth="1" />
      </svg>

      <div style={styles.container}>
        {/* Navbar */}
        <header style={styles.navbar}>
          <img 
            src={aimLogo} 
            alt="AIM" 
            style={styles.logoImg}
            onClick={() => navigate("/dashboard")}
            className="logo-home"
          />

          <button
            className="signout-btn"
            onClick={() => {
              localStorage.clear();
              navigate("/");
            }}
            style={styles.logoutBtn}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" strokeLinecap="round" strokeLinejoin="round"/>
              <polyline points="16 17 21 12 16 7" strokeLinecap="round" strokeLinejoin="round"/>
              <line x1="21" y1="12" x2="9" y2="12" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Sign Out
          </button>
        </header>

        {/* Main Content */}
        <div style={styles.contentWrapper}>
          <div style={styles.header}>
            <div style={styles.headerLeft}>
              <div style={styles.titleWrapper}>
                <h2 style={styles.title}>💼 Placement Guide</h2>
                <p style={styles.subtitle}>Career guidance and placement resources</p>
              </div>
            </div>
          </div>

          {/* Coming Soon Section */}
          <div style={styles.heroSection}>
            <div style={styles.heroContent}>
              <div style={styles.heroIcon}>🚀</div>
              <h1 style={styles.heroTitle}>Placement Guide</h1>
              <p style={styles.heroSubtitle}>Coming Soon</p>
              <p style={styles.heroDescription}>
                We're building a comprehensive placement guide to help you prepare for your career journey.
                This section will include interview tips, resume building resources, company profiles,
                and placement preparation materials.
              </p>

              <div style={styles.featureGrid}>
                

                

                <div style={styles.featureCard}>
                  <span style={styles.featureIcon}>🏢</span>
                  <h4 style={styles.featureTitle}>Company Profiles</h4>
                  <p style={styles.featureDesc}>Learn about top recruiters and their hiring processes</p>
                </div>

                <div style={styles.featureCard}>
                  <span style={styles.featureIcon}>📊</span>
                  <h4 style={styles.featureTitle}>Placement Stats</h4>
                  <p style={styles.featureDesc}>View placement records and success stories</p>
                </div>
              </div>
            </div>
          </div>

          {/* Under Development Notice */}
          <div style={styles.noticeCard}>
            <div style={styles.noticeContent}>
              <span style={styles.noticeIcon}>⚡</span>
              <div>
                <h4 style={styles.noticeTitle}>Under Development</h4>
                <p style={styles.noticeText}>
                  This page is currently being developed. We're working on bringing you the best placement resources.
                  Check back soon for updates!
                </p>
              </div>
            </div>
            <div style={styles.progressBar}>
              <div style={styles.progressFill}></div>
            </div>
          </div>

         
            
          
            
          </div>
        </div>
      </div>
    
  );
}

/* ---------- decorative star positions ---------- */
const STARS = [
  { top: "9%", left: "73%", size: 2, opacity: 0.55 },
  { top: "16%", left: "92%", size: 2, opacity: 0.5 },
  { top: "28%", left: "67%", size: 2.5, opacity: 0.65 },
  { top: "35%", left: "88%", size: 2, opacity: 0.45 },
  { top: "44%", left: "57%", size: 2, opacity: 0.5 },
  { top: "54%", left: "73%", size: 2.5, opacity: 0.65 },
  { top: "64%", left: "55%", size: 2, opacity: 0.45 },
  { top: "73%", left: "88%", size: 2, opacity: 0.55 },
  { top: "81%", left: "64%", size: 2, opacity: 0.5 },
];

const styles = {
  page: {
    minHeight: "100vh",
    background: "#050907",
    position: "relative",
    overflow: "hidden",
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  },
  starField: {
    position: "absolute",
    inset: 0,
    pointerEvents: "none",
    zIndex: 0,
  },
  arcField: {
    position: "absolute",
    inset: 0,
    width: "100%",
    height: "100%",
    pointerEvents: "none",
    zIndex: 0,
  },
  container: {
    maxWidth: "1400px",
    margin: "0 auto",
    padding: "32px 48px",
    position: "relative",
    zIndex: 2,
  },
  navbar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px 24px",
    marginBottom: "32px",
    background: "rgba(8, 14, 11, 0.6)",
    backdropFilter: "blur(12px)",
    border: "1px solid rgba(52, 211, 153, 0.12)",
    borderRadius: "16px",
    boxShadow: "0 4px 24px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(52, 211, 153, 0.05)",
  },
  logoImg: {
    height: "84px",
    width: "auto",
    display: "block",
    cursor: "pointer",
    transition: "all 0.25s ease",
  },
  logoutBtn: {
    display: "flex",
    alignItems: "center",
    gap: "9px",
    padding: "10px 20px",
    background: "rgba(255, 255, 255, 0.03)",
    border: "1px solid rgba(52, 211, 153, 0.15)",
    borderRadius: "10px",
    color: "#34d399",
    fontSize: "14px",
    fontWeight: "500",
    cursor: "pointer",
    fontFamily: "inherit",
    transition: "all 0.25s ease",
  },
  contentWrapper: {
    background: "rgba(8, 16, 13, 0.6)",
    backdropFilter: "blur(14px)",
    borderRadius: "20px",
    border: "1px solid rgba(52, 211, 153, 0.08)",
    padding: "32px",
    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.35)",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "32px",
    flexWrap: "wrap",
    gap: "24px",
    padding: "8px 0",
  },
  headerLeft: {
    display: "flex",
    alignItems: "center",
    gap: "20px",
    flex: 1,
    minWidth: "0",
  },
  titleWrapper: {
    display: "flex",
    flexDirection: "column",
    gap: "2px",
  },
  title: {
    color: "#ffffff",
    fontSize: "28px",
    fontWeight: "700",
    margin: 0,
    letterSpacing: "-0.5px",
    lineHeight: "1.2",
  },
  subtitle: {
    color: "rgba(255,255,255,0.45)",
    fontSize: "14px",
    margin: 0,
    fontWeight: "400",
    letterSpacing: "0.2px",
  },
  heroSection: {
    background: "rgba(52, 211, 153, 0.03)",
    border: "1px solid rgba(52, 211, 153, 0.08)",
    borderRadius: "16px",
    padding: "48px 40px",
    marginBottom: "24px",
    textAlign: "center",
  },
  heroContent: {
    maxWidth: "800px",
    margin: "0 auto",
  },
  heroIcon: {
    fontSize: "64px",
    marginBottom: "16px",
    display: "block",
  },
  heroTitle: {
    color: "#ffffff",
    fontSize: "36px",
    fontWeight: "700",
    margin: "0 0 8px 0",
    letterSpacing: "-0.5px",
  },
  heroSubtitle: {
    color: "#34d399",
    fontSize: "20px",
    fontWeight: "500",
    margin: "0 0 16px 0",
  },
  heroDescription: {
    color: "rgba(255,255,255,0.55)",
    fontSize: "16px",
    lineHeight: "1.7",
    margin: "0 0 32px 0",
  },
  featureGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "16px",
  },
  featureCard: {
    background: "rgba(255,255,255,0.02)",
    border: "1px solid rgba(52, 211, 153, 0.06)",
    borderRadius: "12px",
    padding: "20px",
    textAlign: "center",
  },
  featureIcon: {
    fontSize: "32px",
    display: "block",
    marginBottom: "8px",
  },
  featureTitle: {
    color: "#ffffff",
    fontSize: "16px",
    fontWeight: "600",
    margin: "0 0 4px 0",
  },
  featureDesc: {
    color: "rgba(255,255,255,0.4)",
    fontSize: "13px",
    margin: 0,
  },
  noticeCard: {
    background: "rgba(52, 211, 153, 0.05)",
    border: "1px solid rgba(52, 211, 153, 0.1)",
    borderRadius: "12px",
    padding: "20px 24px",
    marginBottom: "24px",
  },
  noticeContent: {
    display: "flex",
    alignItems: "flex-start",
    gap: "16px",
  },
  noticeIcon: {
    fontSize: "24px",
    flexShrink: 0,
    marginTop: "2px",
  },
  noticeTitle: {
    color: "#34d399",
    fontSize: "16px",
    fontWeight: "600",
    margin: "0 0 4px 0",
  },
  noticeText: {
    color: "rgba(255,255,255,0.5)",
    fontSize: "14px",
    margin: 0,
    lineHeight: "1.5",
  },
  progressBar: {
    height: "4px",
    background: "rgba(52, 211, 153, 0.1)",
    borderRadius: "2px",
    marginTop: "12px",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    width: "15%",
    background: "linear-gradient(90deg, #34d399, #10b981)",
    borderRadius: "2px",
    animation: "progressPulse 2s ease-in-out infinite",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
    gap: "16px",
  },
  statCard: {
    background: "rgba(255,255,255,0.02)",
    border: "1px solid rgba(52, 211, 153, 0.06)",
    borderRadius: "12px",
    padding: "20px",
    textAlign: "center",
  },
  statValue: {
    color: "#34d399",
    fontSize: "32px",
    fontWeight: "700",
    display: "block",
    marginBottom: "4px",
  },
  statLabel: {
    color: "rgba(255,255,255,0.4)",
    fontSize: "13px",
  },
};

// Add CSS animations and hover effects
if (typeof document !== "undefined" && !document.getElementById("placement-style")) {
  const styleSheet = document.createElement("style");
  styleSheet.id = "placement-style";
  styleSheet.textContent = `
    @keyframes progressPulse {
      0% { width: 10%; opacity: 0.6; }
      50% { width: 20%; opacity: 1; }
      100% { width: 10%; opacity: 0.6; }
    }

    .logo-home:hover {
      transform: scale(1.05);
      filter: brightness(1.2);
    }

    .signout-btn:hover {
      background: rgba(52, 211, 153, 0.08);
      border-color: rgba(52, 211, 153, 0.4);
      transform: translateY(-1px);
      box-shadow: 0 4px 16px rgba(52, 211, 153, 0.1);
    }

    .feature-card:hover {
      background: rgba(52, 211, 153, 0.04);
      border-color: rgba(52, 211, 153, 0.12);
      transform: translateY(-2px);
      transition: all 0.3s ease;
    }

    .stat-card:hover {
      background: rgba(52, 211, 153, 0.04);
      border-color: rgba(52, 211, 153, 0.12);
      transform: translateY(-2px);
      transition: all 0.3s ease;
    }

    @media (max-width: 860px) {
      .container { padding: 16px !important; }
      .content-wrapper { padding: 20px !important; }
      .navbar { padding: 12px 16px !important; }
      .logo-img { height: 48px !important; }
      .hero-section { padding: 32px 20px !important; }
      .hero-title { font-size: 28px !important; }
    }

    @media (max-width: 700px) {
      .header { flex-direction: column !important; align-items: stretch !important; gap: 16px !important; }
      .header-left { flex-wrap: wrap !important; }
      .title { font-size: 22px !important; }
      .feature-grid { grid-template-columns: 1fr 1fr !important; }
      .stats-grid { grid-template-columns: 1fr 1fr !important; }
      .notice-content { flex-direction: column !important; align-items: center !important; text-align: center !important; }
    }

    @media (max-width: 480px) {
      .container { padding: 12px !important; }
      .content-wrapper { padding: 16px !important; }
      .feature-grid { grid-template-columns: 1fr !important; }
      .stats-grid { grid-template-columns: 1fr !important; }
      .hero-title { font-size: 24px !important; }
      .hero-icon { font-size: 48px !important; }
    }
  `;
  document.head.appendChild(styleSheet);
}