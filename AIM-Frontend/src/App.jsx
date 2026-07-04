import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./login/login";
import Dashboard from "./dashboard/dashboard";
import Rank from "./rank/rank";
import Placement from "./placement/placement";
import RegisterUser from "./admin/registerUser";
import StudentResults from "./results/StudentResults";
import StudentProfile from "./student/StudentProfile";
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
         <Route path="/dashboard" element={<Dashboard />} />
         <Route path="/rank" element={<Rank />} />
         <Route path="/placement" element={<Placement />} />
         <Route path="/register-user" element={<RegisterUser />} />
         <Route path="/student-profile" element={<StudentProfile />} />
         <Route
  path="/student-results"
  element={<StudentResults />}
/>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
