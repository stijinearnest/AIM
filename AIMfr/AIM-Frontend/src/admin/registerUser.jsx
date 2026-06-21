import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { apiPost, apiGet } from "../api/apiService";
import aimLogo from "../assets/aim-logo1.png";

const initialForm = {
  username: "",
  email: "",
  password: "",
  department: "",
};

export default function RegisterUser() {
  const navigate = useNavigate();
  const isAdmin = localStorage.getItem("is_admin") === "true";
  const [formData, setFormData] = useState(initialForm);
  const [departments, setDepartments] = useState([]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
        const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
        setMousePosition({ x, y });
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const updateField = (field, value) => {
    setFormData((current) => ({ ...current, [field]: value }));
  };

  useEffect(() => {
    loadDepartments();
  }, []);

  const loadDepartments = async () => {
    try {
      const response = await apiGet("/students/departments/");
      setDepartments(response.departments || []);
    } catch (error) {
      console.error("Failed to load departments", error);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");
    setErrorMessage("");
    setSaving(true);

    try {
      await apiPost("/users/register/", {
        username: formData.username.trim(),
        email: formData.email.trim(),
        password: formData.password,
        department: formData.department.trim(),
      });

      setMessage("User registered successfully.");
      setFormData(initialForm);
    } catch (error) {
      console.error(error);
      const apiError = error.response?.data;
      const firstError =
        apiError && typeof apiError === "object"
          ? Object.values(apiError).flat().join(" ")
          : "";
      setErrorMessage(firstError || "Failed to register user.");
    } finally {
      setSaving(false);
    }
  };

  if (!isAdmin) {
    return (
      <div style={styles.page} ref={containerRef}>
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
        
        <svg style={styles.arcField} viewBox="0 0 1700 950" preserveAspectRatio="none">
          <defs>
            <radialGradient id="glow1" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="rgba(52,211,153,0.4)" stopOpacity="1"/>
              <stop offset="100%" stopColor="rgba(52,211,153,0)" stopOpacity="0"/>
            </radialGradient>
          </defs>
          <circle 
            cx={1850 + mousePosition.x * 30} 
            cy={900 + mousePosition.y * 20} 
            r="540" 
            fill="url(#glow1)"
            opacity="0.6"
            style={styles.arcTransition}
          />
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
        </svg>

        <div style={styles.container}>
          <section style={styles.noticePanel}>
            <div style={styles.noticeIcon}>🔒</div>
            <h1 style={styles.title}>Admin Access Required</h1>
            <p style={styles.subtitle}>Only admin users can register new accounts.</p>
            <button style={styles.primaryButton} onClick={() => navigate("/dashboard")}>
              Back to Dashboard
            </button>
          </section>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page} ref={containerRef}>
      {/* Enhanced starfield with parallax */}
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
      
      {/* Enhanced orbit arcs with parallax */}
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

          <div style={styles.navActions}>
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
          </div>
        </header>

        {/* Main Content */}
        <main style={styles.contentWrapper}>
          <div style={styles.header}>
            <div style={styles.headerLeft}>
              <div style={styles.titleWrapper}>
                <h1 style={styles.title}>👤 Register User</h1>
                <p style={styles.subtitle}>Create a new AIM user account.</p>
              </div>
            </div>
          </div>

          {message && <div style={styles.successAlert}>{message}</div>}
          {errorMessage && <div style={styles.errorAlert}>{errorMessage}</div>}

          <form style={styles.form} onSubmit={handleSubmit}>
            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Username</label>
              <input
                style={styles.formInput}
                value={formData.username}
                onChange={(event) => updateField("username", event.target.value)}
                placeholder="Enter username"
                required
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Email</label>
              <input
                type="email"
                style={styles.formInput}
                value={formData.email}
                onChange={(event) => updateField("email", event.target.value)}
                placeholder="Enter email address"
                required
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Password</label>
              <input
                type="password"
                style={styles.formInput}
                value={formData.password}
                onChange={(event) => updateField("password", event.target.value)}
                placeholder="Enter password"
                required
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Department</label>
              <select
                style={styles.formSelect}
                value={formData.department}
                onChange={(event) => updateField("department", event.target.value)}
                required
              >
                <option value="">Select Department</option>
                {departments.map((department) => (
                  <option
                    key={department.dep_id}
                    value={department.department_name}
                    style={styles.formSelectOption}
                  >
                    {department.department_name}
                  </option>
                ))}
              </select>
            </div>

            <div style={styles.buttonRow}>
              <button type="button" style={styles.secondaryButton} onClick={() => navigate("/dashboard")}>
                Cancel
              </button>
              <button type="submit" style={styles.primaryButton} disabled={saving}>
                {saving ? (
                  <>
                    <span style={styles.spinner}></span>
                    Registering...
                  </>
                ) : (
                  "Register User"
                )}
              </button>
            </div>
          </form>
        </main>
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
    maxWidth: "1100px",
    margin: "0 auto",
    padding: "32px 48px",
    position: "relative",
    zIndex: 2,
  },
  navbar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "20px",
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
  navActions: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    flexWrap: "wrap",
    justifyContent: "flex-end",
  },
  contentWrapper: {
    background: "rgba(8, 16, 13, 0.6)",
    backdropFilter: "blur(14px)",
    borderRadius: "20px",
    border: "1px solid rgba(52, 211, 153, 0.08)",
    padding: "32px",
    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.35)",
  },
  noticePanel: {
    background: "rgba(8, 16, 13, 0.6)",
    backdropFilter: "blur(14px)",
    border: "1px solid rgba(52, 211, 153, 0.08)",
    borderRadius: "20px",
    padding: "48px 40px",
    maxWidth: "520px",
    margin: "0 auto",
    textAlign: "center",
    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.35)",
  },
  noticeIcon: {
    fontSize: "64px",
    marginBottom: "16px",
    display: "block",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "20px",
    marginBottom: "28px",
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
    fontSize: "30px",
    fontWeight: "700",
    margin: 0,
    lineHeight: "1.2",
    letterSpacing: "-0.5px",
  },
  subtitle: {
    color: "rgba(255,255,255,0.45)",
    fontSize: "14px",
    margin: 0,
  },
  form: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: "18px",
  },
  formGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "7px",
  },
  formLabel: {
    color: "rgba(255,255,255,0.65)",
    fontSize: "13px",
    fontWeight: "500",
  },
  formInput: {
    width: "100%",
    boxSizing: "border-box",
    padding: "12px 14px",
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(52,211,153,0.12)",
    borderRadius: "10px",
    color: "#ffffff",
    fontSize: "14px",
    outline: "none",
    fontFamily: "inherit",
    transition: "all 0.25s ease",
  },
  formSelect: {
    width: "100%",
    boxSizing: "border-box",
    padding: "12px 14px",
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(52,211,153,0.12)",
    borderRadius: "10px",
    color: "#ffffff",
    fontSize: "14px",
    outline: "none",
    fontFamily: "inherit",
    cursor: "pointer",
    appearance: "none",
    WebkitAppearance: "none",
    MozAppearance: "none",
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%2334d399' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`,
    backgroundRepeat: "no-repeat",
    backgroundPosition: "right 14px center",
    paddingRight: "36px",
    transition: "all 0.25s ease",
  },
  formSelectOption: {
    background: "#0a140e",
    color: "#ffffff",
  },
  buttonRow: {
    gridColumn: "1 / -1",
    display: "flex",
    justifyContent: "flex-end",
    gap: "12px",
    flexWrap: "wrap",
    marginTop: "10px",
  },
  primaryButton: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "12px 24px",
    background: "linear-gradient(135deg, #10b981, #059669)",
    border: "none",
    borderRadius: "10px",
    color: "#ffffff",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    fontFamily: "inherit",
    boxShadow: "0 4px 16px rgba(16, 185, 129, 0.25)",
    transition: "all 0.3s ease",
  },
  secondaryButton: {
    padding: "11px 20px",
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
  successAlert: {
    padding: "14px 18px",
    background: "rgba(16, 185, 129, 0.08)",
    border: "1px solid rgba(16, 185, 129, 0.18)",
    borderRadius: "10px",
    color: "#34d399",
    fontSize: "14px",
    marginBottom: "20px",
  },
  errorAlert: {
    padding: "14px 18px",
    background: "rgba(239, 68, 68, 0.08)",
    border: "1px solid rgba(239, 68, 68, 0.15)",
    borderRadius: "10px",
    color: "#f87171",
    fontSize: "14px",
    marginBottom: "20px",
  },
  spinner: {
    display: "inline-block",
    width: "16px",
    height: "16px",
    border: "2px solid rgba(255,255,255,0.2)",
    borderTop: "2px solid #ffffff",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
  },
};

// Add CSS animations and hover effects
const styleSheet = document.createElement("style");
styleSheet.textContent = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  @keyframes pulse {
    0% { opacity: 0.6; transform: scale(0.95); }
    100% { opacity: 1; transform: scale(1.05); }
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

  .primary-button:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(16, 185, 129, 0.35);
  }

  .primary-button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .secondary-button:hover {
    background: rgba(52, 211, 153, 0.08);
    border-color: rgba(52, 211, 153, 0.3);
  }

  input:focus, select:focus {
    border-color: rgba(52, 211, 153, 0.3) !important;
    box-shadow: 0 0 0 3px rgba(52, 211, 153, 0.06);
  }

  select option {
    background: #0a140e;
    color: #ffffff;
  }

  select option:hover {
    background: rgba(52, 211, 153, 0.1);
  }

  select option:checked {
    background: rgba(52, 211, 153, 0.15);
    color: #34d399;
  }

  @media (prefers-reduced-motion: reduce) {
    .star-field span, .arc-field circle { 
      transition: none !important; 
      animation: none !important;
    }
  }

  @media (max-width: 860px) {
    .container { padding: 16px !important; }
    .content-wrapper { padding: 20px !important; }
    .navbar { padding: 12px 16px !important; }
    .logo-img { height: 48px !important; }
  }

  @media (max-width: 700px) {
    .header { flex-direction: column !important; align-items: stretch !important; gap: 16px !important; }
    .title { font-size: 24px !important; }
    .form { grid-template-columns: 1fr !important; }
    .button-row { flex-direction: column-reverse !important; }
    .primary-button, .secondary-button { width: 100% !important; justify-content: center !important; }
    .nav-actions { gap: 8px !important; }
    .logout-btn { padding: 8px 14px !important; font-size: 13px !important; }
  }

  @media (max-width: 480px) {
    .container { padding: 12px !important; }
    .content-wrapper { padding: 16px !important; }
    .notice-panel { padding: 32px 20px !important; }
    .title { font-size: 20px !important; }
  }
`;
document.head.appendChild(styleSheet);