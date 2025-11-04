import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import { ENDPOINTS } from "../api/endpoints";

export default function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    skills: "",
    studyingYear: "",
    department: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [theme] = useState(() => localStorage.getItem("theme") || "light");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

const vitEmailRegex = /^[a-z]+\.[a-z]+\d{4}@vitstudent\.ac\.in$/;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });

    if (name === "email") {
      if (!vitEmailRegex.test(value)) {
        setEmailError(
          "Email must be in format: firstname.lastname2024@vitstudent.ac.in"
        );
      } else {
        setEmailError("");
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!vitEmailRegex.test(form.email)) {
      setError("Invalid VIT email format");
      setLoading(false);
      return;
    }

    try {
      const registerRes = await fetch(ENDPOINTS.REGISTER, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!registerRes.ok) {
        const errData = await registerRes.json();
        throw new Error(errData?.message || "Registration failed");
      }

      await registerRes.json();

      // alert("Registration successful! Please login.");
      navigate("/login");
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const departments = [
    "CSE", "MIS", "ECE", "EEE", "SWE", "IT", "Mechanical", "Civil", 
    "Chemical", "Biotech", "Others"
  ];

  const studyingYears = [
    "1st Year", "2nd Year", "3rd Year", "4th Year", "5th Year"
  ];

  return (
    <div className="main-container">
      <div className="content-wrapper">
        <div className="container-fluid">
          <div className="row justify-content-center align-items-center min-vh-100">
            <div className="col-12 col-md-10 col-lg-8 col-xl-6">
              {/* Register Card */}
              <div className="card glass border-0 shadow-lg overflow-hidden">
                <div className="card-body p-5">
                  {/* Header */}
                  <div className="text-center mb-4">
                    <div className="logo-container mb-4">
                      <div 
                        className="logo-circle mx-auto d-flex align-items-center justify-content-center mb-3"
                        style={{
                          width: '80px',
                          height: '80px',
                          background: 'var(--primary-gradient)',
                          borderRadius: '50%',
                          fontSize: '2rem',
                          color: 'white',
                          fontWeight: 'bold'
                        }}
                      >
                        GL
                      </div>
                      <h1 className="gradient-text fw-bold mb-2">Join GoLance</h1>
                      <p className="text-muted">Create your account and start freelancing</p>
                    </div>
                  </div>

                  {/* Error Alert */}
                  {error && (
                    <div className="alert alert-danger d-flex align-items-center" role="alert">
                      <i className="bi bi-exclamation-triangle-fill me-2"></i>
                      <div>{error}</div>
                    </div>
                  )}

                  {/* Register Form */}
                  <form onSubmit={handleSubmit}>
                    <div className="row g-3">
                      {/* Username */}
                      <div className="col-md-6">
                        <label htmlFor="username" className="form-label fw-semibold">
                          <i className="bi bi-person me-2"></i>Username *
                        </label>
                        <input
                          type="text"
                          id="username"
                          name="username"
                          className="form-control form-control-lg"
                          placeholder="Enter username"
                          value={form.username}
                          onChange={handleChange}
                          required
                          disabled={loading}
                        />
                      </div>

                      {/* Email */}
                      <div className="col-md-6">
                        <label htmlFor="email" className="form-label fw-semibold">
                          <i className="bi bi-envelope me-2"></i>VIT Email *
                        </label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          className={`form-control form-control-lg ${emailError ? 'is-invalid' : ''}`}
                          placeholder="firstname.lastname2024@vitstudent.ac.in"
                          value={form.email}
                          onChange={handleChange}
                          required
                          disabled={loading}
                        />
                        {emailError && (
                          <div className="invalid-feedback d-flex align-items-center">
                            <i className="bi bi-info-circle me-1"></i>
                            {emailError}
                          </div>
                        )}
                        {!emailError && form.email && (
                          <div className="valid-feedback d-flex align-items-center">
                            <i className="bi bi-check-circle me-1"></i>
                            Valid VIT email format
                          </div>
                        )}
                      </div>

                      {/* Password */}
                      <div className="col-12">
                        <label htmlFor="password" className="form-label fw-semibold">
                          <i className="bi bi-lock me-2"></i>Password *
                        </label>
                        <div className="input-group">
                          <input
                            type={showPassword ? "text" : "password"}
                            id="password"
                            name="password"
                            className="form-control form-control-lg"
                            placeholder="Create a strong password"
                            value={form.password}
                            onChange={handleChange}
                            required
                            disabled={loading}
                          />
                          <button
                            type="button"
                            className="btn btn-outline-secondary"
                            onClick={togglePasswordVisibility}
                            disabled={loading}
                          >
                            <i className={`bi bi-eye${showPassword ? '-slash' : ''}`}></i>
                          </button>
                        </div>
                        <small className="text-muted">
                          Use at least 8 characters with mix of letters, numbers, and symbols
                        </small>
                      </div>

                      {/* Skills */}
                      <div className="col-12">
                        <label htmlFor="skills" className="form-label fw-semibold">
                          <i className="bi bi-lightning me-2"></i>Skills
                        </label>
                        <input
                          type="text"
                          id="skills"
                          name="skills"
                          className="form-control form-control-lg"
                          placeholder="e.g., React, Node.js, Python, UI/UX Design"
                          value={form.skills}
                          onChange={handleChange}
                          disabled={loading}
                        />
                        <small className="text-muted">
                          Separate multiple skills with commas
                        </small>
                      </div>

                      {/* Studying Year & Department */}
                      <div className="col-md-6">
                        <label htmlFor="studyingYear" className="form-label fw-semibold">
                          <i className="bi bi-calendar me-2"></i>Year of Study *
                        </label>
                        <select
                          id="studyingYear"
                          name="studyingYear"
                          className="form-select form-select-lg"
                          value={form.studyingYear}
                          onChange={handleChange}
                          required
                          disabled={loading}
                        >
                          <option value="">Select your year</option>
                          {studyingYears.map((year) => (
                            <option key={year} value={year}>{year}</option>
                          ))}
                        </select>
                      </div>

                      <div className="col-md-6">
                        <label htmlFor="department" className="form-label fw-semibold">
                          <i className="bi bi-building me-2"></i>Department *
                        </label>
                        <select
                          id="department"
                          name="department"
                          className="form-select form-select-lg"
                          value={form.department}
                          onChange={handleChange}
                          required
                          disabled={loading}
                        >
                          <option value="">Select department</option>
                          {departments.map((dept) => (
                            <option key={dept} value={dept}>{dept}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Submit Button */}
                    <div className="mt-4">
                      <button
                        type="submit"
                        className="btn btn-primary btn-lg w-100 py-3 fw-semibold"
                        disabled={loading || emailError || !form.email || !form.username || !form.password || !form.studyingYear || !form.department}
                      >
                        {loading ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                            Creating Account...
                          </>
                        ) : (
                          <>
                            <i className="bi bi-person-plus me-2"></i>
                            Create Account
                          </>
                        )}
                      </button>
                    </div>
                  </form>

                  {/* Divider */}
                  <div className="text-center my-4">
                    <div className="divider d-flex align-items-center">
                      <div className="flex-grow-1 border-top"></div>
                      <span className="px-3 small text-muted">ALREADY HAVE AN ACCOUNT?</span>
                      <div className="flex-grow-1 border-top"></div>
                    </div>
                  </div>

                  {/* Login Link */}
                  <div className="text-center">
                    <p className="mb-0 text-muted">
                      Already have an account?{" "}
                      <Link 
                        to="/login" 
                        className="fw-bold text-decoration-none gradient-link"
                        style={{ background: 'linear-gradient(135deg, var(--primary-btn-bg), var(--link-color))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
                      >
                        Sign in here
                      </Link>
                    </p>
                  </div>
                </div>

                {/* Footer */}
                <div className="card-footer text-center py-3" style={{background: 'var(--bg-color)'}}>
                  <small className="text-muted">
                    By creating an account, you agree to our{" "}
                    <Link to="/terms" className="text-decoration-none">Terms</Link>{" "}
                    and{" "}
                    <Link to="/privacy" className="text-decoration-none">Privacy Policy</Link>
                  </small>
                </div>
              </div>

              {/* Registration Benefits */}
              <div className="text-center mt-4">
                <div className="card glass border-0 p-4">
                  <h6 className="fw-bold mb-3">Why Join GoLance?</h6>
                  <div className="row g-3">
                    <div className="col-md-4">
                      <div className="d-flex align-items-center">
                        <i className="bi bi-coin text-success me-2"></i>
                        <small>Earn Credits</small>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="d-flex align-items-center">
                        <i className="bi bi-briefcase text-primary me-2"></i>
                        <small>Freelance Work</small>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="d-flex align-items-center">
                        <i className="bi bi-people text-warning me-2"></i>
                        <small>VIT Community</small>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Custom Styles */}
      <style jsx>{`
        .min-vh-100 {
          min-height: 100vh;
        }
        
        .logo-circle {
          transition: transform 0.3s ease;
        }
        
        .logo-circle:hover {
          transform: scale(1.05);
        }
        
        .gradient-text {
          background: linear-gradient(135deg, var(--primary-btn-bg), var(--link-color));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        
        .gradient-link {
          transition: all 0.3s ease;
        }
        
        .gradient-link:hover {
          filter: brightness(1.2);
        }
        
        .form-control, .form-select {
          transition: all 0.3s ease;
          border: 2px solid var(--input-border);
        }
        
        .form-control:focus, .form-select:focus {
          border-color: var(--primary-btn-bg);
          box-shadow: 0 0 0 0.2rem rgba(var(--primary-btn-bg), 0.25);
        }
        
        .btn-primary {
          background: var(--primary-gradient);
          border: none;
          transition: all 0.3s ease;
        }
        
        .btn-primary:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
        }
        
        .btn-primary:disabled {
          opacity: 0.7;
          transform: none;
        }
        
        .divider {
          color: var(--text-muted);
        }
        
        .card {
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        
        .card:hover {
          transform: translateY(-5px);
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .card {
          animation: fadeIn 0.5s ease;
        }
        
        .valid-feedback {
          display: flex !important;
          color: var(--success-color, #28a745);
        }
      `}</style>
    </div>
  );
}