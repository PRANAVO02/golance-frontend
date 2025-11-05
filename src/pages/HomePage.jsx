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

  useEffect(() => {
    if (location.state?.fromLogin) {
      window.location.reload();
    }
  }, [location.state]);

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
    <div className="homepage-container">
      {/* Hero Section */}
      <section className="hero-section text-center py-5 mb-5">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-8">
              <h1 className="hero-title display-4 fw-bold mb-4">
                Welcome to <span className="brand-text">GoLance</span>
              </h1>
              <p className="hero-subtitle lead mb-4">
                The premier platform for students to collaborate, earn credits, and 
                bring ideas to life through campus freelancing
              </p>
              {!user && (
                <div className="hero-actions">
                  <Link to="/register" className="btn btn-primary btn-lg px-4 me-3">
                    Get Started Free
                  </Link>
                  <Link to="/login" className="btn btn-outline-primary btn-lg px-4">
                    Sign In
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Info Section */}
      <section className="info-section py-5">
        <div className="container">
          <div className="row g-4">
            {[
              {
                title: "📌 Create a Task",
                desc: "Have a project, assignment, or idea? Post it and let campus talent bring it to life.",
                icon: "https://cdn-icons-png.flaticon.com/512/7872/7872852.png",
                link: "/post-task",
                color: "btn-primary",
              },
              {
                title: "💰 Browse & Bid",
                desc: "Discover available tasks, place your bids, and earn credits for your skills.",
                icon: "https://cdn-icons-png.flaticon.com/512/1864/1864271.png",
                link: "/tasks",
                color: "btn-primary",
              },
              {
                title: "🗂️ My Task Dashboard",
                desc: "View tasks you posted, bids you placed, and assignments you're working on.",
                icon: "https://cdn-icons-png.flaticon.com/512/3135/3135768.png",
                link: "/my-tasks",
                color: "btn-primary",
              },
            ].map((item, idx) => (
              <div key={idx} className="col-lg-4">
                <div className="info-card text-center p-4 rounded-4 h-100 position-relative overflow-hidden">
                  <div className="card-background"></div>
                  <div className="card-content position-relative">
                    <div className="icon-container mb-4">
                      <img
                        src={item.icon}
                        alt={item.title}
                        className="info-icon"
                      />
                    </div>
                    <h3 className="fw-bold mb-3 info-title">{item.title}</h3>
                    <p className="info-desc mb-4">{item.desc}</p>
                    {user ? (
                      <Link className={`btn ${item.color} btn-glow mt-2`} to={item.link}>
                        Get Started »
                      </Link>
                    ) : (
                      <button
                        className={`btn ${item.color} btn-glow mt-2`}
                        onClick={() => goToLoginWithMessage("Please login first")}
                      >
                        Get Started »
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features-section py-5">
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="section-title fw-bold">Why Choose GoLance?</h2>
            <p className="section-subtitle text-muted">
              Designed specifically for students, by students
            </p>
          </div>
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
            ].map((feature, index) => (
              <div key={feature.title} className="col-md-6 col-lg-3">
                <div className="feature-card card h-100 text-center border-0 p-4">
                  <div className="feature-icon-container mb-3">
                    <img
                      src={feature.icon}
                      alt={feature.title}
                      className="feature-icon"
                    />
                  </div>
                  <div className="card-body">
                    <h5 className="card-title fw-bold">{feature.title}</h5>
                    <p className="feature-desc">{feature.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section py-5">
        <div className="container">
          <div className="row text-center g-4">
            {[
              { number: "500+", label: "Active Students" },
              { number: "1,200+", label: "Tasks Completed" },
              { number: "₹50K+", label: "Credits Earned" },
              { number: "99%", label: "Satisfaction Rate" },
            ].map((stat, index) => (
              <div key={index} className="col-6 col-md-3">
                <div className="stat-card p-4">
                  <h3 className="stat-number fw-bold">{stat.number}</h3>
                  <p className="stat-label text-muted mb-0">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Developers Section */}
      <section id="developers" className="developers-section py-5">
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="section-title fw-bold">
              Message from the Developers
            </h2>
            <p className="section-subtitle text-muted">
              Meet the team behind GoLance
            </p>
          </div>
          <div className="row g-4 justify-content-center">
            {developers.map(({ name, avatar, message }) => (
              <div key={name} className="col-sm-6 col-md-4 col-lg-2 text-center">
                <div className="developer-card">
                  <div className="avatar-container mb-3">
                    <img
                      src={avatar}
                      alt={name}
                      className="developer-avatar rounded-circle"
                    />
                  </div>
                  <h5 className="fw-bold mb-2">{name}</h5>
                  <p className="dev-msg small">{message}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQs Section */}
      <section id="faqs" className="faqs-section py-5">
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="section-title fw-bold">Frequently Asked Questions</h2>
            <p className="section-subtitle text-muted">
              Quick answers to common questions
            </p>
          </div>
          <div className="row justify-content-center">
            <div className="col-lg-8">
              <div className="accordion custom-accordion" id="faqsAccordion">
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
                  <div key={index} className="accordion-item border-0 mb-3">
                    <h2 className="accordion-header" id={`heading${index}`}>
                      <button
                        className={`accordion-button collapsed rounded-3`}
                        type="button"
                        data-bs-toggle="collapse"
                        data-bs-target={`#collapse${index}`}
                        aria-expanded="false"
                        aria-controls={`collapse${index}`}
                      >
                        {faq.question}
                      </button>
                    </h2>
                    <div
                      id={`collapse${index}`}
                      className="accordion-collapse collapse rounded-3"
                      aria-labelledby={`heading${index}`}
                      data-bs-parent="#faqsAccordion"
                    >
                      <div className="accordion-body">{faq.answer}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section py-5">
        <div className="container">
          <div className="cta-card rounded-4 p-5 text-center">
            <h2 className="cta-title fw-bold mb-3">Ready to Get Started?</h2>
            <p className="cta-text mb-4">
              Join hundreds of students already using GoLance to collaborate and earn credits
            </p>
            {user ? (
              <div className="cta-actions">
                <Link to="/tasks" className="btn btn-light btn-lg px-4 me-3">
                  Browse Tasks
                </Link>
                <Link to="/post-task" className="btn btn-outline-light btn-lg px-4">
                  Post a Task
                </Link>
              </div>
            ) : (
              <div className="cta-actions">
                <Link to="/register" className="btn btn-light btn-lg px-4 me-3">
                  Sign Up Free
                </Link>
                <Link to="/login" className="btn btn-outline-light btn-lg px-4">
                  Sign In
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer py-5">
        <div className="container">
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
        </div>
      </footer>

      <style jsx>{`
        .homepage-container {
          overflow-x: hidden;
        }

        /* Hero Section */
        .hero-section {
          background: var(--card-bg);
          border-radius: 0 0 2rem 2rem;
          margin: 0 -1rem;
          border-bottom: 1px solid var(--input-border);
        }

        .hero-title {
          color: var(--text-color);
        }

        .hero-subtitle {
          color: var(--muted-text-color);
        }

        /* Info Cards */
        .info-card {
          background: var(--card-bg) !important;
          border: 1px solid var(--input-border) !important;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .info-card:hover {
          transform: translateY(-8px);
          box-shadow: var(--shadow-hover) !important;
        }

        .card-background {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          opacity: 0.05;
          background: var(--primary-btn-bg);
          border-radius: inherit;
        }

        .icon-container {
          background: rgba(var(--primary-btn-bg), 0.1);
          border-radius: 50%;
          width: 80px;
          height: 80px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto;
          border: 2px solid rgba(var(--primary-btn-bg), 0.2);
        }

        .info-icon {
          width: 40px;
          height: 40px;
          filter: brightness(0.8);
        }

        .info-title {
          color: var(--text-color) !important;
        }

        .info-desc {
          color: var(--muted-text-color) !important;
        }

        .btn-glow {
          box-shadow: 0 4px 15px rgba(var(--primary-btn-bg), 0.2);
          transition: all 0.3s ease;
        }

        .btn-glow:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(var(--primary-btn-bg), 0.3);
        }

        /* Features */
        .feature-card {
          background: var(--card-bg) !important;
          border: 1px solid var(--input-border) !important;
          transition: transform 0.3s ease;
        }

        .feature-card:hover {
          transform: translateY(-5px);
          box-shadow: var(--shadow-hover) !important;
        }

        .feature-icon-container {
          background: rgba(var(--primary-btn-bg), 0.1);
          border-radius: 50%;
          width: 70px;
          height: 70px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto;
          border: 2px solid rgba(var(--primary-btn-bg), 0.2);
        }

        .feature-icon {
          width: 35px;
          height: 35px;
          filter: brightness(0.8);
        }

        .feature-desc {
          color: var(--muted-text-color);
        }

        /* Stats */
        .stats-section {
          background: var(--bg-color);
          border-top: 1px solid var(--input-border);
          border-bottom: 1px solid var(--input-border);
        }

        .stat-card {
          background: var(--card-bg);
          border: 1px solid var(--input-border);
          border-radius: var(--border-radius);
          transition: transform 0.3s ease;
        }

        .stat-card:hover {
          transform: scale(1.05);
          box-shadow: var(--shadow-hover);
        }

        .stat-number {
          color: var(--primary-btn-bg);
          font-size: 2.5rem;
        }

        .stat-label {
          color: var(--muted-text-color);
        }

        /* Developers */
        .developer-card {
          transition: transform 0.3s ease;
        }

        .developer-card:hover {
          transform: translateY(-5px);
        }

        .developer-avatar {
          width: 100px;
          height: 100px;
          border: 3px solid var(--primary-btn-bg);
          transition: transform 0.3s ease;
        }

        .developer-card:hover .developer-avatar {
          transform: scale(1.1);
        }

        .dev-msg {
          color: var(--muted-text-color);
        }

        /* FAQ */
        .custom-accordion .accordion-button {
          background: var(--card-bg);
          color: var(--text-color);
          font-weight: 600;
          border: 1px solid var(--input-border);
        }

        .custom-accordion .accordion-button:not(.collapsed) {
          background: rgba(var(--primary-btn-bg), 0.1);
          color: var(--text-color);
          border-color: var(--primary-btn-bg);
        }

        .custom-accordion .accordion-body {
          background: var(--card-bg);
          border: 1px solid var(--input-border);
          border-top: none;
          color: var(--muted-text-color);
        }

        /* CTA */
        .cta-section {
          background: var(--card-bg);
          border-top: 1px solid var(--input-border);
        }

        .cta-card {
          background: rgba(var(--primary-btn-bg), 0.1);
          border: 1px solid rgba(var(--primary-btn-bg), 0.2);
          backdrop-filter: blur(10px);
        }

        .cta-title {
          color: var(--text-color);
        }

        .cta-text {
          color: var(--muted-text-color);
        }

        /* Section Titles */
        .section-title {
          color: var(--text-color);
          font-size: 2.5rem;
          margin-bottom: 1rem;
        }

        .section-subtitle {
          color: var(--muted-text-color);
          font-size: 1.2rem;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .hero-title {
            font-size: 2.5rem;
          }
          
          .section-title {
            font-size: 2rem;
          }
          
          .stat-number {
            font-size: 2rem;
          }
        }
      `}</style>
    </div>
  );
}