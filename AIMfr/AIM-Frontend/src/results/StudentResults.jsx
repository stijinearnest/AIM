import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { apiGet } from "../api/apiService";
import aimLogo from "../assets/aim-logo1.png";

export default function StudentResults() {
  const navigate = useNavigate();
  const [results, setResults] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [programmes, setProgrammes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);

  const [filters, setFilters] = useState({
    department_id: "",
    programme_id: "",
    year_of_admn: "",
    result_year: "",
  });

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

  useEffect(() => {
    loadDepartments();
  }, []);

  const loadDepartments = async () => {
    try {
      const response = await apiGet("/students/departments/");
      setDepartments(response.departments || []);
    } catch (err) {
      console.error(err);
    }
  };

  const loadProgrammes = async (departmentId) => {
    try {
      const response = await apiGet(
        `/students/programmes/?department_id=${departmentId}`
      );
      setProgrammes(response.programmes || []);
    } catch (err) {
      console.error(err);
    }
  };

  const searchResults = async () => {
    try {
      setLoading(true);
      const params = [];

      if (filters.department_id)
        params.push(`department_id=${filters.department_id}`);

      if (filters.programme_id)
        params.push(`programme_id=${filters.programme_id}`);

      if (filters.year_of_admn)
        params.push(`year_of_admn=${filters.year_of_admn}`);

      if (filters.result_year)
        params.push(`result_year=${filters.result_year}`);

      const response = await apiGet(
        `/result/student-results/?${params.join("&")}`
      );

      setResults(response);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFilters({
      department_id: "",
      programme_id: "",
      year_of_admn: "",
      result_year: "",
    });
    setProgrammes([]);
    setResults([]);
  };

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
                <h2 style={styles.title}>📊 Student Results</h2>
                <p style={styles.subtitle}>View and search student performance records</p>
              </div>
            </div>
          </div>

          {/* Filters Section */}
          <div style={styles.filtersCard}>
            <div style={styles.filtersGrid}>
              <div style={styles.filterGroup}>
                <label style={styles.filterLabel}>Department</label>
                <select
                  style={styles.filterSelect}
                  value={filters.department_id}
                  onChange={(e) => {
                    const deptId = e.target.value;
                    setFilters({
                      ...filters,
                      department_id: deptId,
                      programme_id: "",
                    });
                    loadProgrammes(deptId);
                  }}
                >
                  <option value="">All Departments</option>
                  {departments.map((dept) => (
                    <option key={dept.dep_id} value={dept.dep_id}>
                      {dept.department_name}
                    </option>
                  ))}
                </select>
              </div>

              <div style={styles.filterGroup}>
                <label style={styles.filterLabel}>Programme</label>
                <select
                  style={styles.filterSelect}
                  value={filters.programme_id}
                  onChange={(e) =>
                    setFilters({
                      ...filters,
                      programme_id: e.target.value,
                    })
                  }
                >
                  <option value="">All Programmes</option>
                  {programmes.map((pgm) => (
                    <option key={pgm.programme_id} value={pgm.programme_id}>
                      {pgm.programme_name}
                    </option>
                  ))}
                </select>
              </div>

              <div style={styles.filterGroup}>
                <label style={styles.filterLabel}>Admission Year</label>
                <input
                  type="number"
                  style={styles.filterInput}
                  placeholder="e.g. 2021"
                  value={filters.year_of_admn}
                  onChange={(e) =>
                    setFilters({
                      ...filters,
                      year_of_admn: e.target.value,
                    })
                  }
                />
              </div>

              <div style={styles.filterGroup}>
                <label style={styles.filterLabel}>Result Year</label>
                <input
                  type="number"
                  style={styles.filterInput}
                  placeholder="e.g. 2024"
                  value={filters.result_year}
                  onChange={(e) =>
                    setFilters({
                      ...filters,
                      result_year: e.target.value,
                    })
                  }
                />
              </div>
            </div>

            <div style={styles.filterActions}>
              <button style={styles.searchButton} onClick={searchResults}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <circle cx="11" cy="11" r="8" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M21 21l-4.35-4.35" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Search
              </button>
              <button style={styles.resetButton} onClick={handleReset}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 12a9 9 0 1 0 9-9m0 0v6m0-6h-6" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Reset
              </button>
            </div>
          </div>

          {/* Results Section */}
          <div style={styles.resultsCard}>
            <div style={styles.resultsHeader}>
              <span style={styles.resultsCount}>
                {results.length} {results.length === 1 ? "Result" : "Results"} Found
              </span>
              {loading && <span style={styles.loadingBadge}>Loading...</span>}
            </div>

            {loading ? (
              <div style={styles.loadingContainer}>
                <div style={styles.loadingSpinner}></div>
                <p style={styles.loadingText}>Searching results...</p>
              </div>
            ) : results.length > 0 ? (
              <div style={styles.tableWrapper}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Admission No</th>
                      <th style={styles.th}>Roll No</th>
                      <th style={styles.th}>Name</th>
                      <th style={styles.th}>Department</th>
                      <th style={styles.th}>Programme</th>
                      <th style={styles.th}>OGPA</th>
                      <th style={styles.th}>Marks</th>
                      <th style={styles.th}>Status</th>
                      <th style={styles.th}>Rank</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((student) => (
                      <tr key={student.student_id} style={styles.tr}>
                        <td style={styles.td}>{student.admn_no || "-"}</td>
                        <td style={styles.td}>{student.roll_no || "-"}</td>
                        <td style={styles.td}>
                          <span style={styles.studentName}>{student.student_name}</span>
                        </td>
                        <td style={styles.td}>{student.department_name || "-"}</td>
                        <td style={styles.td}>{student.programme_name || "-"}</td>
                        <td style={styles.td}>
                          <span style={styles.ogpaBadge}>{student.ogpa || "N/A"}</span>
                        </td>
                        <td style={styles.td}>{student.marks || "N/A"}</td>
                        <td style={styles.td}>
                          <span style={student.status === "P" ? styles.statusPass : styles.statusFail}>
                            {student.status === "P" ? "Pass" : student.status === "F" ? "Fail" : student.status || "-"}
                          </span>
                        </td>
                        <td style={styles.td}>
                          <span style={styles.rankBadge}>#{student.rank || "-"}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div style={styles.emptyState}>
                <span style={styles.emptyIcon}>🔍</span>
                <p style={styles.emptyText}>No results found</p>
                <p style={styles.emptySubtext}>Apply filters and click Search to find student results</p>
              </div>
            )}
          </div>
        </div>
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
  filtersCard: {
    background: "rgba(255,255,255,0.02)",
    border: "1px solid rgba(52, 211, 153, 0.06)",
    borderRadius: "16px",
    padding: "24px",
    marginBottom: "24px",
  },
  filtersGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "16px",
    marginBottom: "16px",
  },
  filterGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  filterLabel: {
    color: "rgba(255,255,255,0.5)",
    fontSize: "12px",
    fontWeight: "500",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  filterSelect: {
    padding: "10px 14px",
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(52, 211, 153, 0.08)",
    borderRadius: "8px",
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
    backgroundPosition: "right 12px center",
    paddingRight: "36px",
  },
  filterInput: {
    padding: "10px 14px",
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(52, 211, 153, 0.08)",
    borderRadius: "8px",
    color: "#ffffff",
    fontSize: "14px",
    outline: "none",
    fontFamily: "inherit",
  },
  filterActions: {
    display: "flex",
    gap: "12px",
    justifyContent: "flex-end",
  },
  searchButton: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "10px 24px",
    background: "linear-gradient(135deg, #10b981, #059669)",
    border: "none",
    borderRadius: "8px",
    color: "#ffffff",
    fontSize: "14px",
    fontWeight: "500",
    cursor: "pointer",
    fontFamily: "inherit",
    transition: "all 0.3s ease",
    boxShadow: "0 4px 16px rgba(16, 185, 129, 0.2)",
  },
  resetButton: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "10px 20px",
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(52, 211, 153, 0.12)",
    borderRadius: "8px",
    color: "rgba(255,255,255,0.6)",
    fontSize: "14px",
    fontWeight: "500",
    cursor: "pointer",
    fontFamily: "inherit",
    transition: "all 0.3s ease",
  },
  resultsCard: {
    background: "rgba(255,255,255,0.02)",
    border: "1px solid rgba(52, 211, 153, 0.06)",
    borderRadius: "16px",
    overflow: "hidden",
  },
  resultsHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px 24px",
    borderBottom: "1px solid rgba(52, 211, 153, 0.06)",
  },
  resultsCount: {
    color: "rgba(255,255,255,0.6)",
    fontSize: "14px",
    fontWeight: "500",
  },
  loadingBadge: {
    color: "#34d399",
    fontSize: "13px",
    fontWeight: "500",
  },
  loadingContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "60px 20px",
    gap: "16px",
  },
  loadingSpinner: {
    width: "36px",
    height: "36px",
    border: "3px solid rgba(52, 211, 153, 0.08)",
    borderTop: "3px solid #34d399",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },
  loadingText: {
    color: "rgba(255,255,255,0.4)",
    fontSize: "14px",
    margin: 0,
  },
  tableWrapper: {
    padding: "8px",
    overflowX: "auto",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: "14px",
  },
  th: {
    textAlign: "left",
    padding: "14px 16px",
    color: "rgba(255,255,255,0.4)",
    fontSize: "12px",
    fontWeight: "500",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    borderBottom: "1px solid rgba(52, 211, 153, 0.06)",
  },
  tr: {
    transition: "background 0.2s ease",
  },
  td: {
    padding: "14px 16px",
    color: "rgba(255,255,255,0.8)",
    borderBottom: "1px solid rgba(52, 211, 153, 0.04)",
  },
  studentName: {
    fontWeight: "500",
    color: "#ffffff",
  },
  ogpaBadge: {
    display: "inline-block",
    padding: "2px 10px",
    background: "rgba(52, 211, 153, 0.08)",
    borderRadius: "12px",
    color: "#34d399",
    fontSize: "13px",
    fontWeight: "500",
  },
  rankBadge: {
    display: "inline-block",
    padding: "2px 10px",
    background: "rgba(52, 211, 153, 0.1)",
    borderRadius: "12px",
    color: "#34d399",
    fontSize: "13px",
    fontWeight: "600",
  },
  statusPass: {
    display: "inline-block",
    padding: "4px 12px",
    borderRadius: "6px",
    background: "rgba(52, 211, 153, 0.12)",
    color: "#34d399",
    fontSize: "12px",
    fontWeight: "500",
  },
  statusFail: {
    display: "inline-block",
    padding: "4px 12px",
    borderRadius: "6px",
    background: "rgba(239, 68, 68, 0.12)",
    color: "#f87171",
    fontSize: "12px",
    fontWeight: "500",
  },
  emptyState: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "8px",
    padding: "60px 20px",
  },
  emptyIcon: {
    fontSize: "48px",
  },
  emptyText: {
    color: "rgba(255,255,255,0.6)",
    fontSize: "16px",
    margin: 0,
  },
  emptySubtext: {
    color: "rgba(255,255,255,0.3)",
    fontSize: "13px",
    margin: 0,
  },
};

// Add CSS animations and hover effects
if (typeof document !== "undefined" && !document.getElementById("student-results-style")) {
  const styleSheet = document.createElement("style");
  styleSheet.id = "student-results-style";
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

    .search-button:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(16, 185, 129, 0.35);
    }

    .reset-button:hover {
      background: rgba(255,255,255,0.06);
      border-color: rgba(52, 211, 153, 0.2);
    }

    .table tbody tr:hover {
      background: rgba(52, 211, 153, 0.02);
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
      .header-left { flex-wrap: wrap !important; }
      .title { font-size: 22px !important; }
      .filters-grid { grid-template-columns: 1fr !important; }
      .filter-actions { flex-direction: column !important; }
      .search-button, .reset-button { justify-content: center !important; }
      .table td, .table th { padding: 10px 12px !important; font-size: 12px !important; }
    }

    @media (max-width: 480px) {
      .container { padding: 12px !important; }
      .content-wrapper { padding: 16px !important; }
      .filters-card { padding: 16px !important; }
      .results-header { flex-direction: column !important; align-items: flex-start !important; gap: 8px !important; }
      .table td, .table th { padding: 8px !important; font-size: 11px !important; }
    }
  `;
  document.head.appendChild(styleSheet);
}