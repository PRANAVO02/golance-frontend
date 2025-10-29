import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import { ENDPOINTS } from "../api/endpoints"; // ✅ Import endpoints

export default function LoginPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // const res = await fetch("http://localhost:8080/api/auth/login", {
         const res = await fetch(ENDPOINTS.LOGIN, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Login failed");
      }

      const data = await res.json(); // expecting { token, user }

      if (data.token && data.user) {
        // ✅ Save token and user in localStorage
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));

        navigate("/"); // redirect to HomePage
      } else {
        setError("Invalid username or password");
      }
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
        background: "linear-gradient(135deg, #4d90d3ff 0%, #E7F2EF 100%)",
        padding: "20px",
      }}
    >
      <div
        className="card shadow-lg p-5"
        style={{ width: "450px", maxWidth: "100%", borderRadius: "12px" }}
      >
        <h2 className="text-center mb-4 text-primary">Login to GoLance</h2>
        {error && <div className="alert alert-danger">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
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
          <div className="mb-3">
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
          <button
            type="submit"
            className="btn btn-primary w-100"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
        <p className="text-center mt-3">
          Don&apos;t have an account?{" "}
          <Link to="/register" className="fw-bold text-decoration-none">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}
