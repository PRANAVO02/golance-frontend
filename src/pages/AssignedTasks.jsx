import { useState, useEffect } from "react";
import {
  Button,
  Modal,
  Form,
  Card,
  Badge,
  Row,
  Col,
  ProgressBar,
} from "react-bootstrap";
import { ENDPOINTS } from "../api/endpoints";

export default function AssignedTasks({
  assignedTasks,
  setAssignedTasks,
  headers,
  fetchAssignedTasks,
}) {
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [uploadFiles, setUploadFiles] = useState({});
  const [loadingStates, setLoadingStates] = useState({});
  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");
  const [theme] = useState(() => localStorage.getItem("theme") || "light");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  // Set loading state
  const setLoading = (taskId, isLoading) => {
    setLoadingStates((prev) => ({ ...prev, [taskId]: isLoading }));
  };

  // ---------- Start Task ----------
  const handleStartTask = async (taskId) => {
    setLoading(taskId, true);
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
    } finally {
      setLoading(taskId, false);
    }
  };

  // ---------- File Upload + Submit Task ----------
  const handleFileUploadAndSubmit = async (taskId) => {
    const file = uploadFiles[taskId];
    if (!file) {
      alert("Please choose a file before submitting!");
      return;
    }

    setLoading(taskId, true);
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
        setUploadFiles((prev) => ({ ...prev, [taskId]: null }));
        // Show success feedback
        console.log("✅ File submitted successfully for review!");
      } else {
        const errorData = await res.json();
        alert(
          "Failed to submit task: " + (errorData.message || res.statusText)
        );
      }
    } catch (err) {
      console.error(err);
      alert("Error submitting task");
    } finally {
      setLoading(taskId, false);
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

  const getStatusConfig = (status) => {
    const configs = {
      ALLOCATED: { variant: "secondary", icon: "⏳", label: "Ready to Start" },
      IN_PROGRESS: { variant: "warning", icon: "🚀", label: "In Progress" },
      PENDING: { variant: "info", icon: "⏰", label: "Under Review" },
      COMPLETED: { variant: "success", icon: "✅", label: "Completed" },
      CANCELLED: { variant: "danger", icon: "❌", label: "Cancelled" },
    };
    return configs[status] || { variant: "light", icon: "📝", label: status };
  };

  const getDaysRemaining = (deadline) => {
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getUrgencyLevel = (days) => {
    if (days < 0) return { variant: "danger", text: "Overdue" };
    if (days <= 2) return { variant: "warning", text: `${days} days left` };
    if (days <= 7) return { variant: "info", text: `${days} days left` };
    return { variant: "success", text: `${days} days left` };
  };

  if (!assignedTasks || assignedTasks.length === 0) {
    return (
      <Card className="border-0 empty-state-card">
        <Card.Body className="text-center py-5">
          <div className="empty-state-icon mb-3">📭</div>
          <h5 className="text-muted mb-3">No Assigned Tasks</h5>
          <p className="text-muted mb-4">
            You don't have any assigned tasks yet. Keep bidding on tasks to get
            assigned work!
          </p>
          <Button
            variant="primary"
            onClick={() => (window.location.href = "/tasks")}
            className="px-4"
          >
            Browse Available Tasks
          </Button>
        </Card.Body>
      </Card>
    );
  }

  return (
    <>
      {/* Desktop Table View */}
      <div className="d-none d-lg-block">
        <div className="table-responsive">
          <table className="table table-hover assigned-tasks-table">
            <thead className="table-header">
              <tr>
                <th>Task Details</th>
                <th>Credits</th>
                <th>Timeline</th>
                <th>Status</th>
                <th>Files</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {assignedTasks.map((task) => {
                const statusConfig = getStatusConfig(task.status);
                const daysRemaining = getDaysRemaining(task.deadline);
                const urgency = getUrgencyLevel(daysRemaining);

                return (
                  <tr key={task.id} className="task-row">
                    <td>
                      <div className="task-info">
                        <div className="task-title fw-bold">{task.title}</div>
                        <div className="task-category">
                          <Badge
                            bg="outline-secondary"
                            className="category-badge"
                          >
                            {task.category}
                          </Badge>
                        </div>
                        <div className="task-poster small text-muted">
                          Posted by: {task.postedByName}
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="credits-info text-center">
                        <div className="allocated-credits text-success fw-bold h5 mb-1">
                          {task.allocatedCredits || task.creditsOffered}
                        </div>
                        <div className="credits-label small text-muted">
                          Credits
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="timeline-info">
                        <div className="deadline-date small text-muted mb-1">
                          {new Date(task.deadline).toLocaleDateString()}
                        </div>
                        <Badge bg={urgency.variant} className="urgency-badge">
                          {urgency.text}
                        </Badge>
                      </div>
                    </td>
                    <td>
                      <Badge bg={statusConfig.variant} className="status-badge">
                        <span className="status-icon">{statusConfig.icon}</span>
                        {statusConfig.label}
                      </Badge>
                    </td>
                    <td>
                      {task.filePath ? (
                        <Button
                          variant="outline-success"
                          size="sm"
                          onClick={() => handleDownload(task)}
                          className="download-btn"
                        >
                          <span className="btn-icon">📥</span>
                          Download
                        </Button>
                      ) : (
                        <span className="text-muted small">No File</span>
                      )}
                    </td>
                    <td>
                      <div className="actions-container">
                        {/* ALLOCATED State */}
                        {task.status === "ALLOCATED" && (
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleStartTask(task.id)}
                            disabled={loadingStates[task.id]}
                            className="action-btn"
                          >
                            {loadingStates[task.id] ? (
                              <>
                                <span className="spinner-border spinner-border-sm me-2" />
                                Starting...
                              </>
                            ) : (
                              <>
                                <span className="btn-icon">🚀</span>
                                Start Task
                              </>
                            )}
                          </Button>
                        )}

                        {/* IN_PROGRESS State */}
                        {task.status === "IN_PROGRESS" && (
                          <div className="in-progress-actions">
                            {!task.showSubmitBox ? (
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
                                className="action-btn"
                              >
                                <span className="btn-icon">📤</span>
                                Submit Work
                              </Button>
                            ) : (
                              <div className="submit-section p-3 bg-light rounded">
                                <Form.Group className="mb-2">
                                  <Form.Label className="small fw-bold">
                                    Upload your work
                                  </Form.Label>
                                  <Form.Control
                                    type="file"
                                    onChange={(e) =>
                                      setUploadFiles((prev) => ({
                                        ...prev,
                                        [task.id]: e.target.files[0],
                                      }))
                                    }
                                    className="file-input"
                                  />
                                </Form.Group>
                                <div className="d-flex gap-2">
                                  <Button
                                    variant="success"
                                    size="sm"
                                    onClick={() =>
                                      handleFileUploadAndSubmit(task.id)
                                    }
                                    disabled={
                                      loadingStates[task.id] ||
                                      !uploadFiles[task.id]
                                    }
                                    className="flex-fill"
                                  >
                                    {loadingStates[task.id] ? (
                                      <>
                                        <span className="spinner-border spinner-border-sm me-2" />
                                        Submitting...
                                      </>
                                    ) : (
                                      <>
                                        <span className="btn-icon">✅</span>
                                        Submit
                                      </>
                                    )}
                                  </Button>
                                  <Button
                                    variant="outline-secondary"
                                    size="sm"
                                    onClick={() =>
                                      setAssignedTasks((prev) =>
                                        prev.map((t) =>
                                          t.id === task.id
                                            ? { ...t, showSubmitBox: false }
                                            : t
                                        )
                                      )
                                    }
                                  >
                                    Cancel
                                  </Button>
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {/* PENDING State */}
                        {task.status === "PENDING" && (
                          <div className="text-center">
                            <Badge bg="info" className="pending-badge">
                              ⏰ Under Review
                            </Badge>
                          </div>
                        )}

                        {/* View Details Button */}
                        <Button
                          variant="outline-info"
                          size="sm"
                          onClick={() => handleViewTask(task)}
                          className="mt-2 view-details-btn"
                        >
                          <span className="btn-icon">👁️</span>
                          Details
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="d-block d-lg-none">
        <div className="tasks-cards-container">
          {assignedTasks.map((task) => {
            const statusConfig = getStatusConfig(task.status);
            const daysRemaining = getDaysRemaining(task.deadline);
            const urgency = getUrgencyLevel(daysRemaining);

            return (
              <Card key={task.id} className="task-card mb-3">
                <Card.Body>
                  {/* Header */}
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <div className="task-header">
                      <h6 className="task-title-mobile fw-bold mb-1">
                        {task.title}
                      </h6>
                      <Badge bg="outline-secondary" className="category-badge">
                        {task.category}
                      </Badge>
                    </div>
                    <Badge bg={statusConfig.variant} className="status-badge">
                      {statusConfig.icon}
                    </Badge>
                  </div>

                  {/* Task Info */}
                  <Row className="g-2 mb-3">
                    <Col xs={6}>
                      <div className="task-detail-item">
                        <div className="detail-label">Credits</div>
                        <div className="detail-value text-success fw-bold">
                          {task.allocatedCredits || task.creditsOffered}
                        </div>
                      </div>
                    </Col>
                    <Col xs={6}>
                      <div className="task-detail-item">
                        <div className="detail-label">Deadline</div>
                        <div className="detail-value">
                          <Badge bg={urgency.variant} className="urgency-badge">
                            {urgency.text}
                          </Badge>
                        </div>
                      </div>
                    </Col>
                    <Col xs={12}>
                      <div className="task-detail-item">
                        <div className="detail-label">Posted By</div>
                        <div className="detail-value text-muted small">
                          {task.postedByName}
                        </div>
                      </div>
                    </Col>
                  </Row>

                  {/* File Download */}
                  <div className="mb-3">
                    {task.filePath ? (
                      <Button
                        variant="outline-success"
                        size="sm"
                        onClick={() => handleDownload(task)}
                        className="w-100 download-btn"
                      >
                        <span className="btn-icon">📥</span>
                        Download Task File
                      </Button>
                    ) : (
                      <div className="text-center text-muted small py-1">
                        No file available
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="actions-mobile">
                    {task.status === "ALLOCATED" && (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleStartTask(task.id)}
                        disabled={loadingStates[task.id]}
                        className="w-100 mb-2 action-btn"
                      >
                        {loadingStates[task.id] ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" />
                            Starting...
                          </>
                        ) : (
                          <>
                            <span className="btn-icon">🚀</span>
                            Start Task
                          </>
                        )}
                      </Button>
                    )}

                    {task.status === "IN_PROGRESS" && (
                      <div className="in-progress-mobile">
                        {!task.showSubmitBox ? (
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
                            className="w-100 mb-2 action-btn"
                          >
                            <span className="btn-icon">📤</span>
                            Submit Work
                          </Button>
                        ) : (
                          <div className="submit-section-mobile p-3 bg-light rounded mb-2">
                            <Form.Group className="mb-2">
                              <Form.Label className="small fw-bold">
                                Upload your work
                              </Form.Label>
                              <Form.Control
                                type="file"
                                onChange={(e) =>
                                  setUploadFiles((prev) => ({
                                    ...prev,
                                    [task.id]: e.target.files[0],
                                  }))
                                }
                                className="file-input"
                              />
                            </Form.Group>
                            <div className="d-flex gap-2">
                              <Button
                                variant="success"
                                size="sm"
                                onClick={() =>
                                  handleFileUploadAndSubmit(task.id)
                                }
                                disabled={
                                  loadingStates[task.id] ||
                                  !uploadFiles[task.id]
                                }
                                className="flex-fill"
                              >
                                {loadingStates[task.id] ? (
                                  <>
                                    <span className="spinner-border spinner-border-sm me-2" />
                                    Submitting...
                                  </>
                                ) : (
                                  <>
                                    <span className="btn-icon">✅</span>
                                    Submit
                                  </>
                                )}
                              </Button>
                              <Button
                                variant="outline-secondary"
                                size="sm"
                                onClick={() =>
                                  setAssignedTasks((prev) =>
                                    prev.map((t) =>
                                      t.id === task.id
                                        ? { ...t, showSubmitBox: false }
                                        : t
                                    )
                                  )
                                }
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {task.status === "PENDING" && (
                      <div className="text-center mb-2">
                        <Badge bg="info" className="pending-badge">
                          ⏰ Under Review
                        </Badge>
                      </div>
                    )}

                    <Button
                      variant="outline-info"
                      size="sm"
                      onClick={() => handleViewTask(task)}
                      className="w-100 view-details-btn"
                    >
                      <span className="btn-icon">👁️</span>
                      View Details
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            );
          })}
        </div>
      </div>

      {/* ---------- Enhanced Task Details Modal ---------- */}
      <Modal
        show={showDetailsModal}
        onHide={() => setShowDetailsModal(false)}
        centered
        size="lg"
        className="task-details-modal"
      >
        <Modal.Header closeButton className="modal-header-custom">
          <Modal.Title>
            <span className="modal-title-icon">📋</span>
            Task Details
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedTask ? (
            <Row className="g-3">
              <Col md={6}>
                <div className="detail-item">
                  <label className="detail-label">Title</label>
                  <div className="detail-value">{selectedTask.title}</div>
                </div>
              </Col>
              <Col md={6}>
                <div className="detail-item">
                  <label className="detail-label">Category</label>
                  <div className="detail-value">
                    <Badge bg="outline-secondary">
                      {selectedTask.category}
                    </Badge>
                  </div>
                </div>
              </Col>
              <Col md={6}>
                <div className="detail-item">
                  <label className="detail-label">Credits Offered</label>
                  <div className="detail-value text-success fw-bold">
                    {selectedTask.creditsOffered}
                  </div>
                </div>
              </Col>
              <Col md={6}>
                <div className="detail-item">
                  <label className="detail-label">Accepted Credits</label>
                  <div className="detail-value text-primary fw-bold">
                    {selectedTask.allocatedCredits || "-"}
                  </div>
                </div>
              </Col>
              <Col md={6}>
                <div className="detail-item">
                  <label className="detail-label">Deadline</label>
                  <div className="detail-value">{selectedTask.deadline}</div>
                </div>
              </Col>
              <Col md={6}>
                <div className="detail-item">
                  <label className="detail-label">Status</label>
                  <div className="detail-value">
                    {getStatusConfig(selectedTask.status).icon}{" "}
                    {getStatusConfig(selectedTask.status).label}
                  </div>
                </div>
              </Col>
              <Col xs={12}>
                <div className="detail-item">
                  <label className="detail-label">Description</label>
                  <div className="detail-value description-text">
                    {selectedTask.description}
                  </div>
                </div>
              </Col>
              <Col xs={12}>
                <div className="detail-item">
                  <label className="detail-label">Posted By</label>
                  <div className="detail-value">
                    {selectedTask.postedByName}
                  </div>
                </div>
              </Col>
              {selectedTask.filePath && (
                <Col xs={12}>
                  <div className="text-center mt-3">
                    <Button
                      variant="outline-success"
                      size="lg"
                      onClick={() => handleDownload(selectedTask)}
                      className="download-btn"
                    >
                      <span className="btn-icon">📥</span>
                      Download Task File
                    </Button>
                  </div>
                </Col>
              )}
            </Row>
          ) : (
            <div className="text-center text-muted py-4">
              No task details available.
            </div>
          )}
        </Modal.Body>
        <Modal.Footer className="modal-footer-custom">
          <Button variant="primary" onClick={() => setShowDetailsModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      <style jsx>{`
        .assigned-tasks-table {
          background: var(--card-bg);
          border-radius: var(--border-radius);
          overflow: hidden;
          box-shadow: var(--shadow);
        }

        .table-header {
          background: rgba(var(--primary-btn-bg), 0.1);
          border-bottom: 2px solid var(--input-border);
        }

        .task-row td {
          padding: 1rem;
          vertical-align: middle;
          border-color: var(--input-border);
        }

        .task-title {
          color: var(--text-color);
          margin-bottom: 0.5rem;
        }

        .task-poster {
          font-size: 0.8rem;
        }

        .allocated-credits {
          font-size: 1.3rem;
        }

        .urgency-badge {
          font-size: 0.75rem;
        }

        .status-badge {
          font-size: 0.8rem;
          padding: 0.5rem 0.75rem;
        }

        .status-icon {
          margin-right: 0.3rem;
        }

        .action-btn,
        .download-btn,
        .view-details-btn {
          border-radius: 8px;
          padding: 0.4rem 0.8rem;
          font-size: 0.875rem;
          transition: all 0.3s ease;
        }

        .action-btn:hover,
        .download-btn:hover,
        .view-details-btn:hover {
          transform: translateY(-1px);
        }

        .btn-icon {
          margin-right: 0.3rem;
        }

        .submit-section {
          background: rgba(var(--primary-btn-bg), 0.05) !important;
          border: 1px solid var(--input-border);
        }

        .file-input {
          border-radius: 6px;
        }

        /* Mobile Styles */
        .task-card {
          background: var(--card-bg);
          border: 1px solid var(--input-border);
          border-radius: var(--border-radius);
          box-shadow: var(--shadow);
        }

        .task-title-mobile {
          color: var(--text-color);
          font-size: 1.1rem;
          line-height: 1.3;
        }

        .task-detail-item {
          margin-bottom: 0.5rem;
        }

        .detail-label {
          font-size: 0.75rem;
          color: var(--muted-text-color);
          text-transform: uppercase;
          letter-spacing: 0.5px;
          font-weight: 600;
        }

        .detail-value {
          font-size: 0.95rem;
          color: var(--text-color);
        }

        /* Modal Styles */
        .task-details-modal .modal-content {
          border: none;
          border-radius: var(--border-radius);
          box-shadow: var(--shadow-hover);
        }

        .modal-header-custom {
          background: rgba(var(--primary-btn-bg), 0.05);
          border-bottom: 1px solid var(--input-border);
        }

        .modal-title-icon {
          margin-right: 0.5rem;
        }

        .detail-item {
          margin-bottom: 1rem;
        }

        .detail-item .detail-label {
          font-weight: 600;
          color: var(--text-color);
          margin-bottom: 0.25rem;
        }

        .detail-item .detail-value {
          color: var(--text-color);
          font-size: 1rem;
        }

        .description-text {
          line-height: 1.6;
          background: rgba(0, 0, 0, 0.02);
          padding: 1rem;
          border-radius: 8px;
          border: 1px solid var(--input-border);
        }

        .modal-footer-custom {
          border-top: 1px solid var(--input-border);
          background: var(--bg-color);
        }

        .empty-state-card {
          background: var(--card-bg);
          border: 2px dashed var(--input-border);
          box-shadow: none;
        }

        .empty-state-icon {
          font-size: 4rem;
          opacity: 0.5;
        }
      `}</style>
    </>
  );
}
