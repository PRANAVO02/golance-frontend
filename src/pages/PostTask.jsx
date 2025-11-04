import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, Form, Button } from "react-bootstrap";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { ENDPOINTS } from "../api/endpoints";

export default function PostTask() {
  const [task, setTask] = useState({
    title: "",
    description: "",
    creditsOffered: "",
    category: "",
    deadline: null,
  });
  const [file, setFile] = useState(null);
  const [walletBalance, setWalletBalance] = useState(null);
  const [loadingWallet, setLoadingWallet] = useState(true);

  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");

  const [theme] = useState(() => localStorage.getItem("theme") || "light");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  // 🔹 Fetch user wallet balance
  useEffect(() => {
    const fetchWalletBalance = async () => {
      if (!user || !token) return;
      try {
        const res = await fetch(ENDPOINTS.WALLET_BALANCE(user.id), {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!res.ok) throw new Error("Failed to fetch wallet balance");
        const data = await res.json();
        setWalletBalance(data);
      } catch (err) {
        console.error("Error fetching wallet balance:", err);
      } finally {
        setLoadingWallet(false);
      }
    };
    fetchWalletBalance();
  }, [user, token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "creditsOffered" && value < 1) return;
    setTask({ ...task, [name]: value });
  };

  const handleDateChange = (date) => {
    setTask({ ...task, deadline: date });
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user || !token) {
      alert("You must be logged in to post a task.");
      navigate("/login");
      return;
    }

    if (parseInt(task.creditsOffered) < 1) {
      alert("❌ Credits value should not be less than 1!");
      return;
    }

    // 🔹 Wallet balance check before posting
    if (!loadingWallet && walletBalance !== null) {
      if (parseInt(task.creditsOffered) > walletBalance) {
        if (
          window.confirm(
            `⚠️ You only have ${walletBalance} credits, but this task requires ${task.creditsOffered}. Would you like to recharge now?`
          )
        ) {
          navigate("/wallet");
        }
        return;
      }
    }

    const formData = new FormData();
    formData.append(
      "task",
      new Blob(
        [
          JSON.stringify({
            title: task.title,
            description: task.description,
            category: task.category,
            deadline: task.deadline
              ? task.deadline.toISOString().split("T")[0]
              : "",
            status: "OPEN",
            creditsOffered: parseInt(task.creditsOffered),
            postedById: user.id,
          }),
        ],
        { type: "application/json" }
      )
    );

    if (file) formData.append("file", file);

    try {
      const response = await fetch(ENDPOINTS.TASKS, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.ok) {
        alert("✅ Task posted successfully!");
        navigate("/my-tasks");
      } else {
        const err = await response.json();
        alert("❌ Failed to post task: " + (err.message || "Unknown error"));
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Something went wrong!");
    }
  };

  return (
    <div className="container-fluid mt-4">
      <div className="container posttask-container mt-4">
        <div className="row">
          {/* Sidebar */}
          <div className="col-md-3 mb-4">
            <div className="sidebar p-3 shadow-sm rounded bg-light">
              <h5 className="mb-3">Tasks</h5>
              <ul className="list-unstyled">
                <li className="mb-2">
                  <Button variant="light" className="w-100 text-start">
                    <a href="/post-task" className="text-decoration-none">
                      Post Task
                    </a>
                  </Button>
                </li>
                <li className="mb-2">
                  <Button variant="light" className="w-100 text-start">
                    <a href="/my-tasks" className="text-decoration-none">
                      My Tasks
                    </a>
                  </Button>
                </li>
              </ul>

              {/* Wallet summary */}
              <div className="wallet-summary mt-4 p-2 rounded text-center bg-white border">
                {loadingWallet ? (
                  <p className="text-muted">Loading wallet...</p>
                ) : (
                  <>
                    <p className="fw-bold mb-1">💳 Wallet Balance</p>
                    <h5 className="text-success">
                      {walletBalance !== null ? `${walletBalance} credits` : "N/A"}
                    </h5>
                    <Button
                      variant="outline-primary"
                      size="sm"
                      onClick={() => navigate("/wallet")}
                    >
                      Recharge
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Form Card */}
          <div className="col-md-9">
            <Card className="shadow-sm p-4 rounded">
              <h2 className="mb-4 text-center">📌 Post a New Task</h2>
              <Form onSubmit={handleSubmit} encType="multipart/form-data">
                {/* Title */}
                <Form.Group className="mb-3" controlId="formTitle">
                  <Form.Label>Task Title</Form.Label>
                  <Form.Control
                    type="text"
                    name="title"
                    value={task.title}
                    onChange={handleChange}
                    placeholder="E.g., Design a landing page"
                    required
                  />
                </Form.Group>

                {/* Description */}
                <Form.Group className="mb-3" controlId="formDescription">
                  <Form.Label>Task Description</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={4}
                    name="description"
                    value={task.description}
                    onChange={handleChange}
                    placeholder="Clearly describe what needs to be done"
                    required
                  />
                </Form.Group>

                {/* Deadline & Credits */}
                <div className="row mb-3">
                  <div className="col-md-6">
                    <Form.Group controlId="formDeadline">
                      <Form.Label>Due Date</Form.Label>
                      <DatePicker
                        selected={task.deadline}
                        onChange={handleDateChange}
                        dateFormat="yyyy-MM-dd"
                        minDate={new Date()}
                        placeholderText="Select a deadline"
                        className="form-control"
                        required
                      />
                    </Form.Group>
                  </div>
                  <div className="col-md-6">
                    <Form.Group controlId="formCredits">
                      <Form.Label>Budget (Credits)</Form.Label>
                      <Form.Control
                        type="number"
                        name="creditsOffered"
                        value={task.creditsOffered}
                        onChange={handleChange}
                        placeholder="Assign credit based on the work."
                        required
                        min="1"
                      />
                    </Form.Group>
                  </div>
                </div>

                {/* Category */}
                <Form.Group className="mb-3" controlId="formCategory">
                  <Form.Label>Category</Form.Label>
                  <Form.Select
                    name="category"
                    value={task.category}
                    onChange={handleChange}
                    required
                  >
                    <option value="">-- Select a category --</option>
                    <option value="Web Development">🌐 Web Development</option>
                    <option value="Mobile Development">📱 Mobile Development</option>
                    <option value="UI/UX Design">🎨 UI/UX Design</option>
                    <option value="Graphic Design">🖌 Graphic Design</option>
                    <option value="Content Writing">✍️ Content Writing</option>
                    <option value="Digital Marketing">📢 Digital Marketing</option>
                    <option value="Video Editing">🎬 Video Editing</option>
                    <option value="Photography">📷 Photography</option>
                    <option value="Data Analysis">📊 Data Analysis</option>
                    <option value="Research">🔍 Research</option>
                    <option value="Event Planning">📅 Event Planning</option>
                    <option value="Consulting">💼 Consulting</option>
                    <option value="Translation">🌍 Translation</option>
                    <option value="Tutoring">📚 Tutoring</option>
                    <option value="Other">🔹 Other</option>
                  </Form.Select>
                </Form.Group>

                {/* File Upload */}
                <Form.Group className="mb-3" controlId="formFile">
                  <Form.Label>Attach File (Optional)</Form.Label>
                  <Form.Control type="file" onChange={handleFileChange} />
                  {file && (
                    <Form.Text className="text-success">
                      Selected file: {file.name}
                    </Form.Text>
                  )}
                </Form.Group>

                {/* Submit Button */}
                <div className="d-flex justify-content-end gap-2">
                  <Button
                    type="submit"
                    style={{
                      background: "linear-gradient(90deg, #9b5de5, #f15bb5)",
                      border: "none",
                    }}
                  >
                    Post Task
                  </Button>
                </div>
              </Form>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
