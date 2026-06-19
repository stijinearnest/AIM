import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Rank from "../rank/rank";
import Placement from "../placement/placement";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("rank");
  const navigate = useNavigate();

  return (
    <div className="container mt-4">
      <h2>Dashboard</h2>

      <div className="d-flex gap-2 mb-4">
        <button
          className={`btn ${
            activeTab === "rank"
              ? "btn-primary"
              : "btn-outline-primary"
          }`}
          onClick={() => navigate("/rank")}
        >
          Rank
        </button>

        <button
          className={`btn ${
            activeTab === "placement"
              ? "btn-primary"
              : "btn-outline-primary"
          }`}
          onClick={() => navigate("/placement")}
        >
          Placement Guide
        </button>
      </div>

      
    </div>
  );
}
