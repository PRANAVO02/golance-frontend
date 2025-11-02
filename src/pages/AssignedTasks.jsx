import { useState,useEffect } from "react";
import { Button, Modal, Form } from "react-bootstrap";
import { ENDPOINTS } from "../api/endpoints";

export default function AssignedTasks({
  assignedTasks,
  setAssignedTasks,
  headers,
  fetchAssignedTasks,
}) {
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [uploadFiles, setUploadFiles] = useState({}); // 🔹 track files separately
  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");
  const [theme] = useState(() => localStorage.getItem("theme") || "light");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);
  // ---------- Start Task ----------
  const handleStartTask = async (taskId) => {
    try {
      const res = await fetch(ENDPOINTS.TASK_UPDATE_STATUS(taskId), {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...headers },
        body: JSON.stringify({ status: "IN_PROGRESS" }),
      });

      if (res.ok) {
        setAssignedTasks((prev) =>
          prev.map((task) =>
            task.id === taskId ? { ...task, status: "IN_PROGRESS" } : task
          )
        );
      } else {
        const errorData = await res.json();
        alert("Failed to start task: " + (errorData.message || res.statusText));
      }
    } catch (err) {
      console.error(err);
      alert("Error starting task");
    }
  };

  // ---------- File Upload + Submit Task ----------
  const handleFileUploadAndSubmit = async (taskId) => {
    const file = uploadFiles[taskId];
    if (!file) {
      alert("Please choose a file before submitting!");
      return;
    }

    try {
      // Step 1: Upload freelancer file
      const formData = new FormData();
      formData.append("file", file);

      const uploadRes = await fetch(ENDPOINTS.UPLOAD_FREELANCER_FILE(taskId), {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!uploadRes.ok) throw new Error("File upload failed");

      // Step 2: Update task status
      const res = await fetch(ENDPOINTS.TASK_UPDATE_STATUS(taskId), {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...headers },
        body: JSON.stringify({ status: "PENDING" }),
      });

      if (res.ok) {
        setAssignedTasks((prev) =>
          prev.map((t) =>
            t.id === taskId
              ? { ...t, status: "PENDING", showSubmitBox: false }
              : t
          )
        );
        alert("✅ File submitted successfully for review!");
      } else {
        const errorData = await res.json();
        alert(
          "Failed to submit task: " + (errorData.message || res.statusText)
        );
      }
    } catch (err) {
      console.error(err);
      alert("Error submitting task");
    }
  };

  // ---------- File Download ----------
  const handleDownload = async (task) => {
    if (!task.filePath) {
      alert("No file available for this task");
      return;
    }

    try {
      const response = await fetch(`${ENDPOINTS.TASKS}/download/${task.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Failed to download file");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const originalFileName = task.filePath.split("_").slice(1).join("_");
      const safeTitle = task.title.replace(/\s+/g, "_");
      const finalFileName = `${safeTitle}_${originalFileName}`;

      const link = document.createElement("a");
      link.href = url;
      link.download = finalFileName;
      link.click();

      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error(error);
      alert("❌ Could not download file");
    }
  };

  const handleViewTask = (task) => {
    setSelectedTask(task);
    setShowDetailsModal(true);
  };

  return (
    <>
      <div className="table-responsive">
        <table className="table table-bordered table-hover text-center">
          <thead>
            <tr>
              <th>Title</th>
              <th>Category</th>
              <th>Credits</th>
              <th>Deadline</th>
              <th>Status</th>
              <th>File</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {assignedTasks && assignedTasks.length > 0 ? (
              assignedTasks.map((task) => (
                <tr key={task.id}>
                  <td>{task.title}</td>
                  <td>{task.category}</td>
                  <td>{task.creditsOffered}</td>
                  <td>{task.deadline}</td>
                  <td>{task.status}</td>

                  <td>
                    {task.filePath ? (
                      <Button
                        variant="outline-success"
                        size="sm"
                        onClick={() => handleDownload(task)}
                      >
                        ⬇️ Download
                      </Button>
                    ) : (
                      <span className="text-muted">No File</span>
                    )}
                  </td>

                  <td>
                    {task.status === "ALLOCATED" && (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleStartTask(task.id)}
                      >
                        Start Task
                      </Button>
                    )}

                    {task.status === "IN_PROGRESS" && (
                      <>
                        {!task.showSubmitBox && (
                          <Button
                            variant="warning"
                            size="sm"
                            onClick={() =>
                              setAssignedTasks((prev) =>
                                prev.map((t) =>
                                  t.id === task.id
                                    ? { ...t, showSubmitBox: true }
                                    : t
                                )
                              )
                            }
                          >
                            Submit Task
                          </Button>
                        )}

                        {task.showSubmitBox && (
                          <div className="mt-2">
                            <Form.Control
                              type="file"
                              onChange={(e) =>
                                setUploadFiles((prev) => ({
                                  ...prev,
                                  [task.id]: e.target.files[0],
                                }))
                              }
                            />
                            <Button
                              variant="success"
                              size="sm"
                              className="mt-2"
                              onClick={() => handleFileUploadAndSubmit(task.id)}
                            >
                              📤 Submit for Review
                            </Button>
                          </div>
                        )}
                      </>
                    )}

                    {task.status === "PENDING" && (
                      <span className="text-warning fw-bold">
                        Awaiting Review
                      </span>
                    )}

                    <Button
                      variant="info"
                      size="sm"
                      className="ms-2"
                      onClick={() => handleViewTask(task)}
                    >
                      View Details
                    </Button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7">No tasks assigned to you.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ---------- Task Details Modal ---------- */}
      <Modal
        show={showDetailsModal}
        onHide={() => setShowDetailsModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Task Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedTask ? (
            <>
              <p>
                <strong>Title:</strong> {selectedTask.title}
              </p>
              <p>
                <strong>Description:</strong> {selectedTask.description}
              </p>
              <p>
                <strong>Category:</strong> {selectedTask.category}
              </p>
              <p>
                <strong>Credits:</strong> {selectedTask.creditsOffered}
              </p>
              <p>
                <strong>Deadline:</strong> {selectedTask.deadline}
              </p>
              <p>
                <strong>Status:</strong> {selectedTask.status}
              </p>
              <p>
                <strong>Posted By:</strong> {selectedTask.postedByName}
              </p>{" "}
              {/* ✅ new line */}
              {selectedTask.filePath && (
                <Button
                  variant="outline-success"
                  size="sm"
                  onClick={() => handleDownload(selectedTask)}
                >
                  ⬇️ Download File
                </Button>
              )}
            </>
          ) : (
            <p>No task selected.</p>
          )}
        </Modal.Body>

        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowDetailsModal(false)}
          >
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
