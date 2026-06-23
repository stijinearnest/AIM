import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiGet, apiPost } from "../api/apiService";
import aimLogo from "../assets/aim-logo1.png";
import Toast from "../components/Toast";
import { getPhotoSrc, getStudentDepartmentId } from "../utils/studentStatus";

const extractStudents = (response) => {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.students)) return response.students;
  if (Array.isArray(response?.results)) return response.results;
  if (Array.isArray(response?.data)) return response.data;
  return [];
};

export default function StudentProfile() {
  const navigate = useNavigate();
  const username = localStorage.getItem("username") || "there";
  const department = localStorage.getItem("dep_name") || "Department";
  const userDepartmentId = localStorage.getItem("department_id") || "";
  const isAdmin = localStorage.getItem("is_admin") === "true";

  const [students, setStudents] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [programmes, setProgrammes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [savingId, setSavingId] = useState(null);
  const [toast, setToast] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [filters, setFilters] = useState({
    department_id: isAdmin ? "" : userDepartmentId,
    programme_id: "",
    year_of_admn: "",
    status: "all",
    search: "",
  });
  const dropdownRef = useRef(null);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    window.clearTimeout(showToast.timer);
    showToast.timer = window.setTimeout(() => setToast(null), 3200);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSignOut = () => {
    localStorage.clear();
    navigate("/");
  };

  const loadDepartments = async () => {
    try {
      const response = await apiGet("/students/departments/");
      setDepartments(response.departments || []);
    } catch (error) {
      console.error(error);
    }
  };

  const loadProgrammes = async (departmentId) => {
    if (!departmentId) {
      setProgrammes([]);
      return;
    }

    try {
      const response = await apiGet(`/students/programmes/?department_id=${departmentId}`);
      setProgrammes(response.programmes || []);
    } catch (error) {
      console.error(error);
    }
  };

  const loadStudents = async () => {
    if (!filters.programme_id || !filters.year_of_admn) {
      setStudents([]);
      showToast("Select programme and admission year to load students", "error");
      return;
    }

    try {
      setLoading(true);
      const departmentId = isAdmin ? filters.department_id : userDepartmentId;
      const query = new URLSearchParams({
        year_of_admn: filters.year_of_admn,
        programme_id: filters.programme_id,
      });

      const response = await apiGet(`/students/by-programme/?${query.toString()}`);
      const responseProgramme = response?.programme || {};
      const responseDepartmentId =
        responseProgramme.department_id || responseProgramme.department?.dep_id || departmentId;
      const loadedStudents = extractStudents(response).map((student) => ({
        ...student,
        department_id: getStudentDepartmentId(student) || responseDepartmentId,
        department_name:
          student.department_name ||
          student.department?.department_name ||
          responseProgramme.department?.department_name ||
          department,
        programme_id: student.programme_id || student.programme?.programme_id || responseProgramme.programme_id,
        programme_name:
          student.programme_name || student.programme?.programme_name || responseProgramme.programme_name,
        year_of_admn: student.year_of_admn || response.year_of_admn || filters.year_of_admn,
      }));

      setStudents(
        loadedStudents.filter((student) => {
          const studentDepartmentId = String(getStudentDepartmentId(student));
          return !departmentId || studentDepartmentId === String(departmentId);
        })
      );
    } catch (error) {
      console.error(error);
      showToast("Failed to load students", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDepartments();
    loadProgrammes(isAdmin ? filters.department_id : userDepartmentId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const canEditStudent = (student) => {
    const studentDepartmentId = String(getStudentDepartmentId(student));
    return Boolean(userDepartmentId) && studentDepartmentId === String(userDepartmentId);
  };

  const updateStudentStatus = async (student, nextStatus) => {
    if (!canEditStudent(student)) {
      showToast("You can edit only students from your department", "error");
      return;
    }

    const previousStudents = students;

    try {
      setSavingId(student.stud_id);
      setStudents((current) =>
        current.map((item) =>
          item.stud_id === student.stud_id ? { ...item, is_studying: nextStatus } : item
        )
      );

      await apiPost("/students/update-student-status/", {
        stud_id: student.stud_id,
        is_studying: nextStatus,
      });

      showToast(`Student marked as ${nextStatus ? "studying" : "not studying"}`);
    } catch (error) {
      console.error(error);
      setStudents(previousStudents);
      showToast("Failed to update student status", "error");
    } finally {
      setSavingId(null);
    }
  };

  const visibleStudents = useMemo(() => {
    const search = filters.search.trim().toLowerCase();

    return students.filter((student) => {
      const isStudying = student.is_studying !== false;
      const statusMatches =
        filters.status === "all" ||
        (filters.status === "studying" && isStudying) ||
        (filters.status === "inactive" && !isStudying);

      const haystack = [
        student.name,
        student.student_name,
        student.admn_no,
        student.roll_no,
        student.programme_name,
        student.programme?.programme_name,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return statusMatches && (!search || haystack.includes(search));
    });
  }, [filters.search, filters.status, students]);

  const activeCount = students.filter((student) => student.is_studying !== false).length;
  const inactiveCount = students.length - activeCount;

  return (
    <div style={styles.page}>
      <Toast toast={toast} onClose={() => setToast(null)} />
      <div style={styles.container}>
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
              onClick={() => setShowDropdown((value) => !value)}
            >
              <span style={styles.userAvatar}>U</span>
              <span style={styles.userName}>{username}</span>
            </button>

            {showDropdown && (
              <div style={styles.dropdown}>
                <div style={styles.dropdownHeader}>
                  <span style={styles.dropdownAvatar}>U</span>
                  <div style={styles.dropdownUserInfo}>
                    <span style={styles.dropdownUsername}>{username}</span>
                    <span style={styles.dropdownDepartment}>{department}</span>
                  </div>
                </div>
                <div style={styles.dropdownDivider} />
                <button style={styles.dropdownSignOut} onClick={handleSignOut}>
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </header>

        <main style={styles.contentWrapper}>
          <div style={styles.header}>
            <div>
              <h1 style={styles.title}>Student Profile</h1>
              <p style={styles.subtitle}>
                Manage student studying status and review profile details with photos.
              </p>
            </div>
            <div style={styles.stats}>
              <span style={styles.statBadge}>{students.length} Total</span>
              <span style={styles.statBadge}>{activeCount} Studying</span>
              <span style={styles.statBadgeMuted}>{inactiveCount} Inactive</span>
            </div>
          </div>

          <section style={styles.filtersCard}>
            <div style={styles.filtersGrid}>
              <label style={styles.filterGroup}>
                <span style={styles.filterLabel}>Department</span>
                <select
                  style={styles.filterInput}
                  value={filters.department_id}
                  disabled={!isAdmin}
                  onChange={(event) => {
                    const departmentId = event.target.value;
                    setFilters((current) => ({
                      ...current,
                      department_id: departmentId,
                      programme_id: "",
                    }));
                    setStudents([]);
                    loadProgrammes(departmentId);
                  }}
                >
                  {isAdmin && <option value="">All Departments</option>}
                  {!isAdmin && <option value={userDepartmentId}>{department}</option>}
                  {isAdmin &&
                    departments.map((dept) => (
                      <option key={dept.dep_id} value={dept.dep_id}>
                        {dept.department_name}
                      </option>
                    ))}
                </select>
              </label>

              <label style={styles.filterGroup}>
                <span style={styles.filterLabel}>Programme</span>
                <select
                  style={styles.filterInput}
                  value={filters.programme_id}
                  onChange={(event) =>
                    setFilters((current) => ({ ...current, programme_id: event.target.value }))
                  }
                >
                  <option value="">All Programmes</option>
                  {programmes.map((programme) => (
                    <option key={programme.programme_id} value={programme.programme_id}>
                      {programme.programme_name}
                    </option>
                  ))}
                </select>
              </label>

              <label style={styles.filterGroup}>
                <span style={styles.filterLabel}>Admission Year</span>
                <input
                  type="number"
                  style={styles.filterInput}
                  value={filters.year_of_admn}
                  placeholder="e.g. 2022"
                  onChange={(event) =>
                    setFilters((current) => ({ ...current, year_of_admn: event.target.value }))
                  }
                />
              </label>

              <label style={styles.filterGroup}>
                <span style={styles.filterLabel}>Status</span>
                <select
                  style={styles.filterInput}
                  value={filters.status}
                  onChange={(event) =>
                    setFilters((current) => ({ ...current, status: event.target.value }))
                  }
                >
                  <option value="all">All Students</option>
                  <option value="studying">Studying</option>
                  <option value="inactive">Not Studying</option>
                </select>
              </label>

              <label style={styles.filterGroup}>
                <span style={styles.filterLabel}>Search</span>
                <input
                  type="search"
                  style={styles.filterInput}
                  value={filters.search}
                  placeholder="Name, admission no, roll no"
                  onChange={(event) =>
                    setFilters((current) => ({ ...current, search: event.target.value }))
                  }
                />
              </label>
            </div>

            <div style={styles.filterActions}>
              <button style={styles.primaryButton} onClick={loadStudents} disabled={loading}>
                {loading ? "Loading..." : "Load Students"}
              </button>
              <button
                style={styles.secondaryButton}
                onClick={() => {
                  const nextFilters = {
                    department_id: isAdmin ? "" : userDepartmentId,
                    programme_id: "",
                    year_of_admn: "",
                    status: "all",
                    search: "",
                  };
                  setFilters(nextFilters);
                  setProgrammes([]);
                }}
              >
                Reset
              </button>
            </div>
          </section>

          <section style={styles.tableCard}>
            <div style={styles.tableHeader}>
              <span>{visibleStudents.length} students shown</span>
              {loading && <span style={styles.loadingBadge}>Loading profiles...</span>}
            </div>

            {loading ? (
              <div style={styles.emptyState}>Loading student profiles...</div>
            ) : visibleStudents.length === 0 ? (
              <div style={styles.emptyState}>
                Select a programme and admission year, then load students.
              </div>
            ) : (
              <div style={styles.tableWrapper}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Student</th>
                      <th style={styles.th}>Admission No</th>
                      <th style={styles.th}>Roll No</th>
                      <th style={styles.th}>Department</th>
                      <th style={styles.th}>Programme</th>
                      <th style={styles.th}>Year</th>
                      <th style={styles.th}>Status</th>
                      <th style={styles.th}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visibleStudents.map((student) => {
                      const isStudying = student.is_studying !== false;
                      const canEdit = canEditStudent(student);
                      const photoSrc = getPhotoSrc(student.photo);
                      const name = student.name || student.student_name || "Student";

                      return (
                        <tr key={student.stud_id} style={styles.tr}>
                          <td style={styles.td}>
                            <div style={styles.studentCell}>
                              {photoSrc ? (
                                <img src={photoSrc} alt={name} style={styles.photo} />
                              ) : (
                                <span style={styles.photoPlaceholder}>
                                  {name.slice(0, 1).toUpperCase()}
                                </span>
                              )}
                              <span style={styles.studentName}>{name}</span>
                            </div>
                          </td>
                          <td style={styles.td}>{student.admn_no || "-"}</td>
                          <td style={styles.td}>{student.roll_no || "-"}</td>
                          <td style={styles.td}>
                            {student.department_name || student.department?.department_name || "-"}
                          </td>
                          <td style={styles.td}>
                            {student.programme_name || student.programme?.programme_name || "-"}
                          </td>
                          <td style={styles.td}>{student.year_of_admn || "-"}</td>
                          <td style={styles.td}>
                            <span style={isStudying ? styles.activeBadge : styles.inactiveBadge}>
                              {isStudying ? "Studying" : "Not Studying"}
                            </span>
                          </td>
                          <td style={styles.td}>
                            <button
                              style={{
                                ...styles.statusButton,
                                opacity: canEdit && savingId !== student.stud_id ? 1 : 0.55,
                              }}
                              disabled={!canEdit || savingId === student.stud_id}
                              onClick={() => updateStudentStatus(student, !isStudying)}
                              title={
                                canEdit
                                  ? "Update student status"
                                  : "Only your department's students can be edited"
                              }
                            >
                              {savingId === student.stud_id
                                ? "Saving..."
                                : isStudying
                                  ? "Set False"
                                  : "Set True"}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#050907",
    color: "#ffffff",
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  },
  container: {
    maxWidth: "1400px",
    margin: "0 auto",
    padding: "32px 48px",
  },
  navbar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px 24px",
    marginBottom: "32px",
    background: "rgba(8, 14, 11, 0.72)",
    border: "1px solid rgba(52, 211, 153, 0.12)",
    borderRadius: "16px",
  },
  logoImg: {
    height: "72px",
    width: "auto",
    cursor: "pointer",
  },
  userMenu: {
    position: "relative",
  },
  userMenuBtn: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "8px 16px 8px 12px",
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(52, 211, 153, 0.15)",
    borderRadius: "10px",
    color: "#ffffff",
    cursor: "pointer",
    fontFamily: "inherit",
  },
  userAvatar: {
    width: "32px",
    height: "32px",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #10b981, #059669)",
    fontSize: "13px",
    fontWeight: 700,
  },
  userName: {
    fontSize: "14px",
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
    boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
    padding: "8px",
    zIndex: 50,
  },
  dropdownHeader: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "12px",
  },
  dropdownAvatar: {
    width: "38px",
    height: "38px",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #10b981, #059669)",
    fontSize: "13px",
    fontWeight: 700,
  },
  dropdownUserInfo: {
    display: "flex",
    flexDirection: "column",
    gap: "2px",
  },
  dropdownUsername: {
    color: "#ffffff",
    fontSize: "14px",
    fontWeight: 600,
  },
  dropdownDepartment: {
    color: "rgba(255,255,255,0.45)",
    fontSize: "12px",
  },
  dropdownDivider: {
    height: "1px",
    background: "rgba(52, 211, 153, 0.08)",
    margin: "4px 8px",
  },
  dropdownSignOut: {
    width: "100%",
    padding: "10px 12px",
    background: "transparent",
    border: "none",
    borderRadius: "8px",
    color: "#f87171",
    textAlign: "left",
    cursor: "pointer",
    fontFamily: "inherit",
  },
  contentWrapper: {
    background: "rgba(8, 16, 13, 0.66)",
    border: "1px solid rgba(52, 211, 153, 0.08)",
    borderRadius: "20px",
    padding: "32px",
    boxShadow: "0 8px 32px rgba(0,0,0,0.35)",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "20px",
    marginBottom: "28px",
    flexWrap: "wrap",
  },
  title: {
    margin: 0,
    color: "#ffffff",
    fontSize: "30px",
    fontWeight: 700,
    letterSpacing: 0,
  },
  subtitle: {
    margin: "6px 0 0",
    color: "rgba(255,255,255,0.48)",
    fontSize: "14px",
  },
  stats: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
  },
  statBadge: {
    padding: "8px 12px",
    borderRadius: "8px",
    background: "rgba(52, 211, 153, 0.1)",
    color: "#a7f3d0",
    fontSize: "13px",
    fontWeight: 600,
  },
  statBadgeMuted: {
    padding: "8px 12px",
    borderRadius: "8px",
    background: "rgba(248, 113, 113, 0.1)",
    color: "#fecaca",
    fontSize: "13px",
    fontWeight: 600,
  },
  filtersCard: {
    padding: "20px",
    marginBottom: "22px",
    border: "1px solid rgba(52, 211, 153, 0.08)",
    borderRadius: "12px",
    background: "rgba(255,255,255,0.02)",
  },
  filtersGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
    gap: "14px",
  },
  filterGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  filterLabel: {
    color: "rgba(255,255,255,0.52)",
    fontSize: "12px",
    fontWeight: 600,
    textTransform: "uppercase",
  },
  filterInput: {
    width: "100%",
    boxSizing: "border-box",
    padding: "10px 12px",
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(52,211,153,0.12)",
    borderRadius: "8px",
    color: "#ffffff",
    outline: "none",
    fontFamily: "inherit",
    fontSize: "14px",
  },
  filterActions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "10px",
    marginTop: "16px",
  },
  primaryButton: {
    padding: "10px 18px",
    background: "#10b981",
    border: "none",
    borderRadius: "8px",
    color: "#ffffff",
    cursor: "pointer",
    fontWeight: 700,
    fontFamily: "inherit",
  },
  secondaryButton: {
    padding: "10px 18px",
    background: "transparent",
    border: "1px solid rgba(255,255,255,0.15)",
    borderRadius: "8px",
    color: "rgba(255,255,255,0.8)",
    cursor: "pointer",
    fontFamily: "inherit",
  },
  tableCard: {
    border: "1px solid rgba(52, 211, 153, 0.08)",
    borderRadius: "14px",
    background: "rgba(255,255,255,0.02)",
    overflow: "hidden",
  },
  tableHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px 20px",
    borderBottom: "1px solid rgba(52, 211, 153, 0.08)",
    color: "rgba(255,255,255,0.62)",
    fontSize: "14px",
  },
  loadingBadge: {
    color: "#34d399",
  },
  tableWrapper: {
    overflowX: "auto",
    padding: "8px",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: "14px",
  },
  th: {
    textAlign: "left",
    padding: "13px 14px",
    color: "rgba(255,255,255,0.44)",
    fontSize: "12px",
    fontWeight: 700,
    textTransform: "uppercase",
    borderBottom: "1px solid rgba(52, 211, 153, 0.07)",
    whiteSpace: "nowrap",
  },
  tr: {
    borderBottom: "1px solid rgba(52, 211, 153, 0.04)",
  },
  td: {
    padding: "12px 14px",
    color: "rgba(255,255,255,0.78)",
    verticalAlign: "middle",
    whiteSpace: "nowrap",
  },
  studentCell: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    minWidth: "220px",
  },
  photo: {
    width: "44px",
    height: "44px",
    borderRadius: "8px",
    objectFit: "cover",
    border: "1px solid rgba(52, 211, 153, 0.15)",
    background: "rgba(255,255,255,0.03)",
  },
  photoPlaceholder: {
    width: "44px",
    height: "44px",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "8px",
    background: "rgba(52, 211, 153, 0.12)",
    color: "#a7f3d0",
    fontWeight: 800,
  },
  studentName: {
    color: "#ffffff",
    fontWeight: 600,
  },
  activeBadge: {
    padding: "5px 10px",
    borderRadius: "999px",
    background: "rgba(52, 211, 153, 0.12)",
    color: "#86efac",
    fontSize: "12px",
    fontWeight: 700,
  },
  inactiveBadge: {
    padding: "5px 10px",
    borderRadius: "999px",
    background: "rgba(248, 113, 113, 0.12)",
    color: "#fca5a5",
    fontSize: "12px",
    fontWeight: 700,
  },
  statusButton: {
    minWidth: "92px",
    padding: "8px 12px",
    border: "1px solid rgba(52, 211, 153, 0.16)",
    borderRadius: "8px",
    background: "rgba(52, 211, 153, 0.08)",
    color: "#d1fae5",
    cursor: "pointer",
    fontFamily: "inherit",
    fontSize: "13px",
    fontWeight: 700,
  },
  emptyState: {
    padding: "54px 20px",
    textAlign: "center",
    color: "rgba(255,255,255,0.48)",
  },
};

if (typeof document !== "undefined" && !document.getElementById("student-profile-style")) {
  const styleSheet = document.createElement("style");
  styleSheet.id = "student-profile-style";
  styleSheet.textContent = `
    select option {
      background: #0a140e;
      color: #ffffff;
    }

    input:focus, select:focus {
      border-color: rgba(52, 211, 153, 0.34) !important;
      box-shadow: 0 0 0 3px rgba(52, 211, 153, 0.07);
    }

    button:disabled {
      cursor: not-allowed !important;
    }

    @media (max-width: 760px) {
      .logo-home {
        height: 48px !important;
      }
    }
  `;
  document.head.appendChild(styleSheet);
}
