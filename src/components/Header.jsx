// src/components/Header.jsx
import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import golanceLogo from "../assets/GoLance_Logo_Transparent.png";
import { ENDPOINTS } from "../api/endpoints";

export default function Header({ user, setUser }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [walletBalance, setWalletBalance] = useState(null);
  const [theme, setTheme] = useState("dark");
  const [profileOpen, setProfileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const profileRef = useRef(null);
  const mobileMenuRef = useRef(null);

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

  // Scroll effect for navbar with improved threshold
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      setScrolled(isScrolled);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Fetch wallet & theme whenever user changes
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!user || !token || isTokenExpired(token)) {
      setWalletBalance(null);
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      setUser(null);
      return;
    }

    // Fetch wallet balance
    fetch(ENDPOINTS.WALLET_BALANCE(user.id), {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => setWalletBalance(data))
      .catch((err) => console.error("Wallet fetch failed:", err));

    // Set theme
    const savedTheme = localStorage.getItem("theme") || "dark";
    setTheme(savedTheme);
    document.documentElement.setAttribute("data-theme", savedTheme);
  }, [user, setUser]);

  // Theme toggle with smooth transition
  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    
    // Add transition class to document
    document.documentElement.classList.add('theme-transition');
    document.documentElement.setAttribute("data-theme", newTheme);
    
    // Remove transition class after animation completes
    setTimeout(() => {
      document.documentElement.classList.remove('theme-transition');
    }, 300);
  };

  // Logout
  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
    setProfileOpen(false);
    setMobileMenuOpen(false);
    navigate("/login");
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(e.target) && !e.target.closest('.navbar-toggler')) {
        setMobileMenuOpen(false);
      }
    };
    
    document.addEventListener("click", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    
    return () => {
      document.removeEventListener("click", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  const onProfileToggle = (e) => {
    e.stopPropagation();
    setProfileOpen((prev) => !prev);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  // Check if link is active
  const isActiveLink = (path) => {
    return location.pathname === path;
  };

  return (
    <header>
      <nav className={`navbar navbar-expand-lg px-4 ${scrolled ? 'scrolled' : ''} ${mobileMenuOpen ? 'mobile-menu-open' : ''}`}>
        <div className="container-fluid">
          {/* Logo */}
          <Link to="/" className="navbar-brand d-flex align-items-center">
            <img
              src={golanceLogo}
              alt="GoLance Logo"
              height="45"
              className="me-2 logo-img"
            />
            <span className="brand-text fw-bold fs-4">
              GoLance
            </span>
          </Link>

          {/* Mobile menu toggle */}
          <button
            className="navbar-toggler"
            type="button"
            onClick={toggleMobileMenu}
            aria-label="Toggle navigation"
          >
            <div className={`hamburger ${mobileMenuOpen ? 'active' : ''}`}>
              <span></span>
              <span></span>
              <span></span>
            </div>
          </button>

          {/* Nav Links */}
          <div 
            ref={mobileMenuRef}
            className={`collapse navbar-collapse ${mobileMenuOpen ? 'show' : ''}`} 
            id="navbarContent"
          >
            <ul className="navbar-nav mx-auto mb-2 mb-lg-0">
              <li className="nav-item">
                <Link 
                  className={`nav-link ${isActiveLink("/") ? 'active' : ''}`} 
                  to="/"
                >
                  <i className="bi bi-house me-1"></i>
                  Home
                </Link>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="/#features">
                  <i className="bi bi-stars me-1"></i>
                  Features
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="/#faqs">
                  <i className="bi bi-question-circle me-1"></i>
                  FAQs
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="/#developers">
                  <i className="bi bi-people me-1"></i>
                  Team
                </a>
              </li>
              <li className="nav-item">
                <Link 
                  className={`nav-link ${isActiveLink("/tasks") ? 'active' : ''}`} 
                  to="/tasks"
                >
                  <i className="bi bi-briefcase me-1"></i>
                  Browse Tasks
                </Link>
              </li>
            </ul>

            {/* Right side buttons */}
            <div className="d-flex align-items-center gap-3">
              {/* Message Icon */}
              <div
                className="position-relative message-icon nav-icon"
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
                <span className="notification-badge">Message</span>
                <i className="bi bi-chat-dots-fill"></i>
                
              </div>

              {/* Theme toggle */}
              <button 
                className="theme-toggle nav-icon" 
                onClick={toggleTheme}
                aria-label="Toggle theme"
              >
                <span className="theme-icon">
                  {theme === "dark" ? "🌞" : "🌙"}
                </span>
              </button>

              {/* Wallet */}
              {user && (
                <button
                  className="btn btn-wallet d-flex align-items-center gap-2"
                  onClick={() => navigate("/wallet")}
                  title="Wallet"
                >
                  <span className="wallet-icon">💰</span>
                  <span className="wallet-text d-none d-md-inline">Wallet</span>
                  {walletBalance !== null && (
                    <span className="balance-badge">
                      ${walletBalance}
                    </span>
                  )}
                </button>
              )}

              {/* Profile/Login */}
              {user ? (
                <div className="position-relative profile-menu" ref={profileRef}>
                  <button
                    className="btn btn-profile d-flex align-items-center gap-2"
                    onClick={onProfileToggle}
                    aria-expanded={profileOpen}
                  >
                    <div
                      className="user-avatar rounded-circle text-white d-flex justify-content-center align-items-center"
                    >
                      {user.username ? user.username.charAt(0).toUpperCase() : "U"}
                    </div>
                    <span className="username d-none d-md-inline">{user.username}</span>
                    <i className={`bi bi-chevron-down dropdown-arrow ${profileOpen ? 'rotate' : ''}`}></i>
                  </button>

                  <div className={`dropdown-menu ${profileOpen ? 'show' : ''}`}>
                    <div className="dropdown-header">
                      <div className="user-avatar large">
                        {user.username ? user.username.charAt(0).toUpperCase() : "U"}
                      </div>
                      <div className="user-info">
                        <div className="username">{user.username}</div>
                        <div className="user-email text-muted small">{user.email}</div>
                      </div>
                    </div>
                    
                    <div className="dropdown-divider"></div>
                    
                    <Link
                      className="dropdown-item"
                      to={`/profile/${user.id}`}
                      onClick={() => setProfileOpen(false)}
                    >
                      <i className="bi bi-person"></i>
                      View Profile
                    </Link>
                    
                    <Link
                      className="dropdown-item"
                      to="/my-tasks"
                      onClick={() => setProfileOpen(false)}
                    >
                      <i className="bi bi-list-task"></i>
                      My Tasks
                    </Link>
                    
                    {/* <Link
                      className="dropdown-item"
                      to="/settings"
                      onClick={() => setProfileOpen(false)}
                    >
                      <i className="bi bi-gear"></i>
                      Settings
                    </Link> */}
                    
                    <div className="dropdown-divider"></div>
                    
                    <button 
                      className="dropdown-item logout"
                      onClick={handleLogout}
                    >
                      <i className="bi bi-box-arrow-right"></i>
                      Logout
                    </button>
                  </div>
                </div>
              ) : (
                <Link to="/login" className="btn btn-login">
                  <i className="bi bi-person me-2"></i>
                  <span className="d-none d-md-inline">Login / Signup</span>
                  <span className="d-md-none">Login</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}