// src/components/Header.jsx
import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import golanceLogo from "../assets/GoLance_Logo_Transparent.png";
import { ENDPOINTS } from "../api/endpoints";

export default function Header() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [walletBalance, setWalletBalance] = useState(null);
  const [theme, setTheme] = useState("dark");
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);

  // Decode token expiry check
  const isTokenExpired = (token) => {
    if (!token) return true;
    try {
      const decoded = JSON.parse(atob(token.split(".")[1]));
      return decoded.exp * 1000 < Date.now();
    } catch {
      return true;
    }
  };

  // Fetch user + wallet + theme
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const token = localStorage.getItem("token");

    if (!token || isTokenExpired(token)) {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      setUser(null);
    } else if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);

      fetch(ENDPOINTS.WALLET_BALANCE(parsedUser.id), {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res) => res.json())
        .then((data) => setWalletBalance(data))
        .catch((err) => console.error("Wallet fetch failed:", err));
    }

    const savedTheme = localStorage.getItem("theme") || "dark";
    setTheme(savedTheme);
    document.documentElement.setAttribute("data-theme", savedTheme);
  }, []);

  // Theme toggle
  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
  };

  // Logout
  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
    navigate("/login");
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  return (
    <header>
      <nav className="navbar navbar-expand-lg bg-body-tertiary px-3 shadow-sm">
        <div className="container-fluid">
          {/* Logo */}
          <Link to="/" className="navbar-brand d-flex align-items-center">
            <img
              src={golanceLogo}
              alt="GoLance Logo"
              height="60"
              className="me-2"
            />
            <span
              className="brand-text fw-bold fs-5"
              style={{ color: "#3399ff" }}
            >
              GoLance
            </span>
          </Link>

          <button
            className="navbar-toggler custom-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarContent"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          {/* Nav Links */}
          <div className="collapse navbar-collapse" id="navbarContent">
            <ul className="navbar-nav mx-auto mb-2 mb-lg-0">
              <li className="nav-item">
                <Link className="nav-link active" to="/">
                  Home
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/">
                  About
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/">
                  Services
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/">
                  Contact
                </Link>
              </li>
            </ul>

            {/* Right side buttons */}
            <div className="d-flex align-items-center gap-3">
              {/* Message Icon with badge */}
              <div
                className="position-relative"
                style={{
                  cursor: "pointer",
                  fontSize: "1.5rem",
                  color: theme === "dark" ? "white" : "#333",
                }}
                onClick={() => {
                  if (!user) {
                    alert("⚠️ Please login first to view messages!");
                    navigate("/login");
                  } else {
                    navigate("/messages");
                  }
                }}
                title="Messages"
              >
                <i className="bi bi-chat-dots-fill"></i>
                {/* Example unread badge */}
                <span
                  className="position-absolute top-0 start-100 translate-middle p-1 bg-danger border border-light rounded-circle"
                  style={{ fontSize: "0.6rem" }}
                ></span>
              </div>

              {/* Theme toggle */}
              <button className="btn btn-outline-secondary" onClick={toggleTheme}>
                {theme === "dark" ? "🌞 Light Mode" : "🌙 Dark Mode"}
              </button>

              {/* Wallet */}
              {user && (
                <button
                  className="btn btn-outline-warning d-flex align-items-center gap-1"
                  onClick={() => navigate("/wallet")}
                  title="Wallet"
                >
                  💰 Wallet
                </button>
              )}

              {/* Profile/Login */}
              {user ? (
                <div className="position-relative" ref={profileRef}>
                  <button
                    className="btn btn-outline-secondary d-flex align-items-center gap-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      setProfileOpen((prev) => !prev);
                    }}
                  >
                    <div
                      className="rounded-circle bg-primary text-white d-flex justify-content-center align-items-center"
                      style={{ width: "30px", height: "30px", fontSize: "15px" }}
                    >
                      {user.username
                        ? user.username.charAt(0).toUpperCase()
                        : "U"}
                    </div>
                    <span>{user.username}</span>
                  </button>

                  {profileOpen && (
                    <ul
                      className="dropdown-menu show dropdown-menu-end"
                      style={{ right: 0, marginTop: "8px" }}
                    >
                      <li>
                        <Link
                          className="dropdown-item"
                          to={`/profile/${user.id}`}
                          onClick={() => setProfileOpen(false)}
                        >
                          View Profile
                        </Link>
                      </li>
                      <li>
                        <button className="dropdown-item" onClick={handleLogout}>
                          Logout
                        </button>
                      </li>
                    </ul>
                  )}
                </div>
              ) : (
                <Link to="/login" className="btn btn-primary px-4">
                  Login / Signup
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}
