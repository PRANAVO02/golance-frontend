import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ENDPOINTS } from "../api/endpoints";

export default function ProfilePage() {
  const { id } = useParams(); // get user ID from URL
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [balance, setBalance] = useState(null);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token"); // JWT token
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
    // theme
  const [theme] = useState(() => localStorage.getItem("theme") || "light");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  useEffect(() => {
    const fetchData = async () => {
      if (!token) {
        alert("You must be logged in to view profiles.");
        navigate("/login");
        return;
      }

      try {
        // Fetch user details
        const resUser = await fetch(ENDPOINTS.USERS(id), { headers });
        if (!resUser.ok) throw new Error("Failed to fetch user details");
        const userData = await resUser.json();
        setUser(userData);

        // Fetch wallet balance
        const resBalance = await fetch(ENDPOINTS.WALLET_BALANCE(id), {
          headers,
        });
        if (!resBalance.ok) throw new Error("Failed to fetch wallet balance");
        const balanceData = await resBalance.json();
        setBalance(balanceData);
      } catch (err) {
        setError(err.message || "Something went wrong");
      }
    };

    fetchData();
  }, [id, navigate, token]);

  const handleBack = () => navigate("/");

  if (error) {
    return (
      <div className="container text-center mt-5">
        <h3 className="text-danger">{error}</h3>
        <button className="btn btn-primary mt-3" onClick={handleBack}>
          Back to Home
        </button>
      </div>
    );
  }

  if (!user || balance === null) {
    return (
      <div className="container text-center mt-5">
        <h3>Loading user details...</h3>
      </div>
    );
  }

  return (
    <div className="container mt-5" style={{ maxWidth: "600px" }}>
      <h2 className="mb-4 text-center">User Profile</h2>
      <div className="card shadow p-4">
        <div className="mb-3">
          <strong>Username:</strong> {user.username}
        </div>
        <div className="mb-3">
          <strong>Email:</strong> {user.email}
        </div>
        <div className="mb-3">
          <strong>Role:</strong> {user.role}
        </div>
        <div className="mb-3">
          <strong>Department:</strong> {user.department || "N/A"}
        </div>
        <div className="mb-3">
          <strong>Studying Year:</strong> {user.studyingYear || "N/A"}
        </div>
        <div className="mb-3">
          <strong>Skills:</strong> {user.skills || "N/A"}
        </div>
        <div className="mb-3">
          <strong>Wallet Balance:</strong> {balance} credits
        </div>

        <div className="mb-3">
          <strong>Rating:</strong>{" "}
          {user.rating > 0
            ? `${user.rating.toFixed(1)} ⭐ (${user.ratingCount} ratings)`
            : "Not rated yet"}
        </div>

        <button className="btn btn-primary mt-3" onClick={handleBack}>
          Back to Home
        </button>
      </div>
    </div>
  );
}
