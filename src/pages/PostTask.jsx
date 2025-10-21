// src/pages/PostTask.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, Form, Button } from "react-bootstrap";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "bootstrap/dist/css/bootstrap.min.css";

export default function PostTask() {
  const [task, setTask] = useState({
    title: "",
    description: "",
    creditsOffered: "",
    category: "",
    deadline: null,
  });

  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Optional: prevent typing 0 or negative values
    if (name === "creditsOffered" && value < 1) return;

    setTask({ ...task, [name]: value });
  };

  const handleDateChange = (date) => {
    setTask({ ...task, deadline: date });
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

    const taskData = {
      title: task.title,
      description: task.description,
      category: task.category,
      deadline: task.deadline ? task.deadline.toISOString().split("T")[0] : "",
      status: "OPEN",
      creditsOffered: parseInt(task.creditsOffered),
      postedById: user.id,
    };

    try {
      const response = await fetch("http://localhost:8080/api/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(taskData),
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
      <div className="container-fluid posttask-container mt-4">
        <div className="row">
          {/* Sidebar */}
          <div className="col-md-3 mb-4">
            <div className="sidebar p-3 shadow-sm rounded">
              <h5 className="mb-3">Tasks</h5>
              <ul className="list-unstyled">
                <li className="mb-2">
                  <Button variant="light" className="w-100 text-start">
                    + Post New Task
                  </Button>
                </li>
                <li className="mb-2">
                  <Button variant="light" className="w-100 text-start">
                    <a href="/my-tasks">My Tasks</a>
                  </Button>
                </li>
                <li className="mb-2">
                  <Button variant="light" className="w-100 text-start">
                    Review Bids
                  </Button>
                </li>
                <li>
                  <Button variant="light" className="w-100 text-start">
                    Completed Tasks
                  </Button>
                </li>
              </ul>
            </div>
          </div>

          {/* Form Card */}
          <div className="col-md-9">
            <Card className="shadow-sm p-4">
              <h2 className="mb-4 text-center">📌 Post a New Task</h2>
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3" controlId="formTitle">
                  <Form.Label>Task Title</Form.Label>
                  <Form.Control
                    type="text"
                    name="title"
                    value={task.title}
                    onChange={handleChange}
                    placeholder="E.g., Design a landing page for new product launch"
                    required
                  />
                  <Form.Text className="text-muted">
                    A concise and descriptive title for your task.
                  </Form.Text>
                </Form.Group>

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
                  <Form.Text className="text-muted">
                    Include any requirements or deliverables.
                  </Form.Text>
                </Form.Group>

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

                <div className="row mb-3">
                  <div className="col-md-6">
                    <Form.Group controlId="formCategory">
                      <Form.Label>Category</Form.Label>
                      <Form.Control
                        type="text"
                        name="category"
                        value={task.category}
                        onChange={handleChange}
                        placeholder="e.g. Web Development"
                        required
                      />
                    </Form.Group>
                  </div>
                </div>

                <div className="d-flex justify-content-end gap-2 btn">
                  <Button type="submit" variant="primary">
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
