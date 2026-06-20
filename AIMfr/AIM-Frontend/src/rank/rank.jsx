import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiGet, apiPost } from "../api/apiService";

export default function Rank() {
  const navigate = useNavigate();
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

  const loadRanks = async () => {
    try {
      const departmentId = Number(localStorage.getItem("department_id"));
      console.log("Department ID:", departmentId);

      const rankList = await apiGet("/rank");
      console.log("Rank API Response:", rankList);

      if (!Array.isArray(rankList)) {
        setErrorMessage("Invalid rank data received.");
        return;
      }

      const filteredRanks = rankList.filter(
        (student) => Number(student.department_id) === departmentId
      );

      filteredRanks.sort((a, b) => a.rank - b.rank);

      const ranksWithStudentDetails = await Promise.all(
        filteredRanks.map(async (studentRank) => {
          try {
            const studentDetails = await apiGet(
              `/students/student/?stud_id=${studentRank.student_id}`
            );

            return {
              ...studentRank,
              admission_no: studentDetails.admn_no,
              roll_no: studentDetails.roll_no,
              student_name: studentDetails.name || studentRank.student_name,
              programme_name: studentDetails.programme?.programme_name || studentRank.programme_name,
              year_of_admn: studentDetails.year_of_admn || studentRank.year_of_admn,
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
  };

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
  }, []);

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
          rank: student.rank === "" ? null : Number(student.rank),
          status: student.status || "P",
          ogpa: student.ogpa === "" ? "0.00" : student.ogpa,
          marks: student.marks === "" ? null : student.marks,
        })),
      };

      console.log(payload);

      const response = await apiPost("/rank/result/add/", payload);
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

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.loadingSpinner}></div>
        <p style={styles.loadingText}>Loading rank holders...</p>
      </div>
    );
  }

  const topThree = ranks.slice(0, 3);
  const medalColors = ["#FFD700", "#C0C0C0", "#CD7F32"];

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <button style={styles.backButton} onClick={() => navigate("/dashboard")}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M19 12H5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Back to Dashboard
          </button>
          <div style={styles.titleWrapper}>
            <h2 style={styles.title}>🏆 Rank Holders</h2>
            <p style={styles.subtitle}>Department rankings and performance</p>
          </div>
        </div>
        <button style={styles.addButton} onClick={openAddResultModal}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19" strokeLinecap="round"/>
            <line x1="5" y1="12" x2="19" y2="12" strokeLinecap="round"/>
          </svg>
          Add Result
        </button>
      </div>

      {errorMessage && (
        <div style={styles.errorAlert}>
          <span style={styles.errorIcon}>⚠️</span>
          {errorMessage}
        </div>
      )}

      {/* Top 3 Cards */}
      <div style={styles.topThreeContainer}>
        {topThree.map((student, index) => (
          <div key={student.student_id} style={styles.topCard}>
            <div style={styles.medalContainer}>
              <div style={{...styles.medal, background: medalColors[index]}}>
                <span style={styles.medalNumber}>{index + 1}</span>
              </div>
            </div>
            <div style={styles.topCardContent}>
              <h4 style={styles.topCardName}>{student.student_name}</h4>
              <p style={styles.topCardDetails}>
                <span style={styles.topCardLabel}>OGPA:</span> {student.ogpa || "N/A"}
              </p>
              <p style={styles.topCardDetails}>
                <span style={styles.topCardLabel}>Marks:</span> {student.marks || "N/A"}
              </p>
              <p style={styles.topCardDetails}>
                <span style={styles.topCardLabel}>Programme:</span> {student.programme_name}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Full Table */}
      <div style={styles.tableCard}>
        <div style={styles.tableHeader}>
          <h5 style={styles.tableTitle}>Complete Rankings</h5>
          <span style={styles.tableBadge}>{ranks.length} Students</span>
        </div>

        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Rank</th>
                <th style={styles.th}>Name</th>
                <th style={styles.th}>Admission No</th>
                <th style={styles.th}>Programme</th>
                <th style={styles.th}>Admission Year</th>
                <th style={styles.th}>OGPA</th>
                <th style={styles.th}>Marks</th>
              </tr>
            </thead>
            <tbody>
              {ranks.map((student) => (
                <tr key={student.student_id} style={styles.tr}>
                  <td style={styles.td}>
                    <span style={styles.rankBadge}>#{student.rank}</span>
                  </td>
                  <td style={styles.td}>{student.student_name}</td>
                  <td style={styles.td}>{student.admission_no || "-"}</td>
                  <td style={styles.td}>{student.programme_name}</td>
                  <td style={styles.td}>{student.year_of_admn}</td>
                  <td style={styles.td}>
                    <span style={styles.ogpaBadge}>{student.ogpa || "N/A"}</span>
                  </td>
                  <td style={styles.td}>{student.marks || "N/A"}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {ranks.length === 0 && (
            <div style={styles.emptyState}>
              <span style={styles.emptyIcon}>📊</span>
              <p style={styles.emptyText}>No rank holders found</p>
              <p style={styles.emptySubtext}>Department ID: {localStorage.getItem("department_id")}</p>
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

              <button style={styles.loadButton} onClick={loadStudents}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.66 0 3-4.03 3-9s-1.34-9-3-9m0 18c-1.66 0-3-4.03-3-9s1.34-9 3-9"/>
                </svg>
                Load Students
              </button>

              {students.length > 0 && (
                <div style={styles.studentTableWrapper}>
                  <table style={styles.modalTable}>
                    <thead>
                      <tr>
                        <th style={styles.modalTh}>Name</th>
                        <th style={styles.modalTh}>Rank</th>
                        <th style={styles.modalTh}>OGPA</th>
                        <th style={styles.modalTh}>Marks</th>
                        <th style={styles.modalTh}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {students.map((student, index) => (
                        <tr key={student.stud_id}>
                          <td style={styles.modalTd}>{student.name}</td>
                          <td style={styles.modalTd}>
                            <input
                              style={styles.modalInput}
                              value={student.rank}
                              onChange={(e) => {
                                const updated = [...students];
                                updated[index].rank = e.target.value;
                                setStudents(updated);
                              }}
                            />
                          </td>
                          <td style={styles.modalTd}>
                            <input
                              style={styles.modalInput}
                              value={student.ogpa}
                              onChange={(e) => {
                                const updated = [...students];
                                updated[index].ogpa = e.target.value;
                                setStudents(updated);
                              }}
                            />
                          </td>
                          <td style={styles.modalTd}>
                            <input
                              style={styles.modalInput}
                              value={student.marks}
                              onChange={(e) => {
                                const updated = [...students];
                                updated[index].marks = e.target.value;
                                setStudents(updated);
                              }}
                            />
                          </td>
                          <td style={styles.modalTd}>
                            <select
                              style={styles.modalSelect}
                              value={student.status}
                              onChange={(e) => {
                                const updated = [...students];
                                updated[index].status = e.target.value;
                                setStudents(updated);
                              }}
                            >
                              <option value="P">Pass</option>
                              <option value="F">Fail</option>
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

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
  );
}

const styles = {
  container: {
    color: "#ffffff",
  },
  loadingContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "300px",
    gap: "16px",
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
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "28px",
    flexWrap: "wrap",
    gap: "16px",
  },
  headerLeft: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  titleWrapper: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  backButton: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    padding: "8px 16px",
    background: "rgba(52, 211, 153, 0.06)",
    border: "1px solid rgba(52, 211, 153, 0.1)",
    borderRadius: "8px",
    color: "#34d399",
    fontSize: "13px",
    fontWeight: "500",
    cursor: "pointer",
    fontFamily: "inherit",
    transition: "all 0.25s ease",
    width: "fit-content",
  },
  title: {
    color: "#ffffff",
    fontSize: "24px",
    fontWeight: "600",
    margin: 0,
    letterSpacing: "-0.3px",
  },
  subtitle: {
    color: "rgba(255,255,255,0.4)",
    fontSize: "13px",
    margin: 0,
  },
  addButton: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "10px 20px",
    background: "linear-gradient(135deg, #10b981, #059669)",
    border: "none",
    borderRadius: "10px",
    color: "#ffffff",
    fontSize: "14px",
    fontWeight: "500",
    cursor: "pointer",
    fontFamily: "inherit",
    transition: "all 0.3s ease",
    boxShadow: "0 4px 16px rgba(16, 185, 129, 0.25)",
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
  topThreeContainer: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "20px",
    marginBottom: "32px",
  },
  topCard: {
    background: "rgba(255,255,255,0.02)",
    border: "1px solid rgba(52, 211, 153, 0.06)",
    borderRadius: "16px",
    padding: "24px",
    textAlign: "center",
    transition: "all 0.3s ease",
  },
  medalContainer: {
    display: "flex",
    justifyContent: "center",
    marginBottom: "16px",
  },
  medal: {
    width: "56px",
    height: "56px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "22px",
    fontWeight: "700",
    color: "#000000",
    boxShadow: "0 4px 16px rgba(0,0,0,0.3)",
  },
  medalNumber: {
    fontWeight: "700",
  },
  topCardContent: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  topCardName: {
    color: "#ffffff",
    fontSize: "18px",
    fontWeight: "600",
    margin: 0,
  },
  topCardDetails: {
    color: "rgba(255,255,255,0.6)",
    fontSize: "13px",
    margin: 0,
  },
  topCardLabel: {
    color: "rgba(255,255,255,0.4)",
    fontSize: "12px",
  },
  tableCard: {
    background: "rgba(255,255,255,0.02)",
    border: "1px solid rgba(52, 211, 153, 0.06)",
    borderRadius: "16px",
    overflow: "hidden",
  },
  tableHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "20px 24px",
    borderBottom: "1px solid rgba(52, 211, 153, 0.06)",
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
    maxWidth: "900px",
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
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(52, 211, 153, 0.08)",
    borderRadius: "8px",
    color: "#ffffff",
    fontSize: "14px",
    outline: "none",
    fontFamily: "inherit",
    cursor: "pointer",
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
    marginBottom: "20px",
  },
  studentTableWrapper: {
    marginTop: "8px",
  },
  modalTable: {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: "13px",
  },
  modalTh: {
    textAlign: "left",
    padding: "10px 12px",
    color: "rgba(255,255,255,0.4)",
    fontSize: "11px",
    fontWeight: "500",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    borderBottom: "1px solid rgba(52, 211, 153, 0.06)",
  },
  modalTd: {
    padding: "8px 12px",
    color: "rgba(255,255,255,0.8)",
    borderBottom: "1px solid rgba(52, 211, 153, 0.04)",
  },
  modalInput: {
    width: "100%",
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
    padding: "8px 10px",
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(52, 211, 153, 0.06)",
    borderRadius: "6px",
    color: "#ffffff",
    fontSize: "13px",
    outline: "none",
    fontFamily: "inherit",
    cursor: "pointer",
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
const styleSheet = document.createElement("style");
styleSheet.textContent = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  .back-button:hover {
    background: rgba(52, 211, 153, 0.12);
    border-color: rgba(52, 211, 153, 0.2);
    transform: translateX(-2px);
  }

  .add-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(16, 185, 129, 0.35);
  }

  .top-card:hover {
    background: rgba(52, 211, 153, 0.03);
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0,0,0,0.2);
    border-color: rgba(52, 211, 153, 0.1);
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
`;
document.head.appendChild(styleSheet);