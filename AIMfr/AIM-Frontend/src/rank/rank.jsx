import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiGet, apiPost } from "../api/apiService";
import aimLogo from "../assets/aim-logo1.png";

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

export default function Rank() {
  const navigate = useNavigate();
  const isAdmin = localStorage.getItem("is_admin") === "true";
  const [ranks, setRanks] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [programmes, setProgrammes] = useState([]);
  const [students, setStudents] = useState([]);

  const [resultForm, setResultForm] = useState({
    result_year: new Date().getFullYear(),
    programme_id: "",
    year_of_admn: "",
  });

  const loadRanks = useCallback(async () => {
    try {
      const departmentId = Number(localStorage.getItem("department_id"));
      console.log("Department ID:", departmentId);

      const rankList = await apiGet("/result");
      console.log("Rank API Response:", rankList);

      if (!Array.isArray(rankList)) {
        setErrorMessage("Invalid rank data received.");
        return;
      }

      const filteredRanks = isAdmin
        ? rankList
        : rankList.filter((student) => Number(student.department_id) === departmentId);

      filteredRanks.sort((a, b) => a.rank - b.rank);

      const departmentNamesById = new Map();

      if (isAdmin) {
        const departmentIds = [
          ...new Set(
            filteredRanks
              .map((student) => student.department_id)
              .filter((departmentIdValue) => departmentIdValue != null)
              .map((departmentIdValue) => Number(departmentIdValue))
          ),
        ];

        await Promise.all(
          departmentIds.map(async (rankDepartmentId) => {
            try {
              const department = await apiGet(
                `/students/department/?department_id=${rankDepartmentId}`
              );
              departmentNamesById.set(rankDepartmentId, department.department_name);
            } catch (error) {
              console.error("Department details fetch failed:", error);
              departmentNamesById.set(rankDepartmentId, `Department ${rankDepartmentId}`);
            }
          })
        );
      }

      const ranksWithStudentDetails = await Promise.all(
        filteredRanks.map(async (studentRank) => {
          try {
            const rankDepartmentId = Number(studentRank.department_id);
            const studentDetails = await apiGet(
              `/students/student/?stud_id=${studentRank.student_id}`
            );

            return {
              ...studentRank,
              admission_no: studentDetails.admn_no,
              roll_no: studentDetails.roll_no,
              student_name: studentDetails.name || studentRank.student_name,
              programme_name: studentDetails.programme?.programme_name || studentRank.programme_name,
              department_name:
                studentDetails.department?.department_name ||
                studentDetails.department_name ||
                studentRank.department_name ||
                studentRank.department?.department_name ||
                departmentNamesById.get(rankDepartmentId) ||
                `Department ${studentRank.department_id || "-"}`,
              year_of_admn: studentDetails.year_of_admn || studentRank.year_of_admn,
              photo: studentDetails.photo || studentRank.photo || "",
            };
          } catch (error) {
            console.error("Student details fetch failed:", error);
            return { ...studentRank };
          }
        })
      );

      setRanks(ranksWithStudentDetails);
    } catch (error) {
      console.error(error);
      setErrorMessage("Unable to load rank details.");
    } finally {
      setLoading(false);
    }
  }, [isAdmin]);

  const loadProgrammes = async () => {
    try {
      const departmentId = localStorage.getItem("department_id");
      const response = await apiGet(`/students/programmes/?department_id=${departmentId}`);
      setProgrammes(response.programmes || []);
    } catch (error) {
      console.error(error);
    }
  };

  const openAddResultModal = async () => {
    await loadProgrammes();
    setShowModal(true);
  };

  const loadStudents = async () => {
    try {
      const response = await apiGet(
        `/students/by-programme/?year_of_admn=${resultForm.year_of_admn}&programme_id=${resultForm.programme_id}`
      );

      const studentsWithFields = response.students.map((student) => ({
        ...student,
        photo: student.photo || "",
        rank: "",
        ogpa: "",
        marks: "",
        status: "P",
      }));

      setStudents(studentsWithFields);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      loadRanks();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [loadRanks]);

  const saveResults = async () => {
    try {
      setSaving(true);

      const departmentId = Number(localStorage.getItem("department_id"));

      const payload = {
        result_year: Number(resultForm.result_year),
        year_of_admn: Number(resultForm.year_of_admn),
        programme_id: Number(resultForm.programme_id),
        department_id: departmentId,
        results: students.map((student) => ({
          student_id: student.stud_id,
          photo: student.photo || null,
          rank: student.rank === "" ? null : Number(student.rank),
          status: student.status || "P",
          ogpa: student.ogpa === "" ? "0.00" : student.ogpa,
          marks: student.marks === "" ? null : student.marks,
        })),
      };

      console.log(payload);

      const response = await apiPost("/result/result/add/", payload);
      alert("Results saved successfully");
      console.log(response);

      setShowModal(false);
      loadRanks();
    } catch (error) {
      console.error(error);
      alert("Failed to save results");
    } finally {
      setSaving(false);
    }
  };

  const rankedStudents = useMemo(
    () =>
      [...ranks].sort((a, b) => {
        const rankA = a.rank == null ? Number.MAX_SAFE_INTEGER : Number(a.rank);
        const rankB = b.rank == null ? Number.MAX_SAFE_INTEGER : Number(b.rank);
        return rankA - rankB;
      }),
    [ranks]
  );

  const groupedRanks = useMemo(() => {
    const groups = rankedStudents.reduce((acc, student) => {
      const admissionYear = student.year_of_admn || "Unknown";
      if (!acc[admissionYear]) acc[admissionYear] = [];
      acc[admissionYear].push(student);
      return acc;
    }, {});

    return Object.entries(groups).sort(([yearA], [yearB]) => {
      const numericYearA = Number(yearA) || 0;
      const numericYearB = Number(yearB) || 0;
      return numericYearB - numericYearA;
    });
  }, [rankedStudents]);

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.loadingSpinner}></div>
        <p style={styles.loadingText}>Loading rank holders...</p>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      {/* Ambient starfield + orbit arcs */}
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
        <div style={styles.contentWrapper}>
          <div style={styles.header}>
            <div style={styles.headerLeft}>
              <div style={styles.titleWrapper}>
                <h2 style={styles.title}>🏆 Rank Holders</h2>
                <p style={styles.subtitle}>
                  {isAdmin
                    ? "Rankings and performance across all departments"
                    : "Department rankings and performance"}
                </p>
              </div>
            </div>
            {!isAdmin && (
              <button style={styles.addButton} onClick={openAddResultModal}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="12" y1="5" x2="12" y2="19" strokeLinecap="round"/>
                  <line x1="5" y1="12" x2="19" y2="12" strokeLinecap="round"/>
                </svg>
                Add Result
              </button>
            )}
          </div>

          {errorMessage && (
            <div style={styles.errorAlert}>
              <span style={styles.errorIcon}>⚠️</span>
              {errorMessage}
            </div>
          )}

          <div style={styles.rankSections}>
            {groupedRanks.map(([admissionYear, studentsInYear]) => (
              <section key={admissionYear} style={styles.yearSection}>
                <div style={styles.yearSectionHeader}>
                  <div>
                    <h5 style={styles.tableTitle}>Admission Year {admissionYear}</h5>
                    <p style={styles.yearSectionSubtitle}>
                      Session {Number(admissionYear) ? Number(admissionYear) + 3 : "-"}
                    </p>
                  </div>
                  <span style={styles.tableBadge}>{studentsInYear.length} Students</span>
                </div>

                <div style={styles.tableWrapper}>
                  <table style={styles.table}>
                    <thead>
                      <tr>
                        <th style={styles.th}>Rank</th>
                        <th style={styles.th}>Name</th>
                        <th style={styles.th}>Admission No</th>
                        {isAdmin && <th style={styles.th}>Department</th>}
                        <th style={styles.th}>Programme</th>
                        <th style={styles.th}>OGPA</th>
                        <th style={styles.th}>Marks</th>
                      </tr>
                    </thead>
                    <tbody>
                      {studentsInYear.map((student) => (
                        <tr key={`${admissionYear}-${student.student_id}`} style={styles.tr}>
                          <td style={styles.td}>
                            <span style={styles.rankBadge}>#{student.rank || "-"}</span>
                          </td>
                          <td style={styles.td}>{student.student_name}</td>
                          <td style={styles.td}>{student.admission_no || "-"}</td>
                          {isAdmin && (
                            <td style={styles.td}>
                              {student.department_name || `Department ${student.department_id || "-"}`}
                            </td>
                          )}
                          <td style={styles.td}>{student.programme_name}</td>
                          <td style={styles.td}>
                            <span style={styles.ogpaBadge}>{student.ogpa || "N/A"}</span>
                          </td>
                          <td style={styles.td}>{student.marks || "N/A"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            ))}

            {ranks.length === 0 && (
              <div style={styles.emptyState}>
                <span style={styles.emptyIcon}>📊</span>
                <p style={styles.emptyText}>No rank holders found</p>
                <p style={styles.emptySubtext}>
                  {isAdmin ? "All departments" : `Department ID: ${localStorage.getItem("department_id")}`}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Modal */}
        {showModal && (
          <div style={styles.modalOverlay} onClick={() => setShowModal(false)}>
            <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
              <div style={styles.modalHeader}>
                <h5 style={styles.modalTitle}>Add Results</h5>
                <button style={styles.modalClose} onClick={() => setShowModal(false)}>✕</button>
              </div>

              <div style={styles.modalBody}>
                <div style={styles.modalForm}>
                  <div style={styles.formGroup}>
                    <label style={styles.formLabel}>Result Year</label>
                    <input
                      style={styles.formInput}
                      value={resultForm.result_year}
                      readOnly
                    />
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
                  <button style={styles.loadButton} onClick={loadStudents}>
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
                                } catch (error) {
                                  console.error(error);
                                  alert("Failed to read selected photo");
                                }
                              }}
                            />
                          </label>
                        </div>
                      ))}
                    </div>

                    <div style={styles.modalFooter}>
                      <button
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
  navActions: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
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
  errorAlert: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "14px 18px",
    background: "rgba(239, 68, 68, 0.08)",
    border: "1px solid rgba(239, 68, 68, 0.15)",
    borderRadius: "10px",
    color: "#f87171",
    fontSize: "14px",
    marginBottom: "20px",
  },
  errorIcon: {
    fontSize: "18px",
  },
  rankSections: {
    display: "flex",
    flexDirection: "column",
    gap: "22px",
  },
  yearSection: {
    background: "rgba(255,255,255,0.02)",
    border: "1px solid rgba(52, 211, 153, 0.06)",
    borderRadius: "16px",
    overflow: "hidden",
  },
  yearSectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "16px",
    padding: "20px 24px",
    borderBottom: "1px solid rgba(52, 211, 153, 0.06)",
  },
  yearSectionSubtitle: {
    color: "rgba(255,255,255,0.36)",
    fontSize: "12px",
    margin: "4px 0 0",
  },
  tableTitle: {
    color: "#ffffff",
    fontSize: "16px",
    fontWeight: "500",
    margin: 0,
  },
  tableBadge: {
    padding: "4px 12px",
    background: "rgba(52, 211, 153, 0.1)",
    borderRadius: "20px",
    color: "#34d399",
    fontSize: "12px",
    fontWeight: "500",
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
  rankBadge: {
    display: "inline-block",
    padding: "2px 10px",
    background: "rgba(52, 211, 153, 0.1)",
    borderRadius: "12px",
    color: "#34d399",
    fontSize: "13px",
    fontWeight: "600",
  },
  ogpaBadge: {
    display: "inline-block",
    padding: "2px 10px",
    background: "rgba(52, 211, 153, 0.1)",
    borderRadius: "12px",
    color: "#34d399",
    fontSize: "13px",
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
  loadingContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "100vh",
    gap: "16px",
    background: "#050907",
  },
  loadingSpinner: {
    width: "48px",
    height: "48px",
    border: "4px solid rgba(52, 211, 153, 0.08)",
    borderTop: "4px solid #34d399",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },
  loadingText: {
    color: "rgba(255,255,255,0.6)",
    fontSize: "14px",
    margin: 0,
  },
};

// Add CSS animations and hover effects
const styleSheet = document.createElement("style");
styleSheet.textContent = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
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

  .add-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(16, 185, 129, 0.35);
  }

  .table tbody tr:hover {
    background: rgba(52, 211, 153, 0.02);
  }

  .modal-close:hover {
    background: rgba(255,255,255,0.06);
    color: #ffffff;
  }

  .load-button:hover {
    background: rgba(52, 211, 153, 0.15);
  }

  .save-button:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(16, 185, 129, 0.35);
  }

  .save-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  input:focus, select:focus {
    border-color: rgba(52, 211, 153, 0.3) !important;
    box-shadow: 0 0 0 3px rgba(52, 211, 153, 0.06);
  }

  .form-input:read-only {
    opacity: 0.6;
    cursor: not-allowed;
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
    .add-button { padding: 10px 18px !important; font-size: 13px !important; justify-content: center !important; }
    .result-header, .result-row { grid-template-columns: minmax(180px, 1fr) 80px 80px 70px 90px 80px !important; gap: 8px !important; font-size: 12px !important; }
    .student-name-text { font-size: 12px !important; }
    .student-photo, .photo-placeholder { width: 32px !important; height: 32px !important; font-size: 12px !important; }
  }

  @media (max-width: 480px) {
    .container { padding: 12px !important; }
    .content-wrapper { padding: 16px !important; }
    .result-header, .result-row { grid-template-columns: minmax(140px, 1fr) 60px 60px 55px 70px 65px !important; gap: 4px !important; font-size: 10px !important; padding: 8px !important; }
    .modal-input, .modal-select { padding: 4px 6px !important; font-size: 11px !important; }
  }
`;
document.head.appendChild(styleSheet);
