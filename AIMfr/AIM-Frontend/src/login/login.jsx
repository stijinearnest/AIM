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

      // Save tokens
      localStorage.setItem("access_token", response.access);
      localStorage.setItem("refresh_token", response.refresh);
      localStorage.setItem("user_id", response.user_id);
      localStorage.setItem("department_id", response.department_id);
      console.log(response.user_id)
      const dep_id=response.department_id
      const department = await apiGet(
  `/students/department/?department_id=${dep_id}`
);
console.log(department.department_name)
localStorage.setItem("dep_name", department.department_name);
      // Navigate to dashboard
      navigate("/dashboard");
    } catch (error) {
      console.error(error);
      alert("Invalid username or password");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Username"
        value={formData.username}
        onChange={(e) =>
          setFormData({ ...formData, username: e.target.value })
        }
      />

      <input
        type="password"
        placeholder="Password"
        value={formData.password}
        onChange={(e) =>
          setFormData({ ...formData, password: e.target.value })
        }
      />

      <button type="submit">
        Login
      </button>
    </form>
  );
}
