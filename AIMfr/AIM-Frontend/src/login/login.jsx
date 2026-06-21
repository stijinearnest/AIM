import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiGet, apiPost } from "../api/apiService";

import bgImage from "../assets/bg-temple.png";
import aimLogo from "../assets/aim-logo.png";
import aimLogo1 from "../assets/aim-logo1.png";

const isAdminLogin = (response, username) => {
  const roleValue = String(
    response.role || response.user_role || response.user_type || response.account_type || ""
  ).toLowerCase();

  return Boolean(
    response.is_admin ||
      response.is_staff ||
      response.is_superuser ||
      roleValue === "admin" ||
      roleValue === "administrator" ||
      String(username).trim().toLowerCase() === "admin"
  );
};

export default function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await apiPost("/users/login/", {
        username: formData.username,
        password: formData.password,
      });

      localStorage.setItem("access_token", response.access);
      localStorage.setItem("refresh_token", response.refresh);
      localStorage.setItem("username", response.username || formData.username);
      localStorage.setItem("is_admin", isAdminLogin(response, formData.username) ? "true" : "false");

      if (response.user_id) {
        localStorage.setItem("user_id", response.user_id);
      }

      if (response.department_id) {
        localStorage.setItem("department_id", response.department_id);
        const department = await apiGet(
          `/students/department/?department_id=${response.department_id}`
        );
        localStorage.setItem("dep_name", department.department_name);
      }

      navigate("/dashboard");
    } catch (error) {
      console.error(error);
      alert("Invalid username or password");
    }
  };

  return (
    <>
      {/* ── Responsive styles injected once ── */}
      <style>{`
        *, *::before, *::after { box-sizing: border-box; }

        .aim-page {
          min-height: 100vh;
          height: 100vh;
          display: flex;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          background: #080d0a;
          overflow: hidden;
        }

        /* ── LEFT PANEL ── */
        .aim-left {
          flex: 1;
          position: relative;
          display: flex;
          overflow: hidden;
          min-width: 0;
        }

        .aim-bg {
          position: absolute;
          inset: 0;
          background-image: url(${bgImage});
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
          z-index: 0;
        }

        .aim-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            to right,
            rgba(4,10,7,0.93) 0%,
            rgba(4,10,7,0.75) 55%,
            rgba(4,10,7,0.2) 100%
          );
          z-index: 1;
        }

        .aim-left-content {
          position: relative;
          z-index: 2;
          display: flex;
          flex-direction: column;
          width: 100%;
          padding: 48px 60px 52px;
        }

        /* Brand row */
        .aim-brand-row {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .aim-brand-logo {
          width: clamp(160px, 18vw, 260px);
          height: clamp(160px, 18vw, 260px);
          object-fit: contain;
          flex-shrink: 0;
        }

        /* Spacer */
        .aim-spacer { flex: 1; }

        /* Hero text */
        .aim-hero-text { margin-bottom: 20px; }

        .aim-hero-line {
          color: #ffffff;
          font-size: clamp(36px, 5vw, 68px);
          font-weight: 800;
          line-height: 1.1;
          letter-spacing: -2px;
        }

        .aim-hero-accent { color: #34d399; }

        /* Description */
        .aim-hero-desc {
          color: rgba(255,255,255,0.5);
          font-size: clamp(13px, 1.1vw, 15px);
          line-height: 1.75;
          max-width: 400px;
          margin: 0 0 44px;
          font-weight: 400;
        }

        /* Feature row */
        .aim-feature-row {
          display: flex;
          align-items: center;
          gap: clamp(16px, 2.5vw, 32px);
        }

        .aim-feature-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
        }

        .aim-feature-label {
          color: rgba(255,255,255,0.55);
          font-size: clamp(11px, 1vw, 13px);
          font-weight: 500;
          letter-spacing: 0.3px;
        }

        .aim-feature-divider {
          width: 1px;
          height: 48px;
          background: rgba(52,211,153,0.15);
        }

        /* ── RIGHT PANEL ── */
        .aim-right {
          width: clamp(340px, 32vw, 480px);
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: clamp(24px, 3vw, 48px) clamp(24px, 3.5vw, 52px);
          background: rgba(6,14,10,0.55);
          backdrop-filter: blur(10px);
          border-left: 1px solid rgba(52,211,153,0.06);
          overflow-y: auto;
        }

        /* Card */
        .aim-card { width: 100%; }

        /* Card logo section */
        .aim-card-logo-section {
          text-align: center;
          margin-bottom: clamp(20px, 2.5vh, 32px);
        }

        .aim-card-logo-box {
          width: clamp(64px, 6vw, 88px);
          height: clamp(64px, 6vw, 88px);
          margin: 0 auto clamp(12px, 1.5vh, 20px);
          background: rgba(52,211,153,0.08);
          border-radius: 22px;
          border: 1px solid rgba(52,211,153,0.18);
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: visible;
        }

        .aim-card-logo {
          width: clamp(80px, 8vw, 120px);
          height: clamp(80px, 8vw, 120px);
          object-fit: contain;
        }

        .aim-title {
          color: #ffffff;
          font-size: clamp(22px, 2.2vw, 30px);
          font-weight: 700;
          margin: 0 0 6px;
          letter-spacing: -0.5px;
        }

        .aim-subtitle {
          color: rgba(255,255,255,0.45);
          font-size: clamp(12px, 1vw, 14px);
          margin: 0;
          font-weight: 400;
        }

        /* Form */
        .aim-form {
          display: flex;
          flex-direction: column;
          gap: clamp(12px, 1.5vh, 18px);
        }

        .aim-input-group {
          display: flex;
          flex-direction: column;
          gap: 7px;
        }

        .aim-label {
          color: rgba(255,255,255,0.65);
          font-size: clamp(11px, 0.9vw, 13px);
          font-weight: 500;
          letter-spacing: 0.2px;
        }

        .aim-input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }

        .aim-input-icon {
          position: absolute;
          left: 14px;
          pointer-events: none;
          z-index: 1;
          flex-shrink: 0;
        }

        .aim-input {
          width: 100%;
          padding: clamp(10px, 1.2vh, 14px) 16px clamp(10px, 1.2vh, 14px) 42px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(52,211,153,0.12);
          border-radius: 12px;
          color: #ffffff;
          font-size: clamp(12px, 1vw, 14px);
          outline: none;
          font-family: inherit;
          transition: all 0.2s ease;
          box-sizing: border-box;
        }

        .aim-input:focus {
          border-color: rgba(52,211,153,0.4) !important;
          background: rgba(255,255,255,0.06) !important;
          box-shadow: 0 0 0 3px rgba(52,211,153,0.08);
        }

        .aim-input:hover {
          border-color: rgba(52,211,153,0.22) !important;
        }

        .aim-eye-btn {
          position: absolute;
          right: 14px;
          background: none;
          border: none;
          cursor: pointer;
          padding: 0;
          display: flex;
          align-items: center;
          z-index: 1;
        }

        /* Sign In button */
        .aim-btn-signin {
          width: 100%;
          border: none;
          border-radius: 12px;
          color: #ffffff;
          font-size: clamp(13px, 1.1vw, 15px);
          font-weight: 600;
          padding: clamp(12px, 1.4vh, 16px);
          cursor: pointer;
          font-family: inherit;
          background: linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%);
          margin-top: 4px;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
          box-shadow: 0 4px 16px rgba(16,185,129,0.3);
        }

        .aim-btn-signin:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 24px rgba(16,185,129,0.45);
        }

        .aim-btn-signin:active {
          transform: translateY(0);
        }

        /* Divider */
        .aim-divider {
          display: flex;
          align-items: center;
          margin: 2px 0;
        }

        .aim-divider-line {
          flex: 1;
          height: 1px;
          background: rgba(52,211,153,0.1);
        }

        /* ── BREAKPOINTS ── */

        /* Large laptops / small desktops: 1024px–1280px */
        @media (max-width: 1280px) {
          .aim-left-content { padding: 40px 48px 44px; }
          .aim-right { width: clamp(320px, 35vw, 440px); }
        }

        /* Standard laptops: 768px–1024px */
        @media (max-width: 1024px) {
          .aim-left-content { padding: 36px 40px 40px; }
          .aim-hero-line { font-size: clamp(30px, 4.5vw, 52px); letter-spacing: -1.5px; }
          .aim-right { width: clamp(300px, 38vw, 400px); }
          .aim-brand-logo {
            width: clamp(120px, 15vw, 200px);
            height: clamp(120px, 15vw, 200px);
          }
        }

        /* Tablets / small laptops: below 768px → stack vertically */
        @media (max-width: 768px) {
          .aim-page {
            flex-direction: column;
            height: auto;
            overflow-y: auto;
          }
          .aim-left {
            min-height: 40vh;
            flex: none;
          }
          .aim-left-content { padding: 32px 32px 36px; }
          .aim-brand-logo { width: 120px; height: 120px; }
          .aim-hero-line { font-size: 36px; }
          .aim-right {
            width: 100%;
            min-height: 60vh;
            border-left: none;
            border-top: 1px solid rgba(52,211,153,0.06);
            padding: 32px 24px 40px;
          }
          .aim-spacer { min-height: 32px; flex: none; }
        }

        @media (max-width: 480px) {
          .aim-left-content { padding: 24px 20px 28px; }
          .aim-brand-logo { width: 90px; height: 90px; }
          .aim-hero-line { font-size: 28px; letter-spacing: -1px; }
          .aim-hero-desc { font-size: 13px; margin-bottom: 28px; }
          .aim-right { padding: 24px 16px 32px; }
        }
      `}</style>

      <div className="aim-page">

        {/* ══════════════ LEFT PANEL ══════════════ */}
        <div className="aim-left">
          <div className="aim-bg" />
          <div className="aim-overlay" />

          <div className="aim-left-content">

            {/* Brand row — top */}
            <div className="aim-brand-row">
              <img src={aimLogo1} alt="AIM Logo" className="aim-brand-logo" />
            </div>

            {/* Spacer */}
            <div className="aim-spacer" />

            {/* Hero text */}
            <div className="aim-hero-text">
              <div className="aim-hero-line">Streamline.</div>
              <div className="aim-hero-line">Accredit.</div>
              <div className="aim-hero-line aim-hero-accent">Excel.</div>
            </div>

            {/* Description */}
            <p className="aim-hero-desc">
              AIM empowers institutions to manage accreditation
              processes, ensure compliance, and drive continuous improvement.
            </p>

            {/* Feature icons */}
            <div className="aim-feature-row">
              <div className="aim-feature-item">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
                    stroke="#34d399" strokeWidth="1.5" strokeLinejoin="round" />
                  <path d="M9 12l2 2 4-4" stroke="#34d399" strokeWidth="1.5"
                    strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span className="aim-feature-label">Secure</span>
              </div>

              <div className="aim-feature-divider" />

              <div className="aim-feature-item">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                  <rect x="2" y="3" width="20" height="5" rx="1" stroke="#34d399" strokeWidth="1.5" />
                  <rect x="2" y="10" width="20" height="5" rx="1" stroke="#34d399" strokeWidth="1.5" />
                  <rect x="2" y="17" width="20" height="5" rx="1" stroke="#34d399" strokeWidth="1.5" />
                </svg>
                <span className="aim-feature-label">Organized</span>
              </div>

              <div className="aim-feature-divider" />

              <div className="aim-feature-item">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"
                    stroke="#34d399" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span className="aim-feature-label">Insightful</span>
              </div>
            </div>

          </div>
        </div>

        {/* ══════════════ RIGHT PANEL ══════════════ */}
        <div className="aim-right">
          <div className="aim-card">

            {/* Card logo */}
            <div className="aim-card-logo-section">
              <div className="aim-card-logo-box">
                <img src={aimLogo} alt="AIM Logo" className="aim-card-logo" />
              </div>
              <h1 className="aim-title">Welcome Back</h1>
              <p className="aim-subtitle">Sign in to your AIM account</p>
            </div>

            <form onSubmit={handleSubmit} className="aim-form">

              {/* Username */}
              <div className="aim-input-group">
                <label className="aim-label">Username or Email</label>
                <div className="aim-input-wrapper">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="aim-input-icon">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"
                      stroke="rgba(255,255,255,0.35)" strokeWidth="1.5" strokeLinecap="round" />
                    <circle cx="12" cy="7" r="4" stroke="rgba(255,255,255,0.35)" strokeWidth="1.5" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Enter your username or email"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="aim-input"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="aim-input-group">
                <label className="aim-label">Password</label>
                <div className="aim-input-wrapper">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="aim-input-icon">
                    <rect x="3" y="11" width="18" height="11" rx="2"
                      stroke="rgba(255,255,255,0.35)" strokeWidth="1.5" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"
                      stroke="rgba(255,255,255,0.35)" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="aim-input"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="aim-eye-btn">
                    {showPassword ? (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"
                          stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" strokeLinecap="round" />
                        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"
                          stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" strokeLinecap="round" />
                        <line x1="1" y1="1" x2="23" y2="23"
                          stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" strokeLinecap="round" />
                      </svg>
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"
                          stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" />
                        <circle cx="12" cy="12" r="3" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Sign In */}
              <button type="submit" className="aim-btn-signin">
                Sign In
              </button>

              {/* Divider */}
              <div className="aim-divider">
                <div className="aim-divider-line" />
              </div>

            </form>

          </div>
        </div>

      </div>
    </>
  );
}
