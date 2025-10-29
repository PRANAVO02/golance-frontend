import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import golanceLogo from "../assets/GoLance_Logo_Transparent.png";
import { ENDPOINTS } from "../api/endpoints";

const developers = [
  {
    name: "Pranavo",
    avatar: "https://randomuser.me/api/portraits/men/67.jpg",
    message: "Focused on building secure and efficient app infrastructure.",
  },
  {
    name: "Sandy",
    avatar: "https://randomuser.me/api/portraits/men/44.jpg",
    message:
      "Committed to creating a seamless freelance experience for students.",
  },
  {
    name: "Sriram",
    avatar: "https://randomuser.me/api/portraits/men/48.jpg",
    message: "Passionate about integrating real-time communications features.",
  },
  {
    name: "Sheeba",
    avatar: "https://randomuser.me/api/portraits/women/47.jpg",
    message: "Dedicated to enhancing user engagement and platform usability.",
  },
  {
    name: "Sanjai",
    avatar: "https://randomuser.me/api/portraits/men/49.jpg",
    message:
      "Ensuring smooth cross-campus collaboration with trust and transparency.",
  },
];

export default function HomePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [walletBalance, setWalletBalance] = useState(null);
  const [theme, setTheme] = useState("dark");
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);

  const isTokenExpired = (token) => {
    if (!token) return true;
    try {
      const decoded = JSON.parse(atob(token.split(".")[1]));
      return decoded.exp * 1000 < Date.now();
    } catch {
      return true;
    }
  };

  // Fetch user and wallet balance
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

      // Fetch wallet balance
      // fetch(`http://localhost:8080/api/wallet/balance/${parsedUser.id}`, {
        fetch(ENDPOINTS.WALLET_BALANCE(parsedUser.id), {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res) => res.json())
        .then((data) => setWalletBalance(data))
        .catch((err) => console.error("Failed to fetch wallet balance:", err));
    }

    const savedTheme = localStorage.getItem("theme") || "dark";
    setTheme(savedTheme);
    document.documentElement.setAttribute("data-theme", savedTheme);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
    setProfileOpen(false);
    navigate("/login");
  };

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
  };

  useEffect(() => {
    const onDocumentClick = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target))
        setProfileOpen(false);
    };
    const onKeyDown = (e) => {
      if (e.key === "Escape") setProfileOpen(false);
    };
    document.addEventListener("click", onDocumentClick);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("click", onDocumentClick);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  const onProfileToggle = (e) => {
    e.stopPropagation();
    setProfileOpen((s) => !s);
  };

  const goToLoginWithMessage = (message) => {
    navigate("/login", { state: { message } });
  };

  const goToWalletPage = () => {
    navigate("/wallet");
  };

  return (
    <div>
      {/* Navbar */}
      <header>
        <nav className="navbar navbar-expand-lg bg-body-tertiary px-3">
          <div className="container-fluid">
            <Link to="/" className="navbar-brand d-flex align-items-center">
              <img
                src={golanceLogo}
                alt="golance logo"
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
            <div className="collapse navbar-collapse" id="navbarContent">
              <ul className="navbar-nav mx-auto mb-2 mb-lg-0">
                <li className="nav-item">
                  <Link className="nav-link active" to="/">
                    Home
                  </Link>
                </li>
                <li className="nav-item">
                  <a className="nav-link" href="/">
                    About
                  </a>
                </li>
                <li className="nav-item">
                  <a className="nav-link" href="/">
                    Services
                  </a>
                </li>
                <li className="nav-item">
                  <a className="nav-link" href="/">
                    Contact
                  </a>
                </li>
              </ul>

              {/* Right section */}
              <div className="d-flex align-items-center gap-3">
                {/* Theme toggle */}
                <button
                  className="btn btn-outline-secondary"
                  onClick={toggleTheme}
                >
                  {theme === "dark" ? "🌞 Light Mode" : "🌙 Dark Mode"}
                </button>

                {/* Wallet button */}
                {user && (
                  <button
                    className="btn btn-outline-warning d-flex align-items-center gap-1"
                    onClick={() => navigate("/wallet")}
                    title="Wallet"
                  >
                    <span>💰</span> {/* Wallet icon */}
                    <span>Wallet</span>
                  </button>
                )}

                {/* Profile dropdown */}
                {user ? (
                  <div className="position-relative" ref={profileRef}>
                    <button
                      className="btn btn-outline-secondary d-flex align-items-center gap-2"
                      aria-haspopup="true"
                      aria-expanded={profileOpen}
                      onClick={onProfileToggle}
                    >
                      <div
                        className="rounded-circle bg-primary text-white d-flex justify-content-center align-items-center"
                        style={{
                          width: "30px",
                          height: "30px",
                          fontSize: "15px",
                        }}
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
                          <button
                            className="dropdown-item"
                            onClick={handleLogout}
                          >
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

      {/* Info Section */}
      <div className="row mt-5 g-4 px-3">
        {[
          {
            title: "📌 Create a Task",
            desc: "Have a project, assignment, or idea? Post it and let campus talent bring it to life.",
            icon: "https://cdn-icons-png.flaticon.com/512/7872/7872852.png",
            link: "/post-task",
            color: "btn-outline-primary",
          },

          {
            title: "💰 Browse & Bid",
            desc: "Discover available tasks, place your bids, and earn credits for your skills.",
            icon: "https://cdn-icons-png.flaticon.com/512/1864/1864271.png",
            link: "/tasks",
            color: "btn-outline-primary",
          },

          {
            title: "🗂️ My Task Dashboard",
            desc: "View tasks you posted, bids you placed, and assignments you’re working on.",
            icon: "https://cdn-icons-png.flaticon.com/512/3135/3135768.png",
            link: "/my-tasks",
            color: "btn-outline-primary",
          },
        ].map((item, idx) => (
          <div key={idx} className="col-lg-4">
            <div className="info-card text-center p-4 bg-white rounded-4 shadow-sm h-100">
              <img
                src={item.icon}
                alt={item.title}
                className="bd-placeholder-img rounded-circle mb-3 info-icon"
              />
              <h3 className="fw-semibold mb-3 info-title">{item.title}</h3>
              <p className="text-muted info-desc">{item.desc}</p>
              {user ? (
                <Link className={`btn ${item.color} mt-2`} to={item.link}>
                  View Details »
                </Link>
              ) : (
                <button
                  className={`btn ${item.color} mt-2`}
                  onClick={() => goToLoginWithMessage("Please login first")}
                >
                  View Details »
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Features Section */}
      <div className="container my-5">
        <h2 className="text-center fw-bold mb-5">Features</h2>
        <div className="row g-4">
          {[
            {
              title: "🔒 Safe & Trusted",
              desc: "A secure, student-only platform for posting and bidding on tasks.",
              icon: "https://cdn-icons-png.flaticon.com/512/3135/3135768.png",
            },

            {
              title: "⚡ Fast & Efficient",
              desc: "Get tasks completed quickly by skilled campus freelancers.",
              icon: "https://cdn-icons-png.flaticon.com/512/7872/7872852.png",
            },

            {
              title: "💰 Earn & Grow",
              desc: "Turn your skills into credits and build a strong reputation.",
              icon: "https://cdn-icons-png.flaticon.com/512/1864/1864271.png",
            },

            {
              title: "🤝 Collaborate & Support",
              desc: "Communicate easily and get help whenever needed.",
              icon: "https://cdn-icons-png.flaticon.com/512/2910/2910765.png",
            },
          ].map((feature) => (
            <div key={feature.title} className="col-md-6 col-lg-3">
              <div className="card h-100 text-center border-0 shadow-sm p-3">
                <img
                  src={feature.icon}
                  alt={feature.title}
                  width="80"
                  height="80"
                  className="mx-auto mb-3"
                />
                <div className="card-body">
                  <h5 className="card-title fw-bold">{feature.title}</h5>
                  <p className="feature-desc">{feature.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Developers Section */}
      <div className="container my-5">
        <h2 className="text-center fw-bold mb-4 text-primary">
          Message from the Developers
        </h2>
        <div className="row g-4 justify-content-center">
          {developers.map(({ name, avatar, message }) => (
            <div key={name} className="col-sm-6 col-md-4 col-lg-2 text-center">
              <img
                src={avatar}
                alt={name}
                className="rounded-circle mb-3 shadow-sm"
                width={100}
                height={100}
              />
              <h5>{name}</h5>
              <p className="dev-msg">{message}</p>
            </div>
          ))}
        </div>
      </div>

      {/* FAQs Section */}
      <div id="faqs" className="container my-5">
        <h2 className="text-center fw-bold mb-5">FAQs</h2>
        <div className="accordion" id="faqsAccordion">
          {[
            {
              question: "How do I post a task?",
              answer:
                "Simply click on 'Post Your Task', fill in the details, and submit. Campus freelancers will then be able to bid on it.",
            },
            {
              question: "How do I earn credits?",
              answer:
                "By completing tasks successfully and receiving approval, you earn credits which can be used for future services or exchanged.",
            },
            {
              question: "Is it safe for students?",
              answer:
                "Yes! GoLance is a student-only platform with verified users to ensure safety and trust.",
            },
            {
              question: "Can I communicate with freelancers?",
              answer:
                "Absolutely! You can chat and collaborate directly with freelancers through our platform messaging system.",
            },
            {
              question: "How do I get started?",
              answer:
                "Click on 'Get Started', sign up with your campus email, and start posting or bidding on tasks!",
            },
          ].map((faq, index) => (
            <div key={index} className="accordion-item">
              <h2 className="accordion-header" id={`heading${index}`}>
                <button
                  className={`accordion-button ${
                    index !== 0 ? "collapsed" : ""
                  }`}
                  type="button"
                  data-bs-toggle="collapse"
                  data-bs-target={`#collapse${index}`}
                  aria-expanded={index === 0 ? "true" : "false"}
                  aria-controls={`collapse${index}`}
                >
                  {faq.question}
                </button>
              </h2>
              <div
                id={`collapse${index}`}
                className={`accordion-collapse collapse ${
                  index === 0 ? "show" : ""
                }`}
                aria-labelledby={`heading${index}`}
                data-bs-parent="#faqsAccordion"
              >
                <div className="accordion-body text-muted">{faq.answer}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="container">
        <footer className="py-5 my-5 border-top">
          <div className="row align-items-center">
            <div className="col-md-3 mb-3 mb-md-0 d-flex align-items-center">
              <img
                src={golanceLogo}
                alt="GoLance Logo"
                height="40"
                className="me-2"
              />
              <span className="footer-text">© 2025 GoLance</span>
            </div>
            <div className="col-md-5 mb-3 mb-md-0">
              <ul className="nav justify-content-center">
                {["Home", "Features", "Pricing", "FAQs", "About"].map(
                  (item) => (
                    <li key={item} className="nav-item">
                      <a href="#" className="nav-link footer-link px-2">
                        {item}
                      </a>
                    </li>
                  )
                )}
              </ul>
            </div>
            <div className="col-md-4 text-center text-md-end">
              <p className="mb-1 footer-text">📧 golance@gmail.com</p>
              <p className="mb-0 footer-text">📞 +91 98765 43210</p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
