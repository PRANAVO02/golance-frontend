import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ENDPOINTS } from "../api/endpoints";

export default function ProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("profile");

  const token = localStorage.getItem("token");
  const currentUser = JSON.parse(localStorage.getItem("user"));
  const isOwnProfile = currentUser?.id === parseInt(id);

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
        setLoading(true);
        // Fetch user details
        const resUser = await fetch(ENDPOINTS.USERS(id), {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        if (!resUser.ok) throw new Error("Failed to fetch user details");
        const userData = await resUser.json();
        setUser(userData);

        // Fetch wallet balance
        const resBalance = await fetch(ENDPOINTS.WALLET_BALANCE(id), {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        if (!resBalance.ok) throw new Error("Failed to fetch wallet balance");
        const balanceData = await resBalance.json();
        setBalance(balanceData);
      } catch (err) {
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, navigate, token]);

  const handleBack = () => navigate("/");
  const handleEditProfile = () => navigate(`/edit-profile/${id}`);

  if (loading) {
    return (
      <div className="main-container">
        <div className="content-wrapper">
          <div className="text-center py-5">
            <div
              className="spinner-border text-primary mb-3"
              style={{ width: "3rem", height: "3rem" }}
              role="status"
            >
              <span className="visually-hidden">Loading...</span>
            </div>
            <h3>Loading profile...</h3>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="main-container">
        <div className="content-wrapper">
          <div className="text-center py-5">
            <div className="error-icon mb-4" style={{ fontSize: "4rem" }}>
              😞
            </div>
            <h3 className="text-danger mb-3">{error}</h3>
            <button className="btn btn-primary mt-3" onClick={handleBack}>
              ← Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="main-container">
        <div className="content-wrapper">
          <div className="text-center py-5">
            <h3>User not found</h3>
            <button className="btn btn-primary mt-3" onClick={handleBack}>
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  const getInitials = (name) => {
    return name ? name.charAt(0).toUpperCase() : "U";
  };

  const getRatingColor = (rating) => {
    if (rating >= 4.5) return "#22c55e";
    if (rating >= 4.0) return "#84cc16";
    if (rating >= 3.0) return "#eab308";
    if (rating >= 2.0) return "#f97316";
    return "#ef4444";
  };

  return (
    <div className="main-container">
      <div className="container-fluid mt-4"></div>
      <div className="content-wrapper">
        <div className="container py-5">
          {/* Header Section */}
          <div className="row justify-content-center">
            <div className="col-lg-8">
              <div className="profile-header text-center mb-5">
                <button
                  className="btn btn-outline-secondary mb-4"
                  onClick={handleBack}
                  style={{ border: "none" }}
                >
                  ← Back to Home
                </button>

                <div className="profile-avatar mb-4">
                  <div
                    className="avatar-circle mx-auto d-flex align-items-center justify-content-center"
                    style={{
                      width: "120px",
                      height: "120px",
                      background: "var(--primary-btn-bg)",
                      borderRadius: "50%",
                      fontSize: "3rem",
                      color: "var(--primary-btn-text)",
                      fontWeight: "bold",
                      marginBottom: "1rem",
                      border: "3px solid var(--input-border)",
                    }}
                  >
                    {getInitials(user.username)}
                  </div>
                  <h1 className="mb-2" style={{ color: "var(--text-color)" }}>
                    {user.username}
                  </h1>
                  <p style={{ color: "var(--placeholder-color)" }}>
                    {user.role} • {user.department || "No department specified"}
                  </p>
                </div>

                {/* Stats Overview */}
                <div className="row justify-content-center mb-4">
                  <div className="col-auto">
                    <div className="stat-card text-center p-3">
                      <div
                        className="stat-value fw-bold fs-3"
                        style={{ color: "var(--primary-btn-bg)" }}
                      >
                        {balance}
                      </div>
                      <div style={{ color: "var(--placeholder-color)" }}>
                        Credits
                      </div>
                    </div>
                  </div>
                  <div className="col-auto">
                    <div className="stat-card text-center p-3">
                      <div
                        className="stat-value fw-bold fs-3"
                        style={{ color: getRatingColor(user.rating) }}
                      >
                        {user.rating > 0 ? user.rating.toFixed(1) : "N/A"}
                      </div>
                      <div style={{ color: "var(--placeholder-color)" }}>
                        Rating
                      </div>
                    </div>
                  </div>
                  <div className="col-auto">
                    <div className="stat-card text-center p-3">
                      <div
                        className="stat-value fw-bold fs-3"
                        style={{ color: "var(--primary-btn-bg)" }}
                      >
                        {user.ratingCount || 0}
                      </div>
                      <div style={{ color: "var(--placeholder-color)" }}>
                        Reviews
                      </div>
                    </div>
                  </div>
                </div>

                {/* {isOwnProfile && (
                  <button className="btn btn-primary" onClick={handleEditProfile}>
                    ✏️ Edit Profile
                  </button>
                )} */}
              </div>

              {/* Tabs Navigation */}
              <div className="profile-tabs mb-4">
                <ul className="nav nav-pills justify-content-center gap-2">
                  <li className="nav-item">
                    <button
                      className={`nav-link ${
                        activeTab === "profile" ? "active" : ""
                      }`}
                      onClick={() => setActiveTab("profile")}
                    >
                      👤 Profile
                    </button>
                  </li>
                  <li className="nav-item">
                    <button
                      className={`nav-link ${
                        activeTab === "skills" ? "active" : ""
                      }`}
                      onClick={() => setActiveTab("skills")}
                    >
                      💼 Skills
                    </button>
                  </li>
                  <li className="nav-item">
                    <button
                      className={`nav-link ${
                        activeTab === "activity" ? "active" : ""
                      }`}
                      onClick={() => setActiveTab("activity")}
                    >
                      📊 Activity
                    </button>
                  </li>
                </ul>
              </div>

              {/* Tab Content */}
              <div className="profile-content">
                {activeTab === "profile" && (
                  <div className="card glass p-4">
                    <h4 className="mb-4" style={{ color: "var(--text-color)" }}>
                      Personal Information
                    </h4>
                    <div className="row g-3">
                      <div className="col-md-6">
                        <div className="info-item">
                          <label
                            style={{ color: "var(--placeholder-color)" }}
                            className="small"
                          >
                            Username
                          </label>
                          <div
                            className="fw-semibold"
                            style={{ color: "var(--text-color)" }}
                          >
                            {user.username}
                          </div>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="info-item">
                          <label
                            style={{ color: "var(--placeholder-color)" }}
                            className="small"
                          >
                            Email
                          </label>
                          <div
                            className="fw-semibold"
                            style={{ color: "var(--text-color)" }}
                          >
                            {user.email}
                          </div>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="info-item">
                          <label
                            style={{ color: "var(--placeholder-color)" }}
                            className="small"
                          >
                            Role
                          </label>
                          <div
                            className="fw-semibold text-capitalize"
                            style={{ color: "var(--text-color)" }}
                          >
                            {user.role}
                          </div>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="info-item">
                          <label
                            style={{ color: "var(--placeholder-color)" }}
                            className="small"
                          >
                            Department
                          </label>
                          <div
                            className="fw-semibold"
                            style={{ color: "var(--text-color)" }}
                          >
                            {user.department || "Not specified"}
                          </div>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="info-item">
                          <label
                            style={{ color: "var(--placeholder-color)" }}
                            className="small"
                          >
                            Studying Year
                          </label>
                          <div
                            className="fw-semibold"
                            style={{ color: "var(--text-color)" }}
                          >
                            {user.studyingYear || "Not specified"}
                          </div>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="info-item">
                          <label
                            style={{ color: "var(--placeholder-color)" }}
                            className="small"
                          >
                            Member Since
                          </label>
                          <div
                            className="fw-semibold"
                            style={{ color: "var(--text-color)" }}
                          >
                            {user.createdAt
                              ? new Date(user.createdAt).toLocaleDateString()
                              : "Unknown"}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "skills" && (
                  <div className="card glass p-4">
                    <h4 className="mb-4" style={{ color: "var(--text-color)" }}>
                      Skills & Expertise
                    </h4>
                    {user.skills ? (
                      <div className="skills-container">
                        {user.skills.split(",").map((skill, index) => (
                          <span
                            key={index}
                            className="skill-tag"
                            style={{
                              background: "var(--primary-btn-bg)",
                              color: "var(--primary-btn-text)",
                              padding: "0.5rem 1rem",
                              borderRadius: "20px",
                              fontSize: "0.9rem",
                              margin: "0.25rem",
                              display: "inline-block",
                            }}
                          >
                            {skill.trim()}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <div
                        className="text-center py-4"
                        style={{ color: "var(--placeholder-color)" }}
                      >
                        <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>
                          🎯
                        </div>
                        <p>No skills added yet</p>
                        {isOwnProfile && (
                          <button
                            className="btn btn-primary mt-2"
                            onClick={handleEditProfile}
                          >
                            Add Your Skills
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {activeTab === "activity" && (
                  <div className="card glass p-4">
                    <h4 className="mb-4" style={{ color: "var(--text-color)" }}>
                      Recent Activity
                    </h4>
                    <div
                      className="text-center py-4"
                      style={{ color: "var(--placeholder-color)" }}
                    >
                      <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>
                        📈
                      </div>
                      <p>Activity tracking coming soon!</p>
                      <small>
                        View completed tasks, reviews, and performance metrics
                      </small>
                    </div>
                  </div>
                )}
              </div>

              {/* Rating Display */}
              {user.rating > 0 && (
                <div className="card glass p-4 mt-4">
                  <div className="row align-items-center">
                    <div className="col-md-6">
                      <h5
                        className="mb-2"
                        style={{ color: "var(--text-color)" }}
                      >
                        User Rating
                      </h5>
                      <div className="d-flex align-items-center gap-3">
                        <div
                          className="rating-circle d-flex align-items-center justify-content-center fw-bold"
                          style={{
                            width: "60px",
                            height: "60px",
                            borderRadius: "50%",
                            background: getRatingColor(user.rating),
                            fontSize: "1.5rem",
                            color: "white",
                          }}
                        >
                          {user.rating.toFixed(1)}
                        </div>
                        <div>
                          <div className="stars mb-1 text-warning">
                            {"★".repeat(Math.floor(user.rating))}
                            {"☆".repeat(5 - Math.floor(user.rating))}
                          </div>
                          <small style={{ color: "var(--placeholder-color)" }}>
                            Based on {user.ratingCount} review
                            {user.ratingCount !== 1 ? "s" : ""}
                          </small>
                        </div>
                      </div>
                    </div>
                    {/* <div className="col-md-6 text-md-end">
                      <button className="btn btn-outline-primary">
                        View Reviews
                      </button>
                    </div> */}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
