import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Rank from "../rank/rank";
import Placement from "../placement/placement";
import aimLogo from "../assets/aim-logo1.png";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("rank");
  const navigate = useNavigate();
  const username = localStorage.getItem("username") || "there";

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    navigate(`/${tab}`);
  };

  return (
    <div style={styles.page}>
      {/* ambient starfield + orbit arcs */}
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
        {/* Navbar with border and highlight */}
        <header style={styles.navbar}>
          <img src={aimLogo} alt="AIM" style={styles.logoImg} />

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

        {/* Welcome Section */}
        <div style={styles.welcomeBlock}>
          <p style={styles.welcomeEyebrow}>Welcome back,</p>
          <h1 style={styles.welcomeName}>{username}</h1>
          <p style={styles.welcomeSub}>Manage your AIM profile and track your progress</p>
        </div>

        {/* Navigation Cards - Square with title below icon */}
        <nav style={styles.cardRow}>
          <button
            className="nav-card"
            style={styles.navCard}
            onClick={() => handleTabChange("rank")}
          >
            <span style={styles.navCardIcon}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2">
                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" strokeLinejoin="round"/>
              </svg>
            </span>
            <span style={styles.navCardLabel}>Rank</span>
          </button>

          <button
            className="nav-card"
            style={styles.navCard}
            onClick={() => handleTabChange("placement")}
          >
            <span style={styles.navCardIcon}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2">
                <rect x="3" y="7" width="18" height="13" rx="2" strokeLinejoin="round"/>
                <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </span>
            <span style={styles.navCardLabel}>Placement</span>
          </button>
        </nav>

        {/* Content Area */}
        
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
    marginBottom: "48px",
    background: "rgba(8, 14, 11, 0.6)",
    backdropFilter: "blur(12px)",
    border: "1px solid rgba(52, 211, 153, 0.12)",
    borderRadius: "16px",
    boxShadow: "0 4px 24px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(52, 211, 153, 0.05)",
    transition: "all 0.3s ease",
  },
  logoImg: {
    height: "84px",
    width: "auto",
    display: "block",
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
  welcomeBlock: {
    marginBottom: "40px",
  },
  welcomeEyebrow: {
    color: "rgba(255, 255, 255, 0.55)",
    fontSize: "16px",
    margin: "0 0 4px 0",
    fontWeight: "400",
  },
  welcomeName: {
    color: "#ffffff",
    fontSize: "46px",
    fontWeight: "700",
    margin: "0 0 12px 0",
    letterSpacing: "-1px",
    lineHeight: 1.1,
  },
  welcomeSub: {
    color: "rgba(255, 255, 255, 0.45)",
    fontSize: "16px",
    margin: 0,
  },
  cardRow: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: "20px",
    marginBottom: "40px",
    maxWidth: "500px",
  },
  navCard: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "12px",
    padding: "32px 20px",
    aspectRatio: "1 / 1",
    width: "100%",
    borderRadius: "16px",
    background: "rgba(8, 14, 11, 0.55)",
    border: "1px solid rgba(52, 211, 153, 0.12)",
    cursor: "pointer",
    fontFamily: "inherit",
    transition: "all 0.3s ease",
  },
  navCardIcon: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "56px",
    height: "56px",
    borderRadius: "14px",
    background: "rgba(52, 211, 153, 0.08)",
    border: "1px solid rgba(52, 211, 153, 0.12)",
    flexShrink: 0,
  },
  navCardLabel: {
    color: "rgba(255, 255, 255, 0.85)",
    fontSize: "18px",
    fontWeight: "600",
    marginTop: "4px",
  },
  contentArea: {
    background: "rgba(8, 16, 13, 0.6)",
    backdropFilter: "blur(14px)",
    borderRadius: "20px",
    border: "1px solid rgba(52, 211, 153, 0.08)",
    padding: "32px",
    minHeight: "400px",
    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.35)",
  },
};

/* Global styles injection */
if (typeof document !== "undefined" && !document.getElementById("dashboard-style-tag")) {
  const styleSheet = document.createElement("style");
  styleSheet.id = "dashboard-style-tag";
  styleSheet.textContent = `
    .signout-btn:hover {
      background: rgba(52, 211, 153, 0.08);
      border-color: rgba(52, 211, 153, 0.4);
      transform: translateY(-1px);
      box-shadow: 0 4px 16px rgba(52, 211, 153, 0.1);
    }

    .signout-btn:focus-visible {
      outline: 2px solid #34d399;
      outline-offset: 2px;
    }

    /* Square card hover effect */
    .nav-card:hover {
      background: rgba(52, 211, 153, 0.06);
      border-color: rgba(52, 211, 153, 0.3);
      transform: translateY(-3px);
      box-shadow: 0 8px 24px rgba(52, 211, 153, 0.08);
    }

    .nav-card:active {
      transform: scale(0.97);
    }

    .nav-card:focus-visible {
      outline: 2px solid #34d399;
      outline-offset: 2px;
    }

    @media (prefers-reduced-motion: reduce) {
      .signout-btn, .nav-card { transition: none !important; }
      .nav-card:hover { transform: none !important; }
    }

    @media (max-width: 860px) {
      .content-card { padding: 20px !important; }
    }

    @media (max-width: 700px) {
      .navbar { 
        padding: 12px 16px !important;
        margin-bottom: 32px !important;
      }
      .logo-img { height: 48px !important; }
      .logout-btn { 
        padding: 8px 14px !important;
        font-size: 13px !important;
      }
      .card-row { 
        grid-template-columns: 1fr 1fr !important;
        max-width: 100% !important;
        gap: 16px !important;
      }
      .nav-card { 
        padding: 24px 16px !important;
        min-height: 140px !important;
      }
      .nav-card-icon { 
        width: 48px !important;
        height: 48px !important;
      }
      .nav-card-label {
        font-size: 16px !important;
      }
      .welcome-name {
        font-size: 32px !important;
      }
    }

    @media (max-width: 480px) {
      .card-row { 
        grid-template-columns: 1fr !important;
        max-width: 280px !important;
        margin-left: auto !important;
        margin-right: auto !important;
      }
      .container {
        padding: 16px !important;
      }
    }

    /* Style child components that might be rendered inside */
    .content-card > * {
      color: #ffffff !important;
    }

    .content-card .btn,
    .content-card .form-control,
    .content-card .table {
      background: rgba(255, 255, 255, 0.03) !important;
      border-color: rgba(52, 211, 153, 0.08) !important;
      color: #ffffff !important;
    }

    .content-card .btn:hover {
      background: rgba(255, 255, 255, 0.06) !important;
    }

    .content-card .btn-primary {
      background: linear-gradient(135deg, #10b981, #059669) !important;
      border-color: transparent !important;
    }

    .content-card .btn-primary:hover {
      background: linear-gradient(135deg, #059669, #047857) !important;
      box-shadow: 0 4px 16px rgba(16, 185, 129, 0.3) !important;
    }

    .content-card .btn-outline-primary {
      border-color: rgba(52, 211, 153, 0.3) !important;
      color: #34d399 !important;
    }

    .content-card .btn-outline-primary:hover {
      background: rgba(52, 211, 153, 0.1) !important;
      border-color: rgba(52, 211, 153, 0.5) !important;
    }

    .content-card .table {
      background: transparent !important;
    }

    .content-card .table td,
    .content-card .table th {
      border-color: rgba(52, 211, 153, 0.06) !important;
      color: rgba(255, 255, 255, 0.8) !important;
    }

    .content-card .table thead th {
      color: rgba(255, 255, 255, 0.5) !important;
      font-weight: 500;
    }

    .content-card .table tbody tr:hover {
      background: rgba(52, 211, 153, 0.02) !important;
    }

    .content-card .form-control:focus,
    .content-card .form-select:focus {
      border-color: rgba(52, 211, 153, 0.4) !important;
      box-shadow: 0 0 0 3px rgba(52, 211, 153, 0.08) !important;
    }

    .content-card .form-control:hover,
    .content-card .form-select:hover {
      border-color: rgba(52, 211, 153, 0.2) !important;
    }

    .content-card .alert-warning {
      background: rgba(52, 211, 153, 0.05) !important;
      border-color: rgba(52, 211, 153, 0.1) !important;
      color: #34d399 !important;
    }

    .content-card .alert-danger {
      background: rgba(239, 68, 68, 0.1) !important;
      border-color: rgba(239, 68, 68, 0.15) !important;
      color: #f87171 !important;
    }

    .content-card .card {
      background: rgba(255, 255, 255, 0.02) !important;
      border-color: rgba(52, 211, 153, 0.06) !important;
    }

    .content-card .card-header {
      background: rgba(52, 211, 153, 0.03) !important;
      border-color: rgba(52, 211, 153, 0.06) !important;
      color: #34d399 !important;
    }

    .content-card .modal-content {
      background: #0a140e !important;
      border-color: rgba(52, 211, 153, 0.1) !important;
    }

    .content-card .modal-header {
      border-color: rgba(52, 211, 153, 0.06) !important;
    }

    .content-card .modal-footer {
      border-color: rgba(52, 211, 153, 0.06) !important;
    }

    .content-card .btn-success {
      background: linear-gradient(135deg, #10b981, #059669) !important;
      border: none !important;
    }

    .content-card .btn-success:hover {
      background: linear-gradient(135deg, #059669, #047857) !important;
      box-shadow: 0 4px 16px rgba(16, 185, 129, 0.3) !important;
    }

    .content-card .btn-success:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .content-card .btn-close {
      filter: invert(1) brightness(2);
      opacity: 0.5;
    }

    .content-card .btn-close:hover {
      opacity: 1;
    }
  `;
  document.head.appendChild(styleSheet);
}