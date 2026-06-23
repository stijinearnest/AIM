import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { apiGet, apiPost } from "../api/apiService";
import aimLogo from "../assets/aim-logo1.png";
import Toast from "../components/Toast";
import { isActiveStudent } from "../utils/studentStatus";

const getPhotoSrc = (photo) => {
  if (!photo) return "";
  const photoValue = String(photo);
  const looksLikeImagePath = /\.(jpg|jpeg|png|gif|webp|svg)(\?.*)?$/i.test(photoValue);
  if (
    photoValue.startsWith("data:") ||
    photoValue.startsWith("http") ||
    photoValue.startsWith("blob:") ||
    photoValue.startsWith("/") ||
    looksLikeImagePath
  ) {
    return photoValue;
  }
  return `data:image/jpeg;base64,${photoValue}`;
};

const fileToBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

export default function StudentResults() {
  const navigate = useNavigate();
  const username = localStorage.getItem("username") || "there";
  const department = localStorage.getItem("dep_name") || "Department";
  const isAdmin = localStorage.getItem("is_admin") === "true";
  const userDepartmentId = localStorage.getItem("department_id") || "";
  const [results, setResults] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [programmes, setProgrammes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [students, setStudents] = useState([]);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [showDropdown, setShowDropdown] = useState(false);
  const [toast, setToast] = useState(null);
  const containerRef = useRef(null);
  const dropdownRef = useRef(null);

  const [resultForm, setResultForm] = useState({
    result_year: new Date().getFullYear(),
    programme_id: "",
    year_of_admn: "",
  });

  const [filters, setFilters] = useState({
    department_id: isAdmin ? "" : userDepartmentId,
    programme_id: "",
    year_of_admn: "",
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

  const handleSignOut = () => {
    localStorage.clear();
    navigate("/");
  };

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    window.clearTimeout(showToast.timer);
    showToast.timer = window.setTimeout(() => setToast(null), 3200);
  };

  useEffect(() => {
    loadDepartments();
  }, []);

  const loadDepartments = async () => {
    try {
      const response = await apiGet("/students/departments/");
      setDepartments(response.departments || []);
      
      // If not admin, auto-load programmes for their department
      if (!isAdmin && userDepartmentId) {
        loadProgrammes(userDepartmentId);
      }
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

      // For non-admin users, always filter by their department
      const deptId = isAdmin ? filters.department_id : userDepartmentId;
      if (deptId)
        params.push(`department_id=${deptId}`);

      if (filters.programme_id)
        params.push(`programme_id=${filters.programme_id}`);

      if (filters.year_of_admn)
        params.push(`year_of_admn=${filters.year_of_admn}`);

      params.push("is_studying=true");

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
      department_id: isAdmin ? "" : userDepartmentId,
      programme_id: "",
      year_of_admn: "",
    });
    setProgrammes([]);
    setResults([]);
  };

  const openAddResultModal = async () => {
    await loadProgrammes(userDepartmentId);
    setShowModal(true);
  };

  const loadStudents = async () => {
    try {
      const response = await apiGet(
        `/students/by-programme/?year_of_admn=${resultForm.year_of_admn}&programme_id=${resultForm.programme_id}&is_studying=true`
      );

      const studentsWithFields = (response.students || []).filter(isActiveStudent).map((student) => ({
        ...student,
        photo: student.photo || "",
        rank: "",
        ogpa: "",
        marks: "",
        status: "P",
      }));

      setStudents(studentsWithFields);
    } catch (err) {
      console.error(err);
      showToast("Failed to load students", "error");
    }
  };

  const saveResults = async () => {
    try {
      setSaving(true);

      const payload = {
        result_year: Number(resultForm.result_year),
        year_of_admn: Number(resultForm.year_of_admn),
        programme_id: Number(resultForm.programme_id),
        department_id: Number(userDepartmentId),
        results: students.map((student) => ({
          student_id: student.stud_id,
          photo: student.photo || null,
          rank: student.rank === "" ? null : Number(student.rank),
          status: student.status || "P",
          ogpa: student.ogpa === "" ? "0.00" : student.ogpa,
          marks: student.marks === "" ? null : student.marks,
        })),
      };

      await apiPost("/result/result/add/", payload);
      showToast("Results saved successfully");
      setShowModal(false);
      setStudents([]);
      searchResults();
    } catch (err) {
      console.error(err);
      showToast("Failed to save results", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={styles.page} ref={containerRef}>
      <Toast toast={toast} onClose={() => setToast(null)} />
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
      
      {/* Enhanced orbit arcs with static glow */}
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
          cx="1850"
          cy="900"
          r="540" 
          fill="url(#glow1)"
          opacity="0.6"
          style={styles.arcTransition}
        />
        <circle 
          cx="1850"
          cy="900"
          r="700" 
          fill="url(#glow2)"
          opacity="0.4"
          style={styles.arcTransition}
        />
        <circle 
          cx="1850"
          cy="900"
          r="860" 
          fill="url(#glow3)"
          opacity="0.3"
          style={styles.arcTransition}
        />
        
        {/* Arc lines with enhanced glow */}
        <circle 
          cx="1850"
          cy="900"
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
          cx="1850"
          cy="900"
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
          cx="1850"
          cy="900"
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
        {/* Navbar with user profile dropdown */}
        <header style={styles.navbar}>
          <img 
            src={aimLogo} 
            alt="AIM" 
            style={styles.logoImg}
            onClick={() => navigate("/dashboard")}
            className="logo-home"
          />

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

        {/* Main Content */}
        <div style={styles.contentWrapper}>
          <div style={styles.header}>
            <div style={styles.headerLeft}>
              <div style={styles.titleWrapper}>
                <h2 style={styles.title}>📊 Student Results</h2>
                <p style={styles.subtitle}>
                  {isAdmin
                    ? "View and search student performance records"
                    : `Viewing student results for ${department}`}
                </p>
              </div>
            </div>
            {!isAdmin && (
              <button
                className="add-button"
                style={styles.addButton}
                onClick={openAddResultModal}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="12" y1="5" x2="12" y2="19" strokeLinecap="round"/>
                  <line x1="5" y1="12" x2="19" y2="12" strokeLinecap="round"/>
                </svg>
                Add Result
              </button>
            )}
          </div>

          {/* Filters Section */}
          <div style={styles.filtersCard}>
            <div style={styles.filtersGrid}>
              <div style={styles.filterGroup}>
                <label style={styles.filterLabel}>Department</label>
                <select
                  style={styles.filterSelect}
                  value={filters.department_id}
                  disabled={!isAdmin}
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
                  {isAdmin ? (
                    <>
                      <option value="">All Departments</option>
                      {departments.map((dept) => (
                        <option key={dept.dep_id} value={dept.dep_id}>
                          {dept.department_name}
                        </option>
                      ))}
                    </>
                  ) : (
                    <>
                      <option value={userDepartmentId}>{department}</option>
                    </>
                  )}
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

        {showModal && (
          <div style={styles.modalOverlay} onClick={() => setShowModal(false)}>
            <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
              <div style={styles.modalHeader}>
                <h5 style={styles.modalTitle}>Add Results</h5>
                <button
                  className="modal-close"
                  style={styles.modalClose}
                  onClick={() => setShowModal(false)}
                >
                  x
                </button>
              </div>

              <div style={styles.modalBody}>
                <div style={styles.modalForm}>
                  <div style={styles.formGroup}>
                    <label style={styles.formLabel}>Result Year</label>
                    <input style={styles.formInput} value={resultForm.result_year} readOnly />
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.formLabel}>Programme</label>
                    <select
                      style={styles.formSelect}
                      value={resultForm.programme_id}
                      onChange={(e) =>
                        setResultForm({
                          ...resultForm,
                          programme_id: e.target.value,
                        })
                      }
                    >
                      <option value="">Select Programme</option>
                      {programmes.map((programme) => (
                        <option
                          key={programme.programme_id}
                          value={programme.programme_id}
                          style={styles.formSelectOption}
                        >
                          {programme.programme_name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.formLabel}>Admission Year</label>
                    <input
                      type="number"
                      style={styles.formInput}
                      value={resultForm.year_of_admn}
                      onChange={(e) =>
                        setResultForm({
                          ...resultForm,
                          year_of_admn: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                <div style={styles.loadButtonRow}>
                  <button
                    className="load-button"
                    style={styles.loadButton}
                    onClick={loadStudents}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.66 0 3-4.03 3-9s-1.34-9-3-9m0 18c-1.66 0-3-4.03-3-9s1.34-9 3-9"/>
                    </svg>
                    Load Students
                  </button>
                </div>

                {students.length > 0 && (
                  <div style={styles.studentTableWrapper}>
                    <div style={styles.resultHeader}>
                      <span></span>
                      <span>OGPA</span>
                      <span>Marks</span>
                      <span>Rank</span>
                      <span>Status</span>
                      <span>Photo</span>
                    </div>

                    <div style={styles.resultRows}>
                      {students.map((student, index) => (
                        <div key={student.stud_id} style={styles.resultRow}>
                          <div style={styles.studentNameCell}>
                            {student.photo ? (
                              <img
                                src={getPhotoSrc(student.photo)}
                                alt={student.name}
                                style={styles.studentPhoto}
                              />
                            ) : (
                              <div style={styles.photoPlaceholder}>
                                {student.name?.charAt(0)?.toUpperCase() || "?"}
                              </div>
                            )}
                            <span style={styles.studentNameText}>{student.name}</span>
                          </div>

                          <input
                            style={styles.modalInput}
                            value={student.ogpa}
                            onChange={(e) => {
                              const updated = [...students];
                              updated[index].ogpa = e.target.value;
                              setStudents(updated);
                            }}
                          />

                          <input
                            style={styles.modalInput}
                            value={student.marks}
                            onChange={(e) => {
                              const updated = [...students];
                              updated[index].marks = e.target.value;
                              setStudents(updated);
                            }}
                          />

                          <input
                            style={styles.modalInput}
                            value={student.rank}
                            onChange={(e) => {
                              const updated = [...students];
                              updated[index].rank = e.target.value;
                              setStudents(updated);
                            }}
                          />

                          <select
                            style={styles.modalSelect}
                            value={student.status}
                            onChange={(e) => {
                              const updated = [...students];
                              updated[index].status = e.target.value;
                              setStudents(updated);
                            }}
                          >
                            <option value="P" style={styles.formSelectOption}>Pass</option>
                            <option value="F" style={styles.formSelectOption}>Fail</option>
                          </select>

                          <label style={styles.photoUploadButton}>
                            Add Photo
                            <input
                              type="file"
                              accept="image/*"
                              style={styles.photoInput}
                              onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (!file) return;

                                try {
                                  const photo = await fileToBase64(file);
                                  const updated = [...students];
                                  updated[index].photo = photo;
                                  setStudents(updated);
                                } catch (err) {
                                  console.error(err);
                                  showToast("Failed to read selected photo", "error");
                                }
                              }}
                            />
                          </label>
                        </div>
                      ))}
                    </div>

                    <div style={styles.modalFooter}>
                      <button
                        className="save-button"
                        style={styles.saveButton}
                        disabled={saving}
                        onClick={saveResults}
                      >
                        {saving ? "Saving..." : "Save Results"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
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
    transition: "opacity 0.3s ease",
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
    position: "relative",
    zIndex: 100,
  },
  logoImg: {
    height: "84px",
    width: "auto",
    display: "block",
    cursor: "pointer",
    transition: "all 0.25s ease",
  },
  userMenu: {
    position: "relative",
    zIndex: 9999,
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
    zIndex: 99999,
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
  contentWrapper: {
    background: "rgba(8, 16, 13, 0.6)",
    backdropFilter: "blur(14px)",
    borderRadius: "20px",
    border: "1px solid rgba(52, 211, 153, 0.08)",
    padding: "32px",
    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.35)",
    position: "relative",
    zIndex: 1,
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
  addButton: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "11px 24px",
    background: "linear-gradient(135deg, #10b981, #059669)",
    border: "none",
    borderRadius: "10px",
    color: "#ffffff",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    fontFamily: "inherit",
    transition: "all 0.3s ease",
    boxShadow: "0 4px 16px rgba(16, 185, 129, 0.25)",
    whiteSpace: "nowrap",
    flexShrink: 0,
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
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(0,0,0,0.7)",
    backdropFilter: "blur(4px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
    padding: "20px",
  },
  modal: {
    background: "#0a140e",
    borderRadius: "20px",
    maxWidth: "1200px",
    width: "100%",
    maxHeight: "90vh",
    display: "flex",
    flexDirection: "column",
    border: "1px solid rgba(52, 211, 153, 0.08)",
    boxShadow: "0 24px 64px rgba(0,0,0,0.6), 0 0 40px rgba(52, 211, 153, 0.02)",
  },
  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "24px 28px",
    borderBottom: "1px solid rgba(52, 211, 153, 0.06)",
  },
  modalTitle: {
    color: "#ffffff",
    fontSize: "20px",
    fontWeight: "600",
    margin: 0,
  },
  modalClose: {
    background: "rgba(255,255,255,0.03)",
    border: "none",
    borderRadius: "8px",
    color: "rgba(255,255,255,0.5)",
    width: "36px",
    height: "36px",
    fontSize: "18px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.2s ease",
  },
  modalBody: {
    padding: "28px",
    overflowY: "auto",
  },
  modalForm: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "16px",
    marginBottom: "20px",
  },
  formGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  formLabel: {
    color: "rgba(255,255,255,0.6)",
    fontSize: "13px",
    fontWeight: "500",
  },
  formInput: {
    padding: "10px 14px",
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(52, 211, 153, 0.08)",
    borderRadius: "8px",
    color: "#ffffff",
    fontSize: "14px",
    outline: "none",
    fontFamily: "inherit",
  },
  formSelect: {
    padding: "10px 14px",
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(52, 211, 153, 0.12)",
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
  formSelectOption: {
    background: "#0a140e",
    color: "#ffffff",
  },
  loadButtonRow: {
    display: "flex",
    justifyContent: "flex-end",
    marginBottom: "20px",
  },
  loadButton: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    padding: "10px 20px",
    background: "rgba(52, 211, 153, 0.08)",
    border: "1px solid rgba(52, 211, 153, 0.12)",
    borderRadius: "8px",
    color: "#34d399",
    fontSize: "14px",
    fontWeight: "500",
    cursor: "pointer",
    fontFamily: "inherit",
    transition: "all 0.2s ease",
  },
  studentTableWrapper: {
    marginTop: "8px",
    border: "1px solid rgba(52, 211, 153, 0.06)",
    borderRadius: "10px",
    overflow: "hidden",
  },
  resultHeader: {
    display: "grid",
    gridTemplateColumns: "minmax(260px, 1fr) 110px 110px 90px 120px 100px",
    gap: "12px",
    alignItems: "center",
    padding: "12px",
    position: "sticky",
    top: 0,
    zIndex: 3,
    background: "#0a140e",
    borderBottom: "1px solid rgba(52, 211, 153, 0.08)",
    color: "rgba(255,255,255,0.4)",
    fontSize: "11px",
    fontWeight: "500",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  resultRows: {
    maxHeight: "420px",
    overflowY: "auto",
  },
  resultRow: {
    display: "grid",
    gridTemplateColumns: "minmax(260px, 1fr) 110px 110px 90px 120px 100px",
    gap: "12px",
    alignItems: "center",
    padding: "10px 12px",
    borderBottom: "1px solid rgba(52, 211, 153, 0.04)",
  },
  studentNameCell: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    minWidth: 0,
    overflowX: "auto",
    paddingBottom: "2px",
  },
  studentNameText: {
    color: "rgba(255,255,255,0.82)",
    fontSize: "13px",
    whiteSpace: "nowrap",
  },
  studentPhoto: {
    width: "42px",
    height: "42px",
    borderRadius: "8px",
    objectFit: "cover",
    border: "1px solid rgba(52, 211, 153, 0.14)",
    background: "rgba(255,255,255,0.03)",
    flexShrink: 0,
  },
  photoPlaceholder: {
    width: "42px",
    height: "42px",
    borderRadius: "8px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "rgba(52, 211, 153, 0.08)",
    border: "1px solid rgba(52, 211, 153, 0.14)",
    color: "#34d399",
    fontSize: "15px",
    fontWeight: "600",
    flexShrink: 0,
  },
  photoUploadButton: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    justifySelf: "start",
    minHeight: "30px",
    padding: "5px 8px",
    background: "rgba(52, 211, 153, 0.08)",
    border: "1px solid rgba(52, 211, 153, 0.12)",
    borderRadius: "6px",
    color: "#34d399",
    fontSize: "11px",
    fontWeight: "500",
    cursor: "pointer",
    whiteSpace: "nowrap",
  },
  photoInput: {
    display: "none",
  },
  modalInput: {
    width: "100%",
    boxSizing: "border-box",
    padding: "8px 10px",
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(52, 211, 153, 0.06)",
    borderRadius: "6px",
    color: "#ffffff",
    fontSize: "13px",
    outline: "none",
    fontFamily: "inherit",
  },
  modalSelect: {
    width: "100%",
    boxSizing: "border-box",
    padding: "8px 10px",
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(52, 211, 153, 0.1)",
    borderRadius: "6px",
    color: "#ffffff",
    fontSize: "13px",
    outline: "none",
    fontFamily: "inherit",
    cursor: "pointer",
    appearance: "none",
    WebkitAppearance: "none",
    MozAppearance: "none",
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 10 10'%3E%3Cpath fill='%2334d399' d='M5 7L1 3h8z'/%3E%3C/svg%3E")`,
    backgroundRepeat: "no-repeat",
    backgroundPosition: "right 8px center",
    paddingRight: "28px",
  },
  modalFooter: {
    display: "flex",
    justifyContent: "flex-end",
    marginTop: "20px",
    paddingTop: "20px",
    borderTop: "1px solid rgba(52, 211, 153, 0.06)",
  },
  saveButton: {
    padding: "12px 28px",
    background: "linear-gradient(135deg, #10b981, #059669)",
    border: "none",
    borderRadius: "10px",
    color: "#ffffff",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    fontFamily: "inherit",
    transition: "all 0.3s ease",
    boxShadow: "0 4px 16px rgba(16, 185, 129, 0.25)",
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

    @keyframes dropdownSlide {
      0% { opacity: 0; transform: translateY(-8px) scale(0.98); }
      100% { opacity: 1; transform: translateY(0) scale(1); }
    }

    .logo-home:hover {
      transform: scale(1.05);
      filter: brightness(1.2);
    }

    .user-menu-btn:hover {
      background: rgba(52, 211, 153, 0.06);
      border-color: rgba(52, 211, 153, 0.3);
    }

    .dropdown-signout:hover {
      background: rgba(239, 68, 68, 0.08);
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

    select:disabled {
      opacity: 0.7;
      cursor: not-allowed;
      background-color: rgba(255, 255, 255, 0.02);
    }

    @media (prefers-reduced-motion: reduce) {
      .star-field span, .arc-field circle { 
        transition: none !important; 
        animation: none !important;
      }
      .dropdown { animation: none !important; }
    }

    @media (max-width: 860px) {
      .container { padding: 16px !important; }
      .content-wrapper { padding: 20px !important; }
      .navbar { padding: 12px 16px !important; }
      .logo-img { height: 48px !important; }
      .user-menu-btn { padding: 6px 12px 6px 8px !important; }
      .user-name { font-size: 13px !important; }
      .user-avatar { width: 28px !important; height: 28px !important; }
      .user-avatar svg { width: 16px !important; height: 16px !important; }
      .dropdown { right: -8px !important; min-width: 200px !important; }
      .dropdown-avatar { width: 36px !important; height: 36px !important; }
      .dropdown-avatar svg { width: 20px !important; height: 20px !important; }
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
      .dropdown { right: -12px !important; min-width: 180px !important; }
    }
  `;
  document.head.appendChild(styleSheet);
}
