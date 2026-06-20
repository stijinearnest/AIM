import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiGet, apiPost } from "../api/apiService";

export default function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await apiPost("/users/login/", {
        username: formData.username,
        password: formData.password,
      });

      localStorage.setItem("access_token", response.access);
      localStorage.setItem("refresh_token", response.refresh);
      localStorage.setItem("user_id", response.user_id);
      localStorage.setItem("department_id", response.department_id);
      console.log(response.user_id);
      const dep_id = response.department_id;
      const department = await apiGet(`/students/department/?department_id=${dep_id}`);
      console.log(department.department_name);
      localStorage.setItem("dep_name", department.department_name);

      navigate("/dashboard");
    } catch (error) {
      console.error(error);
      alert("Invalid username or password");
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.gradientOrb1} />
      <div style={styles.gradientOrb2} />
      <div style={styles.gradientOrb3} />
      
      <div style={styles.card}>
        <div style={styles.logoSection}>
          <div style={styles.logoIcon}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="#34d399" strokeWidth="2" strokeLinejoin="round"/>
              <path d="M2 17L12 22L22 17" stroke="#34d399" strokeWidth="2" strokeLinejoin="round"/>
              <path d="M2 12L12 17L22 12" stroke="#34d399" strokeWidth="2" strokeLinejoin="round"/>
            </svg>
          </div>
          <h1 style={styles.title}>Welcome Back</h1>
          <p style={styles.subtitle}>Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Username</label>
            <input
              type="text"
              placeholder="Enter your username"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              style={styles.input}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              style={styles.input}
            />
          </div>

          <div style={styles.optionsRow}>
            <label style={styles.rememberMe}>
              <input type="checkbox" style={styles.checkbox} />
              Remember me
            </label>
            <span style={styles.forgotLink}>Forgot Password?</span>
          </div>

          <button type="submit" style={styles.btnSignin}>
            Sign In
          </button>
        </form>

       
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#080d0a",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    overflow: "hidden",
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  },
  gradientOrb1: {
    position: "absolute",
    width: "500px",
    height: "500px",
    borderRadius: "50%",
    background: "radial-gradient(circle at center, rgba(52, 211, 153, 0.08) 0%, transparent 70%)",
    top: "-250px",
    right: "-100px",
    pointerEvents: "none",
  },
  gradientOrb2: {
    position: "absolute",
    width: "400px",
    height: "400px",
    borderRadius: "50%",
    background: "radial-gradient(circle at center, rgba(16, 185, 129, 0.06) 0%, transparent 70%)",
    bottom: "-200px",
    left: "-100px",
    pointerEvents: "none",
  },
  gradientOrb3: {
    position: "absolute",
    width: "300px",
    height: "300px",
    borderRadius: "50%",
    background: "radial-gradient(circle at center, rgba(6, 148, 114, 0.05) 0%, transparent 70%)",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    pointerEvents: "none",
  },
  card: {
    width: "100%",
    maxWidth: "400px",
    background: "rgba(10, 20, 16, 0.85)",
    backdropFilter: "blur(20px)",
    border: "1px solid rgba(52, 211, 153, 0.08)",
    borderRadius: "20px",
    padding: "48px 40px",
    position: "relative",
    zIndex: 2,
    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 40px rgba(52, 211, 153, 0.03)",
  },
  logoSection: {
    textAlign: "center",
    marginBottom: "32px",
  },
  logoIcon: {
    width: "56px",
    height: "56px",
    margin: "0 auto 16px",
    background: "rgba(52, 211, 153, 0.08)",
    borderRadius: "16px",
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
    marginBottom: "6px",
    letterSpacing: "-0.5px",
  },
  subtitle: {
    color: "rgba(255, 255, 255, 0.5)",
    fontSize: "14px",
    margin: 0,
    fontWeight: "400",
  },
  form: {
    width: "100%",
    display: "flex",
    flexDirection: "column",
    gap: "18px",
  },
  inputGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  label: {
    color: "rgba(255, 255, 255, 0.7)",
    fontSize: "13px",
    fontWeight: "500",
    letterSpacing: "0.3px",
  },
  input: {
    width: "100%",
    padding: "12px 16px",
    background: "rgba(255, 255, 255, 0.03)",
    border: "1px solid rgba(52, 211, 153, 0.1)",
    borderRadius: "12px",
    color: "#ffffff",
    fontSize: "14px",
    outline: "none",
    fontFamily: "inherit",
    transition: "all 0.2s ease",
    boxSizing: "border-box",
  },
  optionsRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: "-4px",
  },
  rememberMe: {
    color: "rgba(255, 255, 255, 0.6)",
    fontSize: "13px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    cursor: "pointer",
  },
  checkbox: {
    width: "16px",
    height: "16px",
    accentColor: "#10b981",
    cursor: "pointer",
  },
  forgotLink: {
    color: "rgba(255, 255, 255, 0.5)",
    fontSize: "13px",
    cursor: "pointer",
    transition: "color 0.2s ease",
    textDecoration: "none",
  },
  btnSignin: {
    width: "100%",
    border: "none",
    borderRadius: "12px",
    color: "#ffffff",
    fontSize: "15px",
    fontWeight: "600",
    padding: "14px",
    cursor: "pointer",
    fontFamily: "inherit",
    background: "linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%)",
    marginTop: "4px",
    transition: "all 0.2s ease",
    boxShadow: "0 4px 16px rgba(16, 185, 129, 0.25)",
  },
  divider: {
    display: "flex",
    alignItems: "center",
    margin: "24px 0 20px",
  },
  dividerLine: {
    flex: 1,
    height: "1px",
    background: "rgba(52, 211, 153, 0.08)",
  },
  dividerText: {
    color: "rgba(255, 255, 255, 0.3)",
    fontSize: "12px",
    fontWeight: "500",
    padding: "0 16px",
    letterSpacing: "0.5px",
    textTransform: "uppercase",
  },
  socialButtons: {
    display: "flex",
    gap: "12px",
    marginBottom: "20px",
  },
  btnSocial: {
    flex: 1,
    padding: "11px",
    background: "rgba(255, 255, 255, 0.03)",
    border: "1px solid rgba(52, 211, 153, 0.08)",
    borderRadius: "12px",
    color: "rgba(255, 255, 255, 0.7)",
    fontSize: "13px",
    fontWeight: "500",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    fontFamily: "inherit",
    transition: "all 0.2s ease",
  },
  footerText: {
    color: "rgba(255, 255, 255, 0.4)",
    fontSize: "13px",
    textAlign: "center",
    margin: 0,
  },
  accentText: {
    color: "#34d399",
    fontWeight: "500",
    cursor: "pointer",
    transition: "color 0.2s ease",
  },
};

// Add hover and focus effects
const styleSheet = document.createElement("style");
styleSheet.textContent = `
  input:focus {
    border-color: rgba(52, 211, 153, 0.4) !important;
    background: rgba(255, 255, 255, 0.05) !important;
    box-shadow: 0 0 0 3px rgba(52, 211, 153, 0.08);
  }
  
  input:hover {
    border-color: rgba(52, 211, 153, 0.2);
  }
  
  .btn-signin:hover {
    transform: translateY(-1px);
    box-shadow: 0 6px 24px rgba(16, 185, 129, 0.35);
  }
  
  .btn-signin:active {
    transform: translateY(0px);
  }
  
  .btn-social:hover {
    background: rgba(255, 255, 255, 0.06);
    border-color: rgba(52, 211, 153, 0.15);
  }
  
  .forgot-link:hover {
    color: rgba(255, 255, 255, 0.8) !important;
  }
  
  .accent-text:hover {
    color: #6ee7b7 !important;
  }
`;
document.head.appendChild(styleSheet);