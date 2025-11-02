import { useState,useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import { ENDPOINTS } from "../api/endpoints"; // ✅ imported

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
  // theme
  const [theme] = useState(() => localStorage.getItem("theme") || "light");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);
  const vitEmailRegex = /^[a-z]+(?:\.[a-z]+)?\d{4}@vitstudent\.ac\.in$/;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });

    if (name === "email") {
      if (!vitEmailRegex.test(value)) {
        setEmailError(
          "Email must be in format: firstname.lastname2022@vitstudent.ac.in"
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

    // Extra check before submission
    if (!vitEmailRegex.test(form.email)) {
      setError("Invalid VIT email format");
      setLoading(false);
      return;
    }

    try {
      // const registerRes = await fetch(
      //   "http://localhost:8080/api/users/register",
         const registerRes = await fetch(ENDPOINTS.REGISTER,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        }
      );

      if (!registerRes.ok) {
        const errData = await registerRes.json();
        throw new Error(errData?.message || "Registration failed");
      }

      await registerRes.json();

      alert("Registration successful! Please login.");
      navigate("/login");
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="d-flex justify-content-center align-items-center"
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #56c4c8ff 0%, #479bb5ff 100%)",
        padding: "20px",
      }}
    >
      <div
        className="card shadow-lg p-5"
        style={{ width: "450px", maxWidth: "100%", borderRadius: "12px" }}
      >
        <h2 className="text-center mb-4 text-danger">Register for GoLance</h2>
        {error && <div className="alert alert-danger">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="mb-3 input-group">
            <span className="input-group-text">
              <i className="bi bi-person-fill"></i>
            </span>
            <input
              type="text"
              name="username"
              placeholder="Username"
              className="form-control"
              value={form.username}
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-3 input-group">
            <span className="input-group-text">
              <i className="bi bi-envelope-fill"></i>
            </span>
            <input
              type="email"
              name="email"
              placeholder="Email"
              className={`form-control ${emailError ? "is-invalid" : ""}`}
              value={form.email}
              onChange={handleChange}
              required
            />
            {emailError && (
              <div className="invalid-feedback">{emailError}</div>
            )}
          </div>
          <div className="mb-3 input-group">
            <span className="input-group-text">
              <i className="bi bi-lock-fill"></i>
            </span>
            <input
              type="password"
              name="password"
              placeholder="Password"
              className="form-control"
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-3 input-group">
            <span className="input-group-text">
              <i className="bi bi-lightbulb-fill"></i>
            </span>
            <input
              type="text"
              name="skills"
              placeholder="Skills (comma separated)"
              className="form-control"
              value={form.skills}
              onChange={handleChange}
            />
          </div>
          <div className="mb-3">
            <select
              name="studyingYear"
              className="form-select"
              value={form.studyingYear}
              onChange={handleChange}
              required
            >
              <option value="">Select Year</option>
              <option value="1st Year">1st Year</option>
              <option value="2nd Year">2nd Year</option>
              <option value="3rd Year">3rd Year</option>
              <option value="4th Year">4th Year</option>
              <option value="4th Year">5th Year</option>
            </select>
          </div>
          <div className="mb-3">
            <select
              name="department"
              className="form-select"
              value={form.department}
              onChange={handleChange}
              required
            >
              <option value="">Select Department</option>
              <option value="CSE">CSE</option>
              <option value="MIS">MIS</option>
              <option value="ECE">ECE</option>
              <option value="EEE">EEE</option>
              <option value="SWE">SWE</option>
              <option value="SWE">IT</option>
              <option value="SWE">Others</option>
            </select>
          </div>
          <button
            type="submit"
            className="btn btn-secondary w-100"
            disabled={loading}
          >
            {loading ? "Registering..." : "Register"}
          </button>
        </form>
        <p className="text-center mt-3">
          Already have an account?{" "}
          <Link to="/login" className="fw-bold text-decoration-none">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
