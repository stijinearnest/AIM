import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import aimLogo from "../assets/aim-logo1.png";

export default function Dashboard() {
  const navigate = useNavigate();
  const username = localStorage.getItem("username") || "there";
  const department = localStorage.getItem("dep_name") || "Department";
  const isAdmin = localStorage.getItem("is_admin") === "true";
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [showDropdown, setShowDropdown] = useState(false);
  const containerRef = useRef(null);
  const dropdownRef = useRef(null);

  const handleTabChange = (tab) => {
    navigate(`/${tab}`);
  };

  const handleSignOut = () => {
    localStorage.clear();
    navigate("/");
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
        const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
        setMousePosition({ x, y });
      }
    };

    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div style={styles.page} ref={containerRef}>
      {/* ambient starfield with enhanced parallax and glow */}
      <div style={styles.starField}>
        {STARS.map((s, i) => {
          const speed = s.speed || 0.04;
          const moveX = mousePosition.x * speed * 80;
          const moveY = mousePosition.y * speed * 80;
          
          return (
            <span
              key={i}
              style={{
                position: "absolute",
                top: `calc(${s.top} + ${moveY}px)`,
                left: `calc(${s.left} + ${moveX}px)`,
                width: s.size,
                height: s.size,
                borderRadius: "50%",
                background: `radial-gradient(circle, #7ef0e0, #5eead4)`,
                opacity: Math.min(1, s.opacity + 0.2),
                boxShadow: `0 0 ${s.size * 6}px rgba(94, 234, 212, ${Math.min(1, s.opacity * 1.5)}), 0 0 ${s.size * 12}px rgba(94, 234, 212, ${Math.min(1, s.opacity * 0.6)})`,
                transition: "top 0.15s ease-out, left 0.15s ease-out, box-shadow 0.3s ease",
                pointerEvents: "none",
                animation: `pulse ${2 + i * 0.3}s ease-in-out infinite alternate`,
              }}
            />
          );
        })}
      </div>
      
      {/* Enhanced orbit arcs with parallax and glow */}
      <svg style={styles.arcField} viewBox="0 0 1700 950" preserveAspectRatio="none">
        <defs>
          <radialGradient id="glow1" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(52,211,153,0.4)" stopOpacity="1"/>
            <stop offset="100%" stopColor="rgba(52,211,153,0)" stopOpacity="0"/>
          </radialGradient>
          <radialGradient id="glow2" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(52,211,153,0.25)" stopOpacity="1"/>
            <stop offset="100%" stopColor="rgba(52,211,153,0)" stopOpacity="0"/>
          </radialGradient>
          <radialGradient id="glow3" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(52,211,153,0.15)" stopOpacity="1"/>
            <stop offset="100%" stopColor="rgba(52,211,153,0)" stopOpacity="0"/>
          </radialGradient>
        </defs>
        
        {/* Glow effects behind arcs */}
        <circle 
          cx={1850 + mousePosition.x * 30} 
          cy={900 + mousePosition.y * 20} 
          r="540" 
          fill="url(#glow1)"
          opacity="0.6"
          style={styles.arcTransition}
        />
        <circle 
          cx={1850 + mousePosition.x * 50} 
          cy={900 + mousePosition.y * 30} 
          r="700" 
          fill="url(#glow2)"
          opacity="0.4"
          style={styles.arcTransition}
        />
        <circle 
          cx={1850 + mousePosition.x * 70} 
          cy={900 + mousePosition.y * 40} 
          r="860" 
          fill="url(#glow3)"
          opacity="0.3"
          style={styles.arcTransition}
        />
        
        {/* Arc lines with enhanced glow */}
        <circle 
          cx={1850 + mousePosition.x * 30} 
          cy={900 + mousePosition.y * 20} 
          r="520" 
          fill="none" 
          stroke="rgba(52,211,153,0.25)" 
          strokeWidth="1.5"
          style={{
            ...styles.arcTransition,
            filter: "drop-shadow(0 0 20px rgba(52,211,153,0.15))"
          }}
        />
        <circle 
          cx={1850 + mousePosition.x * 50} 
          cy={900 + mousePosition.y * 30} 
          r="680" 
          fill="none" 
          stroke="rgba(52,211,153,0.15)" 
          strokeWidth="1"
          style={{
            ...styles.arcTransition,
            filter: "drop-shadow(0 0 30px rgba(52,211,153,0.1))"
          }}
        />
        <circle 
          cx={1850 + mousePosition.x * 70} 
          cy={900 + mousePosition.y * 40} 
          r="840" 
          fill="none" 
          stroke="rgba(52,211,153,0.08)" 
          strokeWidth="1"
          style={{
            ...styles.arcTransition,
            filter: "drop-shadow(0 0 40px rgba(52,211,153,0.08))"
          }}
        />
      </svg>

      <div className="container" style={styles.container}>
        {/* Navbar with user profile dropdown */}
        <header className="navbar" style={styles.navbar}>
          <img src={aimLogo} alt="AIM" className="logo-img" style={styles.logoImg} />

          <div style={styles.userMenu} ref={dropdownRef}>
            <button
              className="user-menu-btn"
              style={styles.userMenuBtn}
              onClick={() => setShowDropdown(!showDropdown)}
            >
              <span style={styles.userAvatar}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="12" cy="7" r="4" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </span>
              <span style={styles.userName}>{username}</span>
            </button>

            {showDropdown && (
              <div style={styles.dropdown}>
                <div style={styles.dropdownHeader}>
                  <span style={styles.dropdownAvatar}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" strokeLinecap="round" strokeLinejoin="round"/>
                      <circle cx="12" cy="7" r="4" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </span>
                  <div style={styles.dropdownUserInfo}>
                    <span style={styles.dropdownUsername}>{username}</span>
                    <span style={styles.dropdownDepartment}>{department}</span>
                  </div>
                </div>
                <div style={styles.dropdownDivider}></div>
                <button
                  style={styles.dropdownSignOut}
                  onClick={handleSignOut}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" strokeLinecap="round" strokeLinejoin="round"/>
                    <polyline points="16 17 21 12 16 7" strokeLinecap="round" strokeLinejoin="round"/>
                    <line x1="21" y1="12" x2="9" y2="12" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Welcome Section */}
        <div style={styles.welcomeBlock}>
          <p style={styles.welcomeEyebrow}>Welcome back,</p>
          <h1 style={styles.welcomeName}>{username}</h1>
          <p style={styles.welcomeSub}>
            {isAdmin
              ? "Manage AIM modules and register new users"
              : "Manage your AIM profile and track your progress"}
          </p>
        </div>

        {/* Navigation Cards - Square with title below icon */}
        <nav className="card-row" style={styles.cardRow}>
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
             style={{
              ...styles.navCard,
              opacity: 0.5,
              cursor: "not-allowed",
              background: "rgba(8, 14, 11, 0.25)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              filter: "grayscale(100%)",
            }}
            // onClick={() => handleTabChange("placement")}
            disabled
          >
            <span style={styles.navCardIcon}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2">
                <rect x="3" y="7" width="18" height="13" rx="2" strokeLinejoin="round"/>
                <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </span>
            <span style={styles.navCardLabel}>Placement</span>
          </button>

          {isAdmin && (
            <button
              className="nav-card"
              style={styles.navCard}
              onClick={() => handleTabChange("register-user")}
            >
              <span style={styles.navCardIcon}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" strokeLinecap="round" strokeLinejoin="round" />
                  <circle cx="9" cy="7" r="4" strokeLinecap="round" strokeLinejoin="round" />
                  <line x1="19" y1="8" x2="19" y2="14" strokeLinecap="round" />
                  <line x1="22" y1="11" x2="16" y2="11" strokeLinecap="round" />
                </svg>
              </span>
              <span style={styles.navCardLabel}>Register User</span>
            </button>
          )}
          <button
            className="nav-card"
            style={styles.navCard}
            onClick={() => handleTabChange("student-results")}
          >
            <span style={styles.navCardIcon}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2">
                <path d="M3 4h18v16H3z" />
                <path d="M7 8h10" />
                <path d="M7 12h10" />
                <path d="M7 16h6" />
              </svg>
            </span>
            <span style={styles.navCardLabel}>Student Results</span>
          </button>
          <button
            className="nav-card"
            style={styles.navCard}
            onClick={() => handleTabChange("student-profile")}
          >
            <span style={styles.navCardIcon}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="12" cy="7" r="4" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M16 11l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            <span style={styles.navCardLabel}>Student Profile</span>
          </button>
        </nav>

        {/* Content Area */}
        
      </div>
    </div>
  );
}

/* ---------- decorative star positions with enhanced speed ---------- */
const STARS = [
  { top: "9%", left: "73%", size: 3, opacity: 0.65, speed: 0.03 },
  { top: "16%", left: "92%", size: 2.5, opacity: 0.6, speed: 0.05 },
  { top: "28%", left: "67%", size: 3.5, opacity: 0.75, speed: 0.04 },
  { top: "35%", left: "88%", size: 2.5, opacity: 0.55, speed: 0.07 },
  { top: "44%", left: "57%", size: 2, opacity: 0.6, speed: 0.02 },
  { top: "54%", left: "73%", size: 3.5, opacity: 0.75, speed: 0.06 },
  { top: "64%", left: "55%", size: 2.5, opacity: 0.55, speed: 0.035 },
  { top: "73%", left: "88%", size: 3, opacity: 0.65, speed: 0.05 },
  { top: "81%", left: "64%", size: 2.5, opacity: 0.6, speed: 0.04 },
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
  arcTransition: {
    transition: "cx 0.15s ease-out, cy 0.15s ease-out, opacity 0.3s ease",
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
  userMenu: {
    position: "relative",
  },
  userMenuBtn: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "8px 16px 8px 12px",
    background: "rgba(255, 255, 255, 0.03)",
    border: "1px solid rgba(52, 211, 153, 0.15)",
    borderRadius: "10px",
    color: "#ffffff",
    cursor: "pointer",
    fontFamily: "inherit",
    transition: "all 0.25s ease",
  },
  userAvatar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "32px",
    height: "32px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #10b981, #059669)",
    color: "#ffffff",
    flexShrink: 0,
  },
  userName: {
    fontSize: "14px",
    fontWeight: "500",
    color: "rgba(255,255,255,0.85)",
  },
  dropdown: {
    position: "absolute",
    right: 0,
    top: "calc(100% + 8px)",
    minWidth: "220px",
    background: "#0a140e",
    border: "1px solid rgba(52, 211, 153, 0.12)",
    borderRadius: "12px",
    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.4), 0 0 40px rgba(0, 0, 0, 0.2)",
    padding: "8px",
    zIndex: 100,
    animation: "dropdownSlide 0.2s ease-out",
  },
  dropdownHeader: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "12px 12px 8px 12px",
  },
  dropdownAvatar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #10b981, #059669)",
    color: "#ffffff",
    flexShrink: 0,
  },
  dropdownUserInfo: {
    display: "flex",
    flexDirection: "column",
    gap: "2px",
  },
  dropdownUsername: {
    color: "#ffffff",
    fontSize: "14px",
    fontWeight: "600",
  },
  dropdownDepartment: {
    color: "rgba(255,255,255,0.4)",
    fontSize: "12px",
  },
  dropdownDivider: {
    height: "1px",
    background: "rgba(52, 211, 153, 0.08)",
    margin: "4px 8px",
  },
  dropdownSignOut: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    width: "100%",
    padding: "10px 12px",
    background: "transparent",
    border: "none",
    borderRadius: "8px",
    color: "#f87171",
    fontSize: "14px",
    fontWeight: "500",
    cursor: "pointer",
    fontFamily: "inherit",
    transition: "all 0.2s ease",
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
    gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
    justifyContent: "center",
    gap: "20px",
    marginBottom: "40px",
    maxWidth: "100%",
  },
  adminCardRow: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
    justifyContent: "center",
    gap: "20px",
    marginBottom: "40px",
    maxWidth: "100%",
  },
  navCard: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "12px",
    padding: "24px 16px",
    aspectRatio: "1 / 1",
    width: "80%",
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
    width: "48px",
    height: "48px",
    borderRadius: "14px",
    background: "rgba(52, 211, 153, 0.08)",
    border: "1px solid rgba(52, 211, 153, 0.12)",
    flexShrink: 0,
  },
  navCardLabel: {
    color: "rgba(255, 255, 255, 0.85)",
    fontSize: "16px",
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
    @keyframes pulse {
      0% { opacity: 0.6; transform: scale(0.95); }
      100% { opacity: 1; transform: scale(1.05); }
    }

    @keyframes dropdownSlide {
      0% { opacity: 0; transform: translateY(-8px) scale(0.98); }
      100% { opacity: 1; transform: translateY(0) scale(1); }
    }

    .user-menu-btn:hover {
      background: rgba(52, 211, 153, 0.06);
      border-color: rgba(52, 211, 153, 0.3);
    }

    .dropdown-signout:hover {
      background: rgba(239, 68, 68, 0.08);
    }

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
      .nav-card, .star-field span, .arc-field circle { 
        transition: none !important; 
        animation: none !important;
      }
      .nav-card:hover { transform: none !important; }
      .dropdown { animation: none !important; }
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
      .user-menu-btn { padding: 6px 12px 6px 8px !important; }
      .user-name { font-size: 13px !important; }
      .user-avatar { width: 28px !important; height: 28px !important; }
      .user-avatar svg { width: 16px !important; height: 16px !important; }
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
      .dropdown {
        right: -8px !important;
        min-width: 200px !important;
      }
      .dropdown-avatar { width: 36px !important; height: 36px !important; }
      .dropdown-avatar svg { width: 20px !important; height: 20px !important; }
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
      .dropdown {
        right: -12px !important;
        min-width: 180px !important;
      }
    }
  `;
  document.head.appendChild(styleSheet);
}
