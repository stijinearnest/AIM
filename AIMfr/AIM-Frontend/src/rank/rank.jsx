import { useEffect, useState } from "react";
import { apiGet,apiPost } from "../api/apiService";

export default function Rank() {
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
      const departmentId = Number(
        localStorage.getItem("department_id")
      );

      console.log("Department ID:", departmentId);

      const rankList = await apiGet("/rank");

      console.log("Rank API Response:", rankList);
      console.log("Type:", typeof rankList);
      console.log("Is Array:", Array.isArray(rankList));

      console.log("Rank List:", rankList);

      if (!Array.isArray(rankList)) {
        setErrorMessage("Invalid rank data received.");
        return;
      }

      const filteredRanks = rankList.filter(
        (student) =>
          Number(student.department_id) === departmentId
      );

      console.log("Filtered Ranks:", filteredRanks);

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
              student_name:
                studentDetails.name ||
                studentRank.student_name,
              programme_name:
                studentDetails.programme?.programme_name ||
                studentRank.programme_name,
              year_of_admn:
                studentDetails.year_of_admn ||
                studentRank.year_of_admn,
            };
          } catch (error) {
            console.error(
              "Student details fetch failed:",
              error
            );

            return {
              ...studentRank,
            };
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

    const response = await apiGet(
      `/students/programmes/?department_id=${departmentId}`
    );

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

const studentsWithFields = response.students.map(
  (student) => ({
    ...student,
    rank: "",
    ogpa: "",
    marks: "",
    status: "P",
  })
);

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

  if (loading) {
    return (
      <div className="container mt-4">
        <h4>Loading rank holders...</h4>
      </div>
    );
  }

  const topThree = ranks.slice(0, 3);

  const saveResults = async () => {
  try {
    setSaving(true);

    const departmentId = Number(
      localStorage.getItem("department_id")
    );

    const payload = {
      result_year: Number(resultForm.result_year),
      year_of_admn: Number(resultForm.year_of_admn),
      programme_id: Number(resultForm.programme_id),
      department_id: departmentId,

      results: students.map((student) => ({
        student_id: student.stud_id,

        rank:
          student.rank === ""
            ? null
            : Number(student.rank),

        status: student.status || "P",

        ogpa:
          student.ogpa === ""
            ? "0.00"
            : student.ogpa,

        marks:
          student.marks === ""
            ? null
            : student.marks,
      })),
    };

    console.log(payload);

    const response = await apiPost(
      "/rank/result/add/",
      payload
    );

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

  return (

    <div className="container py-4">
        <div className="mb-3">
  <button
    className="btn btn-primary"
    onClick={openAddResultModal}
  >
    Add Result
  </button>
</div>
      <h2 className="mb-4">
        🏆 Department Rank Holders
      </h2>

      {errorMessage && (
        <div className="alert alert-danger">
          {errorMessage}
        </div>
      )}

      {/* Top 3 */}
      <div className="row mb-4">
        {topThree.map((student, index) => (
          <div
            key={student.student_id}
            className="col-md-4 mb-3"
          >
            <div className="card shadow border-0 h-100">
              
            </div>
          </div>
        ))}
      </div>

      {/* Full Table */}
      <div className="card shadow border-0">
        <div className="card-header">
          <h5 className="mb-0">
            Current Department Rankings
          </h5>
        </div>

        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Name</th>
                  <th>Admission No</th>
                  <th>Department</th>
                  <th>Programme</th>
                  <th>Admission Year</th>
                  <th>OGPA</th>
                  <th>Marks</th>
                </tr>
              </thead>

              <tbody>
                {ranks.map((student) => (
                  <tr key={student.student_id}>
                    <td>
                      <strong>
                        #{student.rank}
                      </strong>
                    </td>

                    <td>{student.student_name}</td>

                    <td>
                      {student.admission_no || "-"}
                    </td>

                    <td>{student.department}</td>

                    <td>
                      {student.programme_name}
                    </td>

                    <td>
                      {student.year_of_admn}
                    </td>

                    <td>{student.ogpa}</td>

                    <td>{student.marks}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {ranks.length === 0 && (
              <div className="alert alert-warning text-center">
                No rank holders found for Department ID:
                {" "}
                {localStorage.getItem("department_id")}
              </div>
            )}
          </div>
        </div>
      </div>
      {showModal && (
  <div
    className="modal d-block"
    tabIndex="-1"
    style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
  >
    <div className="modal-dialog modal-xl">
      <div className="modal-content">

        <div className="modal-header">
          <h5>Add Result</h5>

          <button
            className="btn-close"
            onClick={() => setShowModal(false)}
          />
        </div>

        <div className="modal-body">

          <div className="row mb-3">

            <div className="col-md-4">
              <label>Result Year</label>

              <input
                className="form-control"
                value={resultForm.result_year}
                readOnly
              />
            </div>

            <div className="col-md-4">
              <label>Programme</label>

              <select
                className="form-select"
                value={resultForm.programme_id}
                onChange={(e) =>
                  setResultForm({
                    ...resultForm,
                    programme_id: e.target.value,
                  })
                }
              >
                <option value="">
                  Select Programme
                </option>

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

            <div className="col-md-4">
              <label>Admission Year</label>

              <input
                type="number"
                className="form-control"
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

          <button
            className="btn btn-success mb-3"
            onClick={loadStudents}
          >
            Load Students
          </button>

          {students.length > 0 && (
            <div className="table-responsive">

              <table className="table table-bordered">

                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Rank</th>
                    <th>OGPA</th>
                    <th>Marks</th>
                    <th>Status</th>
                  </tr>
                </thead>

                <tbody>
                  {students.map((student, index) => (
                    <tr key={student.stud_id}>

                      <td>{student.name}</td>

                      <td>
                        <input
                          className="form-control"
                          value={student.rank}
                          onChange={(e) => {
                            const updated = [...students];

                            updated[index].rank =
                              e.target.value;

                            setStudents(updated);
                          }}
                        />
                      </td>

                      <td>
                        <input
                          className="form-control"
                          value={student.ogpa}
                          onChange={(e) => {
                            const updated = [...students];

                            updated[index].ogpa =
                              e.target.value;

                            setStudents(updated);
                          }}
                        />
                      </td>

                      <td>
                        <input
                          className="form-control"
                          value={student.marks}
                          onChange={(e) => {
                            const updated = [...students];

                            updated[index].marks =
                              e.target.value;

                            setStudents(updated);
                          }}
                        />
                      </td>
                      <td>
  <select
    className="form-select"
    value={student.status}
    onChange={(e) => {
      const updated = [...students];

      updated[index].status =
        e.target.value;

      setStudents(updated);
    }}
  >
    <option value="P">
      Pass
    </option>

    <option value="F">
      Fail
    </option>
  </select>
</td>

                    </tr>
                  ))}
                </tbody>

              </table>
      <div className="d-flex justify-content-end mt-3">
  <button
    className="btn btn-success"
    disabled={saving}
    onClick={saveResults}
  >
    {saving
      ? "Saving..."
      : "Save Results"}
  </button>
</div>
            </div>
            
          )}

        </div>
      </div>

    </div>
  </div>
  
)}

    </div>
  );
}
