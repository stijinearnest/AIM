import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Rank from "../rank/rank";
import Placement from "../placement/placement";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("rank");
  const navigate = useNavigate();

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    navigate(`/${tab}`);
  };

  return (
    <div style={styles.page}>
      <div style={styles.gradientOrb1} />
      <div style={styles.gradientOrb2} />
      <div style={styles.gradientOrb3} />
      
      <div style={styles.container}>
        <div style={styles.header}>
          <div style={styles.headerContent}>
            <div style={styles.logoSection}>
              <div style={styles.logoIcon}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="#34d399" strokeWidth="2" strokeLinejoin="round"/>
                  <path d="M2 17L12 22L22 17" stroke="#34d399" strokeWidth="2" strokeLinejoin="round"/>
                  <path d="M2 12L12 17L22 12" stroke="#34d399" strokeWidth="2" strokeLinejoin="round"/>
                </svg>
              </div>
              <div>
                <h2 style={styles.title}>Dashboard</h2>
                <p style={styles.subtitle}>Welcome back to your portal</p>
              </div>
            </div>
            
            <button 
              onClick={() => {
                localStorage.clear();
                navigate("/");
              }}
              style={styles.logoutBtn}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" strokeLinecap="round" strokeLinejoin="round"/>
                <polyline points="16 17 21 12 16 7" strokeLinecap="round" strokeLinejoin="round"/>
                <line x1="21" y1="12" x2="9" y2="12" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Sign Out
            </button>
          </div>
        </div>

        <div style={styles.tabContainer}>
          <div style={styles.tabWrapper}>
            <button
              style={{
                ...styles.tabButton,
                ...(activeTab === "rank" ? styles.activeTab : styles.inactiveTab)
              }}
              onClick={() => handleTabChange("rank")}
            >
              <span style={styles.tabIcon}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" strokeLinejoin="round"/>
                </svg>
              </span>
              Rank
            </button>
            
            <button
              style={{
                ...styles.tabButton,
                ...(activeTab === "placement" ? styles.activeTab : styles.inactiveTab)
              }}
              onClick={() => handleTabChange("placement")}
            >
              <span style={styles.tabIcon}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" strokeLinejoin="round"/>
                  <circle cx="12" cy="10" r="3" strokeLinejoin="round"/>
                </svg>
              </span>
              Placement Guide
            </button>
          </div>
        </div>

      
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#080d0a",
    position: "relative",
    overflow: "hidden",
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  },
  gradientOrb1: {
    position: "absolute",
    width: "600px",
    height: "600px",
    borderRadius: "50%",
    background: "radial-gradient(circle at center, rgba(52, 211, 153, 0.08) 0%, transparent 70%)",
    top: "-300px",
    right: "-150px",
    pointerEvents: "none",
  },
  gradientOrb2: {
    position: "absolute",
    width: "500px",
    height: "500px",
    borderRadius: "50%",
    background: "radial-gradient(circle at center, rgba(16, 185, 129, 0.06) 0%, transparent 70%)",
    bottom: "-250px",
    left: "-150px",
    pointerEvents: "none",
  },
  gradientOrb3: {
    position: "absolute",
    width: "300px",
    height: "300px",
    borderRadius: "50%",
    background: "radial-gradient(circle at center, rgba(6, 148, 114, 0.05) 0%, transparent 70%)",
    top: "40%",
    right: "10%",
    pointerEvents: "none",
  },
  container: {
    maxWidth: "1400px",
    margin: "0 auto",
    padding: "40px 32px",
    position: "relative",
    zIndex: 2,
  },
  header: {
    marginBottom: "40px",
  },
  headerContent: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "20px",
  },
  logoSection: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
  },
  logoIcon: {
    width: "52px",
    height: "52px",
    background: "rgba(52, 211, 153, 0.08)",
    borderRadius: "14px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "1px solid rgba(52, 211, 153, 0.15)",
  },
  title: {
    color: "#ffffff",
    fontSize: "28px",
    fontWeight: "600",
    margin: 0,
    letterSpacing: "-0.5px",
  },
  subtitle: {
    color: "rgba(255, 255, 255, 0.45)",
    fontSize: "14px",
    margin: "4px 0 0 0",
  },
  logoutBtn: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "12px 22px",
    background: "rgba(255, 255, 255, 0.03)",
    border: "1px solid rgba(52, 211, 153, 0.08)",
    borderRadius: "12px",
    color: "rgba(255, 255, 255, 0.6)",
    fontSize: "14px",
    fontWeight: "500",
    cursor: "pointer",
    fontFamily: "inherit",
    transition: "all 0.25s ease",
  },
  tabContainer: {
    marginBottom: "32px",
  },
  tabWrapper: {
    display: "flex",
    gap: "6px",
    background: "rgba(255, 255, 255, 0.02)",
    padding: "6px",
    borderRadius: "16px",
    border: "1px solid rgba(52, 211, 153, 0.06)",
    maxWidth: "fit-content",
  },
  tabButton: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "12px 28px",
    borderRadius: "12px",
    fontSize: "15px",
    fontWeight: "500",
    fontFamily: "inherit",
    cursor: "pointer",
    border: "none",
    transition: "all 0.3s ease",
    textDecoration: "none",
  },
  activeTab: {
    background: "linear-gradient(135deg, #10b981, #059669)",
    color: "#ffffff",
    boxShadow: "0 6px 20px rgba(16, 185, 129, 0.3)",
  },
  inactiveTab: {
    background: "transparent",
    color: "rgba(255, 255, 255, 0.5)",
  },
  tabIcon: {
    display: "flex",
    alignItems: "center",
  },
  contentArea: {
    background: "rgba(10, 20, 16, 0.7)",
    backdropFilter: "blur(12px)",
    borderRadius: "20px",
    border: "1px solid rgba(52, 211, 153, 0.05)",
    padding: "32px",
    minHeight: "500px",
    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3), 0 0 40px rgba(52, 211, 153, 0.02)",
  },
  contentCard: {
    color: "#ffffff",
  },
};

// Add hover effects
const styleSheet = document.createElement("style");
styleSheet.textContent = `
  .logout-btn:hover {
    background: rgba(255, 255, 255, 0.06);
    border-color: rgba(52, 211, 153, 0.15);
    color: #ffffff;
    transform: translateY(-1px);
  }
  
  .tab-button:not(.active-tab):hover {
    background: rgba(255, 255, 255, 0.05);
    color: rgba(255, 255, 255, 0.8);
  }
  
  .tab-button.active-tab:hover {
    transform: translateY(-1px);
    box-shadow: 0 8px 24px rgba(16, 185, 129, 0.35);
  }
  
  /* Style child components that might be rendered inside */
  .content-card > * {
    color: #ffffff !important;
  }
  
  /* Override any Bootstrap styles if present */
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