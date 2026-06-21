import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiPost } from "../api/apiService";
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
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const updateField = (field, value) => {
    setFormData((current) => ({ ...current, [field]: value }));
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
      <div style={styles.page}>
        <div style={styles.container}>
          <section style={styles.noticePanel}>
            <h1 style={styles.title}>Admin access required</h1>
            <p style={styles.subtitle}>Only admin users can register new accounts.</p>
            <button style={styles.secondaryButton} onClick={() => navigate("/dashboard")}>
              Back to Dashboard
            </button>
          </section>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.starField}>
        {STARS.map((star, index) => (
          <span
            key={index}
            style={{
              position: "absolute",
              top: star.top,
              left: star.left,
              width: star.size,
              height: star.size,
              borderRadius: "50%",
              background: "#5eead4",
              opacity: star.opacity,
              boxShadow: `0 0 ${star.size * 4}px rgba(94, 234, 212, ${star.opacity})`,
            }}
          />
        ))}
      </div>

      <div style={styles.container}>
        <header style={styles.navbar}>
          <img
            src={aimLogo}
            alt="AIM"
            style={styles.logoImg}
            onClick={() => navigate("/dashboard")}
          />

          <div style={styles.navActions}>
            <button style={styles.secondaryButton} onClick={() => navigate("/dashboard")}>
              Dashboard
            </button>
            <button
              style={styles.logoutBtn}
              onClick={() => {
                localStorage.clear();
                navigate("/");
              }}
            >
              Sign Out
            </button>
          </div>
        </header>

        <main style={styles.contentWrapper}>
          <div style={styles.header}>
            <div>
              <h1 style={styles.title}>Register User</h1>
              <p style={styles.subtitle}>Create a new AIM user account.</p>
            </div>
          </div>

          {message && <div style={styles.successAlert}>{message}</div>}
          {errorMessage && <div style={styles.errorAlert}>{errorMessage}</div>}

          <form style={styles.form} onSubmit={handleSubmit}>
            <label style={styles.formGroup}>
              <span style={styles.formLabel}>Username</span>
              <input
                style={styles.formInput}
                value={formData.username}
                onChange={(event) => updateField("username", event.target.value)}
                
                required
              />
            </label>

            <label style={styles.formGroup}>
              <span style={styles.formLabel}>Email</span>
              <input
                type="email"
                style={styles.formInput}
                value={formData.email}
                onChange={(event) => updateField("email", event.target.value)}
                
                required
              />
            </label>

            <label style={styles.formGroup}>
              <span style={styles.formLabel}>Password</span>
              <input
                type="password"
                style={styles.formInput}
                value={formData.password}
                onChange={(event) => updateField("password", event.target.value)}
                required
              />
            </label>

            <label style={styles.formGroup}>
              <span style={styles.formLabel}>Department</span>
              <input
                style={styles.formInput}
                value={formData.department}
                onChange={(event) => updateField("department", event.target.value)}
                required
              />
            </label>

            <div style={styles.buttonRow}>
              <button type="button" style={styles.secondaryButton} onClick={() => navigate("/dashboard")}>
                Cancel
              </button>
              <button type="submit" style={styles.primaryButton} disabled={saving}>
                {saving ? "Registering..." : "Register User"}
              </button>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
}

const STARS = [
  { top: "9%", left: "73%", size: 2, opacity: 0.55 },
  { top: "16%", left: "92%", size: 2, opacity: 0.5 },
  { top: "28%", left: "67%", size: 2.5, opacity: 0.65 },
  { top: "44%", left: "57%", size: 2, opacity: 0.5 },
  { top: "54%", left: "73%", size: 2.5, opacity: 0.65 },
  { top: "73%", left: "88%", size: 2, opacity: 0.55 },
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
    border: "1px solid rgba(52, 211, 153, 0.08)",
    borderRadius: "20px",
    padding: "32px",
    maxWidth: "520px",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "20px",
    marginBottom: "28px",
  },
  title: {
    color: "#ffffff",
    fontSize: "30px",
    fontWeight: "700",
    margin: "0 0 8px",
    lineHeight: 1.2,
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
  },
  logoutBtn: {
    padding: "11px 20px",
    background: "rgba(255, 255, 255, 0.03)",
    border: "1px solid rgba(52, 211, 153, 0.15)",
    borderRadius: "10px",
    color: "#34d399",
    fontSize: "14px",
    fontWeight: "500",
    cursor: "pointer",
    fontFamily: "inherit",
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
};
