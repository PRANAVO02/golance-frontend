import { useState, useEffect } from "react";
import {
  Button,
  Modal,
  Form,
  Card,
  Badge,
  Row,
  Col,
  Alert,
} from "react-bootstrap";
import { ENDPOINTS } from "../api/endpoints";

export default function TasksPostedByMe({
  tasks,
  setTasks,
  headers,
  fetchTasks,
}) {
  const [showEditModal, setShowEditModal] = useState(false);
  const [editTask, setEditTask] = useState(null);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTaskId, setDeleteTaskId] = useState(null);

  const [selectedTaskBids, setSelectedTaskBids] = useState([]);
  const [showBidsModal, setShowBidsModal] = useState(false);

  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewTask, setReviewTask] = useState(null);

  const [showRatingModal, setShowRatingModal] = useState(false);
  const [givenRating, setGivenRating] = useState(0);
  const [ratingTaskId, setRatingTaskId] = useState(null);

  const [loadingStates, setLoadingStates] = useState({});
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // Message states
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [showMessage, setShowMessage] = useState(false);

  // Safe localStorage access
  const safeLocalStorageGet = (key) => {
    try {
      if (typeof localStorage !== "undefined") {
        return localStorage.getItem(key);
      }
    } catch (e) {
      console.warn("localStorage is not available.");
    }
    return null;
  };

  const safeLocalStorageSet = (key, value) => {
    try {
      if (typeof localStorage !== "undefined") {
        localStorage.setItem(key, value);
      }
    } catch (e) {
      console.warn("localStorage is not available.");
    }
  };

  const token = safeLocalStorageGet("token");
  const userId = JSON.parse(safeLocalStorageGet("user") || "{}")?.id;
  const [theme] = useState(() => safeLocalStorageGet("theme") || "light");

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.setAttribute("data-theme", theme);
    }
  }, [theme]);

  // Auto-hide message after 5 seconds
  useEffect(() => {
    if (showMessage) {
      const timer = setTimeout(() => {
        setShowMessage(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [showMessage]);

  // Set loading state
  const setLoading = (taskId, isLoading) => {
    setLoadingStates((prev) => ({ ...prev, [taskId]: isLoading }));
  };

  // Status configuration
  const getStatusConfig = (status) => {
    const configs = {
      OPEN: { variant: "success", icon: "🔓", label: "Open" },
      ALLOCATED: { variant: "info", icon: "👤", label: "Assigned" },
      IN_PROGRESS: { variant: "warning", icon: "🚀", label: "In Progress" },
      PENDING: { variant: "primary", icon: "⏳", label: "Under Review" },
      COMPLETED: { variant: "secondary", icon: "✅", label: "Completed" },
      CANCELLED: { variant: "danger", icon: "❌", label: "Cancelled" },
    };
    return configs[status] || { variant: "light", icon: "📝", label: status };
  };

  // -------- View Profile --------
  const handleViewProfile = async (bidderId) => {
    try {
      const res = await fetch(`${ENDPOINTS.USERS(bidderId)}`, { headers });
      if (!res.ok) throw new Error("Failed to fetch user details");
      const data = await res.json();
      setSelectedUser(data);
      setShowProfileModal(true);
    } catch (err) {
      console.error(err);
      showAlert("Could not load user details", "danger");
    }
  };

  // -------- Show Alert --------
  const showAlert = (msg, type) => {
    setMessage(msg);
    setMessageType(type);
    setShowMessage(true);
  };

  // -------- Edit Task --------
  const handleEditClick = (task) => {
    setEditTask({ ...task });
    setShowEditModal(true);
  };

  const handleEditChange = (e) =>
    setEditTask({ ...editTask, [e.target.name]: e.target.value });

  const saveEdit = async () => {
    setLoading(editTask.id, true);
    try {
      const res = await fetch(`${ENDPOINTS.TASKS}/${editTask.id}`, {
        method: "PUT",
        headers,
        body: JSON.stringify(editTask),
      });
      if (res.ok) {
        setShowEditModal(false);
        fetchTasks();
        showAlert("Task updated successfully!", "success");
      }
    } catch (err) {
      console.error(err);
      showAlert("Failed to update task", "danger");
    } finally {
      setLoading(editTask.id, false);
    }
  };

  // -------- Download Files --------
  const handleDownload = async (task) => {
    if (!task.filePath) {
      showAlert("No file uploaded by task poster", "warning");
      return;
    }

    try {
      const response = await fetch(`${ENDPOINTS.TASK_DOWNLOAD(task.id)}`, {
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
    } catch (err) {
      console.error(err);
      showAlert("❌ Could not download task file", "danger");
    }
  };

  const handleFreelancerDownload = async (task) => {
    if (!task.freelancerFilePath) {
      showAlert("No file uploaded by freelancer", "warning");
      return;
    }

    try {
      const response = await fetch(
        `${ENDPOINTS.TASKS}/download/freelancer/${task.id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!response.ok) throw new Error("Failed to download file");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const originalFileName = task.freelancerFilePath
        .split("_")
        .slice(1)
        .join("_");
      const safeTitle = task.title.replace(/\s+/g, "_");
      const finalFileName = `${safeTitle}_${originalFileName}`;

      const link = document.createElement("a");
      link.href = url;
      link.download = finalFileName;
      link.click();

      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error(error);
      showAlert("❌ Could not download freelancer file", "danger");
    }
  };

  // -------- Delete Task --------
  const handleDeleteClick = (taskId) => {
    setDeleteTaskId(taskId);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    setLoading(deleteTaskId, true);
    try {
      const res = await fetch(`${ENDPOINTS.TASKS}/${deleteTaskId}`, {
        method: "DELETE",
        headers,
      });
      if (res.ok) {
        setShowDeleteModal(false);
        fetchTasks();
        showAlert("Task deleted successfully!", "success");
      }
    } catch (err) {
      console.error(err);
      showAlert("Failed to delete task", "danger");
    } finally {
      setLoading(deleteTaskId, false);
    }
  };

  // -------- View Bids --------
  const handleViewBids = async (taskId) => {
    try {
      const res = await fetch(ENDPOINTS.BIDS_BY_TASK(taskId), { headers });
      const data = await res.json();
      setSelectedTaskBids(data.map((b) => ({ ...b, taskId })));
      setShowBidsModal(true);
    } catch (err) {
      console.error(err);
      showAlert("Failed to fetch bids", "danger");
    }
  };

  // -------- Allocate Bid --------
  const handleSelectBid = async (bid) => {
    setLoading(bid.taskId, true);
    try {
      const res = await fetch(ENDPOINTS.TASK_ALLOCATE(bid.taskId, bid.id), {
        method: "POST",
        headers,
      });

      if (res.ok) {
        const updatedTask = await res.json();
        setTasks((prevTasks) =>
          prevTasks.map((t) => (t.id === updatedTask.id ? updatedTask : t))
        );
        setShowBidsModal(false);
        fetchTasks();
        showAlert(
          `Bid allocated to ${bid.bidderName} successfully!`,
          "success"
        );
      } else {
        const err = await res.json();
        showAlert(
          "Failed to allocate bid: " + (err.message || "Unknown error"),
          "danger"
        );
      }
    } catch (err) {
      console.error("Error allocating bid:", err);
      showAlert("Error allocating bid", "danger");
    } finally {
      setLoading(bid.taskId, false);
    }
  };

  // -------- Review Work --------
  const handleReviewClick = (task) => {
    setReviewTask(task);
    setShowReviewModal(true);
  };

  // -------- Update Status with Automatic Credit Transfer --------
  const updateStatus = async (taskId, newStatus) => {
    setLoading(taskId, true);
    try {
      const res = await fetch(`${ENDPOINTS.TASKS}/${taskId}/status`, {
        method: "PUT",
        headers,
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        if (newStatus === "COMPLETED") {
          const task = tasks.find((t) => t.id === taskId);
          const assignedUserId = task.assignedUserId || task.assignedUser?.id;
          const transferAmount = task.allocatedCredits ?? 0;

          // 🚀 Automatically transfer credits
          const transferRes = await fetch(ENDPOINTS.WALLET_TRANSFER, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              fromUserId: userId,
              toUserId: assignedUserId,
              amount: parseInt(transferAmount),
            }),
          });

          if (transferRes.ok) {
            showAlert(
              `✅ Task completed successfully! ${transferAmount} credits were automatically transferred to the freelancer.`,
              "success"
            );
            setShowReviewModal(false);
            setRatingTaskId(taskId);
            setTimeout(() => {
              setShowRatingModal(true);
            }, 1000);
          } else {
            const err = await transferRes.json();
            showAlert(
              `⚠️ Task marked as completed, but credit transfer failed: ${
                err.message || "Please transfer credits manually"
              }`,
              "warning"
            );
            setShowReviewModal(false);
          }
        } else {
          showAlert(`📝 Task status updated to ${newStatus}.`, "info");
          setShowReviewModal(false);
        }

        fetchTasks();
      } else {
        const err = await res.json();
        showAlert(
          `❌ Failed to update status: ${err.message || "Unknown error"}`,
          "danger"
        );
      }
    } catch (err) {
      console.error(err);
      showAlert("💥 Network error updating task status.", "danger");
    } finally {
      setLoading(taskId, false);
    }
  };

  // -------- Submit Rating --------
  const submitRating = async () => {
    if (givenRating < 1 || givenRating > 5) {
      showAlert("Please select a rating between 1 and 5", "warning");
      return;
    }
    try {
      const userRatingRes = await fetch(
        `${ENDPOINTS.USERS(transferToUserId)}/rating`,
        {
          method: "PUT",
          headers,
          body: JSON.stringify({ rating: givenRating }),
        }
      );

      const taskRatingRes = await fetch(
        `${ENDPOINTS.TASKS}/${ratingTaskId}/rate`,
        {
          method: "PUT",
          headers,
          body: JSON.stringify({ rating: givenRating }),
        }
      );

      if (userRatingRes.ok && taskRatingRes.ok) {
        setShowRatingModal(false);
        setTasks((prevTasks) =>
          prevTasks.map((t) =>
            t.id === ratingTaskId ? { ...t, rating: givenRating } : t
          )
        );
        setRatingTaskId(null);
        setGivenRating(0);
        showAlert("Rating submitted successfully!", "success");
      } else {
        showAlert(
          "Failed to submit rating (one or both endpoints failed)",
          "warning"
        );
      }
    } catch (err) {
      console.error(err);
      showAlert("Error submitting rating", "danger");
    }
  };

  // -------- Message User --------
  const handleMessageUser = async (userId) => {
    const currentUser = JSON.parse(safeLocalStorageGet("user") || "{}");
    if (!currentUser) {
      showAlert("You must be logged in to message.", "warning");
      return;
    }

    try {
      await fetch("http://localhost:8080/api/messages/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          senderId: currentUser.id,
          receiverId: userId,
        }),
      });

      safeLocalStorageSet("chatWithUserId", userId);

      if (typeof window !== "undefined") {
        window.location.href = "/messages";
      }
    } catch (err) {
      console.error("Failed to start chat:", err);
      showAlert("Unable to start chat right now.", "danger");
    }
  };

  if (!tasks || tasks.length === 0) {
    return (
      <Card className="border-0 empty-state-card">
        <Card.Body className="text-center py-5">
          <div className="empty-state-icon mb-3">📝</div>
          <h5 className="text-muted mb-3">No Tasks Posted Yet</h5>
          <p className="text-muted mb-4">
            You haven't posted any tasks yet. Create your first task to get
            started!
          </p>
          <Button
            variant="primary"
            onClick={() => (window.location.href = "/post-task")}
            className="px-4"
          >
            Post Your First Task
          </Button>
        </Card.Body>
      </Card>
    );
  }

  return (
    <>
      {/* Message Alert */}
      {showMessage && (
        <Alert
          variant={messageType}
          className="custom-alert"
          dismissible
          onClose={() => setShowMessage(false)}
        >
          <div className="d-flex align-items-center">
            <span className="alert-icon me-2">
              {messageType === "success" && "✅"}
              {messageType === "danger" && "❌"}
              {messageType === "warning" && "⚠️"}
              {messageType === "info" && "📝"}
            </span>
            <span>{message}</span>
          </div>
        </Alert>
      )}

      {/* Desktop Table View */}
      <div className="d-none d-lg-block">
        <div className="table-responsive">
          <table className="table table-hover tasks-posted-table">
            <thead className="table-header">
              <tr>
                <th>Task Details</th>
                <th>Credits</th>
                <th>Deadline</th>
                <th>Status</th>
                <th>Files</th>
                <th>Bids & Assignment</th>
                <th>Review</th>
                <th>Rating</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((task) => {
                const statusConfig = getStatusConfig(task.status);
                return (
                  <tr key={task.id} className="task-row">
                    <td>
                      <div className="task-info">
                        <div className="task-title fw-bold">{task.title}</div>
                        <div className="task-description text-muted small">
                          {task.description.length > 100
                            ? `${task.description.substring(0, 100)}...`
                            : task.description}
                        </div>
                        <div className="task-category mt-1">
                          <Badge
                            bg="outline-secondary"
                            className="category-badge"
                          >
                            {task.category}
                          </Badge>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="credits-info text-center">
                        <div className="offered-credits text-primary fw-bold">
                          {task.creditsOffered}
                        </div>
                        {task.allocatedCredits && (
                          <div className="allocated-credits text-success small">
                            Accepted: {task.allocatedCredits}
                          </div>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="deadline-info">
                        <div className="deadline-date small">
                          {task.deadline}
                        </div>
                      </div>
                    </td>
                    <td>
                      <Badge bg={statusConfig.variant} className="status-badge">
                        <span className="status-icon">{statusConfig.icon}</span>
                        {statusConfig.label}
                      </Badge>
                    </td>
                    <td>
                      <div className="file-actions">
                        {task.filePath ? (
                          <Button
                            variant="outline-success"
                            size="sm"
                            onClick={() => handleDownload(task)}
                            className="download-btn"
                          >
                            <span className="btn-icon">📥</span>
                            Task File
                          </Button>
                        ) : (
                          <span className="text-muted small">No File</span>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="bids-assignment">
                        {task.status === "OPEN" ? (
                          <Button
                            variant="info"
                            size="sm"
                            onClick={() => handleViewBids(task.id)}
                            className="view-bids-btn"
                          >
                            <span className="btn-icon">👁️</span>
                            View Bids
                          </Button>
                        ) : task.assignedUserName ? (
                          <div className="assignment-info">
                            <div className="assigned-to fw-bold">
                              {task.assignedUserName}
                            </div>
                            <div className="credits-info small text-muted">
                              {task.allocatedCredits
                                ? `Accepted: ${task.allocatedCredits} credits`
                                : `Offered: ${task.creditsOffered} credits`}
                            </div>
                            <Button
                              variant="outline-success"
                              size="sm"
                              onClick={() =>
                                handleMessageUser(
                                  task.assignedUserId || task.assignedUser?.id
                                )
                              }
                              className="mt-1 message-btn"
                            >
                              <span className="btn-icon">💬</span>
                              Message
                            </Button>
                          </div>
                        ) : (
                          <span className="text-muted">—</span>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="review-actions">
                        {task.status === "PENDING" ? (
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleReviewClick(task)}
                            className="review-btn"
                          >
                            <span className="btn-icon">🔍</span>
                            Review
                          </Button>
                        ) : task.status === "COMPLETED" &&
                          task.freelancerFilePath ? (
                          <Button
                            variant="success"
                            size="sm"
                            onClick={() => handleFreelancerDownload(task)}
                            className="download-btn"
                          >
                            <span className="btn-icon">📥</span>
                            Work File
                          </Button>
                        ) : (
                          <span className="text-muted">—</span>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="rating-section">
                        {task.status === "COMPLETED" ? (
                          task.rating ? (
                            <div className="rated-info text-center">
                              <div className="rating-stars text-warning">
                                {"⭐".repeat(task.rating)}
                              </div>
                              <div className="rating-text small text-muted">
                                Rated {task.rating}/5
                              </div>
                            </div>
                          ) : (
                            <Form.Select
                              size="sm"
                              onChange={async (e) => {
                                const newRating = parseInt(e.target.value);
                                if (newRating > 0) {
                                  try {
                                    const res = await fetch(
                                      `${ENDPOINTS.TASKS}/${task.id}/rate`,
                                      {
                                        method: "PUT",
                                        headers,
                                        body: JSON.stringify({
                                          rating: newRating,
                                        }),
                                      }
                                    );
                                    if (res.ok) {
                                      setTasks((prevTasks) =>
                                        prevTasks.map((t) =>
                                          t.id === task.id
                                            ? { ...t, rating: newRating }
                                            : t
                                        )
                                      );
                                      showAlert(
                                        "Rating submitted successfully!",
                                        "success"
                                      );
                                    } else {
                                      showAlert(
                                        "Error submitting rating",
                                        "danger"
                                      );
                                    }
                                  } catch (err) {
                                    console.error(err);
                                    showAlert(
                                      "Error submitting rating",
                                      "danger"
                                    );
                                  }
                                }
                              }}
                              className="rating-select"
                            >
                              <option value="0">Give Rating</option>
                              {[1, 2, 3, 4, 5].map((r) => (
                                <option key={r} value={r}>
                                  {r} ⭐
                                </option>
                              ))}
                            </Form.Select>
                          )
                        ) : (
                          <span className="text-muted">–</span>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="task-actions">
                        {task.status === "OPEN" ? (
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => handleDeleteClick(task.id)}
                            disabled={loadingStates[task.id]}
                            className="delete-btn"
                          >
                            {loadingStates[task.id] ? (
                              <span className="spinner-border spinner-border-sm" />
                            ) : (
                              <>
                                <span className="btn-icon">🗑️</span>
                                Delete
                              </>
                            )}
                          </Button>
                        ) : (
                          <span className="text-muted small delete-dsp">
                            Cannot Delete
                          </span>
                        )}
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
          {tasks.map((task) => {
            const statusConfig = getStatusConfig(task.status);
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

                  {/* Description */}
                  <div className="task-description-mobile text-muted small mb-3">
                    {task.description}
                  </div>

                  {/* Task Details */}
                  <Row className="g-2 mb-3">
                    <Col xs={6}>
                      <div className="task-detail-item">
                        <div className="detail-label">Credits Offered</div>
                        <div className="detail-value text-primary fw-bold">
                          {task.creditsOffered}
                        </div>
                      </div>
                    </Col>
                    <Col xs={6}>
                      <div className="task-detail-item">
                        <div className="detail-label">Accepted Credits</div>
                        <div className="detail-value text-success">
                          {task.allocatedCredits || "—"}
                        </div>
                      </div>
                    </Col>
                    <Col xs={12}>
                      <div className="task-detail-item">
                        <div className="detail-label">Deadline</div>
                        <div className="detail-value">{task.deadline}</div>
                      </div>
                    </Col>
                  </Row>

                  {/* File Downloads */}
                  <Row className="g-2 mb-3">
                    <Col xs={6}>
                      <div className="file-action-mobile">
                        <div className="detail-label">Task File</div>
                        {task.filePath ? (
                          <Button
                            variant="outline-success"
                            size="sm"
                            onClick={() => handleDownload(task)}
                            className="w-100 download-btn"
                          >
                            <span className="btn-icon">📥</span>
                            Download
                          </Button>
                        ) : (
                          <div className="text-muted small">No File</div>
                        )}
                      </div>
                    </Col>
                    <Col xs={6}>
                      <div className="file-action-mobile">
                        <div className="detail-label">Work File</div>
                        {task.freelancerFilePath ? (
                          <Button
                            variant="outline-success"
                            size="sm"
                            onClick={() => handleFreelancerDownload(task)}
                            className="w-100 download-btn"
                          >
                            <span className="btn-icon">📥</span>
                            Download
                          </Button>
                        ) : (
                          <div className="text-muted small">No File</div>
                        )}
                      </div>
                    </Col>
                  </Row>

                  {/* Actions */}
                  <div className="actions-mobile">
                    {task.status === "OPEN" && (
                      <Button
                        variant="info"
                        size="sm"
                        onClick={() => handleViewBids(task.id)}
                        className="w-100 mb-2 view-bids-btn"
                      >
                        <span className="btn-icon">👁️</span>
                        View Bids ({task.bidCount || 0})
                      </Button>
                    )}

                    {task.assignedUserName && (
                      <div className="assignment-info-mobile mb-2 p-2 bg-light rounded">
                        <div className="text-center">
                          <div className="fw-bold">Assigned to:</div>
                          <div>{task.assignedUserName}</div>
                          <Button
                            variant="outline-success"
                            size="sm"
                            onClick={() =>
                              handleMessageUser(
                                task.assignedUserId || task.assignedUser?.id
                              )
                            }
                            className="mt-1 message-btn"
                          >
                            <span className="btn-icon">💬</span>
                            Message
                          </Button>
                        </div>
                      </div>
                    )}

                    {task.status === "PENDING" && (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleReviewClick(task)}
                        className="w-100 mb-2 review-btn"
                      >
                        <span className="btn-icon">🔍</span>
                        Review Work
                      </Button>
                    )}

                    {/* Rating for Mobile */}
                    {task.status === "COMPLETED" && (
                      <div className="rating-mobile mb-2">
                        {task.rating ? (
                          <div className="rated-info text-center">
                            <div className="rating-stars text-warning">
                              {"⭐".repeat(task.rating)}
                            </div>
                            <div className="rating-text small text-muted">
                              You rated {task.rating}/5
                            </div>
                          </div>
                        ) : (
                          <Form.Select
                            size="sm"
                            onChange={async (e) => {
                              const newRating = parseInt(e.target.value);
                              if (newRating > 0) {
                                try {
                                  const res = await fetch(
                                    `${ENDPOINTS.TASKS}/${task.id}/rate`,
                                    {
                                      method: "PUT",
                                      headers,
                                      body: JSON.stringify({
                                        rating: newRating,
                                      }),
                                    }
                                  );
                                  if (res.ok) {
                                    setTasks((prevTasks) =>
                                      prevTasks.map((t) =>
                                        t.id === task.id
                                          ? { ...t, rating: newRating }
                                          : t
                                      )
                                    );
                                    showAlert(
                                      "Rating submitted successfully!",
                                      "success"
                                    );
                                  }
                                } catch (err) {
                                  console.error(err);
                                  showAlert(
                                    "Error submitting rating",
                                    "danger"
                                  );
                                }
                              }
                            }}
                            className="rating-select"
                          >
                            <option value="0">Give Rating</option>
                            {[1, 2, 3, 4, 5].map((r) => (
                              <option key={r} value={r}>
                                {r} ⭐
                              </option>
                            ))}
                          </Form.Select>
                        )}
                      </div>
                    )}

                    {task.status === "OPEN" && (
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => handleDeleteClick(task.id)}
                        disabled={loadingStates[task.id]}
                        className="w-100 delete-btn"
                      >
                        {loadingStates[task.id] ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" />
                            Deleting...
                          </>
                        ) : (
                          <>
                            <span className="btn-icon">🗑️</span>
                            Delete Task
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </Card.Body>
              </Card>
            );
          })}
        </div>
      </div>

      {/* ----------------- Enhanced Modals ----------------- */}

      {/* Review Work Modal */}
      <Modal
        show={showReviewModal}
        onHide={() => setShowReviewModal(false)}
        centered
        className="review-modal"
      >
        <Modal.Header closeButton className="modal-header-custom">
          <Modal.Title>
            <span className="modal-title-icon">🔍</span>
            Review Submitted Work
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {reviewTask && (
            <div className="review-content">
              <div className="task-info-review mb-4">
                <h5 className="task-title-review">{reviewTask.title}</h5>
                <p className="task-description-review text-muted">
                  {reviewTask.description}
                </p>
                <div className="credit-transfer-info bg-light p-3 rounded mt-3">
                  <div className="d-flex align-items-center justify-content-between">
                    <div>
                      <strong>Credit Transfer:</strong>
                      <div className="text-success fw-bold">
                        {reviewTask.allocatedCredits ||
                          reviewTask.creditsOffered}{" "}
                        credits
                      </div>
                      <small className="text-muted">
                        Will be automatically transferred to{" "}
                        {reviewTask.assignedUserName}
                      </small>
                    </div>
                    <div className="transfer-badge">
                      <Badge bg="success" className="auto-transfer-badge">
                        <span className="btn-icon">⚡</span>
                        Auto-Transfer
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              <div className="file-section mb-4">
                <h6 className="section-title">Submitted Work</h6>
                {reviewTask.freelancerFilePath ? (
                  <Button
                    variant="outline-success"
                    onClick={() => handleFreelancerDownload(reviewTask)}
                    className="download-btn"
                  >
                    <span className="btn-icon">📥</span>
                    Download Freelancer's Work
                  </Button>
                ) : (
                  <div className="text-muted text-center py-3 bg-light rounded">
                    <span className="btn-icon">📄</span>
                    No file submitted by freelancer
                  </div>
                )}
              </div>

              <div className="review-actions-section">
                <h6 className="section-title">
                  Approve Work & Transfer Credits
                </h6>
                <div className="d-grid gap-2">
                  <Button
                    variant="success"
                    onClick={() => updateStatus(reviewTask.id, "COMPLETED")}
                    disabled={loadingStates[reviewTask.id]}
                    className="approve-transfer-btn"
                  >
                    {loadingStates[reviewTask.id] ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <span className="btn-icon">✅</span>
                        Approve & Transfer{" "}
                        {reviewTask.allocatedCredits ||
                          reviewTask.creditsOffered}{" "}
                        Credits
                      </>
                    )}
                  </Button>
                  <Button
                    variant="warning"
                    onClick={() => updateStatus(reviewTask.id, "IN_PROGRESS")}
                    disabled={loadingStates[reviewTask.id]}
                    className="revision-btn"
                  >
                    <span className="btn-icon">🔄</span>
                    Request Revision (No Credit Transfer)
                  </Button>
                </div>
              </div>
            </div>
          )}
        </Modal.Body>
      </Modal>

      {/* Delete Task Modal */}
      <Modal
        show={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
        centered
        className="delete-modal"
      >
        <Modal.Header closeButton className="modal-header-custom">
          <Modal.Title>
            <span className="modal-title-icon">⚠️</span>
            Confirm Deletion
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center">
          <div className="delete-warning-icon mb-3">🗑️</div>
          <p>Are you sure you want to delete this task?</p>
          <p className="text-muted small">This action cannot be undone.</p>
        </Modal.Body>
        <Modal.Footer className="modal-footer-custom">
          <Button
            variant="outline-secondary"
            onClick={() => setShowDeleteModal(false)}
            className="cancel-btn"
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={confirmDelete}
            disabled={loadingStates[deleteTaskId]}
            className="confirm-delete-btn"
          >
            {loadingStates[deleteTaskId] ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" />
                Deleting...
              </>
            ) : (
              <>
                <span className="btn-icon">🗑️</span>
                Delete Task
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Bids Modal */}
      <Modal
        show={showBidsModal}
        onHide={() => setShowBidsModal(false)}
        size="lg"
        centered
        className="bids-modal"
      >
        <Modal.Header closeButton className="modal-header-custom">
          <Modal.Title>
            <span className="modal-title-icon">💼</span>
            Bids for Task
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedTaskBids.length > 0 ? (
            <div className="bids-container">
              {selectedTaskBids.map((bid) => (
                <Card key={bid.id} className="bid-card mb-3">
                  <Card.Body>
                    <Row className="g-3">
                      <Col md={3}>
                        <div className="bidder-info text-center">
                          <div className="bidder-name fw-bold">
                            {bid.bidderName}
                          </div>
                          <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={() => handleViewProfile(bid.bidderId)}
                            className="mt-1 profile-btn"
                          >
                            <span className="btn-icon">👤</span>
                            Profile
                          </Button>
                        </div>
                      </Col>
                      <Col md={3}>
                        <div className="bid-details text-center">
                          <div className="bid-credits text-success fw-bold h5">
                            {bid.credits}
                          </div>
                          <div className="credits-label small text-muted">
                            Credits
                          </div>
                        </div>
                      </Col>
                      <Col md={3}>
                        <div className="timeline-details text-center">
                          <div className="estimated-days fw-bold">
                            {bid.estimatedDays} days
                          </div>
                          <div className="timeline-label small text-muted">
                            Estimate
                          </div>
                        </div>
                      </Col>
                      <Col md={3}>
                        <div className="bid-actions text-center">
                          <div className="d-grid gap-2">
                            <Button
                              variant="outline-success"
                              size="sm"
                              onClick={() => handleMessageUser(bid.bidderId)}
                              className="message-btn"
                            >
                              <span className="btn-icon">💬</span>
                              Message
                            </Button>
                            {tasks.find((t) => t.id === bid.taskId)?.status ===
                            "ALLOCATED" ? (
                              <Badge bg="success" className="assigned-badge">
                                ✅ Assigned
                              </Badge>
                            ) : (
                              <Button
                                variant="success"
                                size="sm"
                                onClick={() => handleSelectBid(bid)}
                                disabled={loadingStates[bid.taskId]}
                                className="select-btn"
                              >
                                {loadingStates[bid.taskId] ? (
                                  <span className="spinner-border spinner-border-sm" />
                                ) : (
                                  <>
                                    <span className="btn-icon">✅</span>
                                    Select
                                  </>
                                )}
                              </Button>
                            )}
                          </div>
                        </div>
                      </Col>
                    </Row>
                    {bid.description && (
                      <div className="bid-description mt-3 p-2 bg-light rounded">
                        <strong>Description:</strong> {bid.description}
                      </div>
                    )}
                  </Card.Body>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-4">
              <div className="empty-bids-icon mb-3">💼</div>
              <h5 className="text-muted">No Bids Yet</h5>
              <p className="text-muted">
                No one has placed bids on this task yet.
              </p>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer className="modal-footer-custom">
          <Button variant="secondary" onClick={() => setShowBidsModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      {/* View Profile Modal */}
      <Modal
        show={showProfileModal}
        onHide={() => setShowProfileModal(false)}
        centered
        className="profile-modal"
      >
        <Modal.Header closeButton className="modal-header-custom">
          <Modal.Title>
            <span className="modal-title-icon">👤</span>
            User Profile
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedUser ? (
            <div className="profile-details">
              <Row className="g-3">
                <Col md={6}>
                  <div className="profile-item">
                    <label className="profile-label">Username</label>
                    <div className="profile-value">{selectedUser.username}</div>
                  </div>
                </Col>
                <Col md={6}>
                  <div className="profile-item">
                    <label className="profile-label">Email</label>
                    <div className="profile-value">{selectedUser.email}</div>
                  </div>
                </Col>
                <Col md={6}>
                  <div className="profile-item">
                    <label className="profile-label">Role</label>
                    <div className="profile-value">
                      <Badge bg="primary">{selectedUser.role}</Badge>
                    </div>
                  </div>
                </Col>
                <Col md={6}>
                  <div className="profile-item">
                    <label className="profile-label">Department</label>
                    <div className="profile-value">
                      {selectedUser.department || "N/A"}
                    </div>
                  </div>
                </Col>
                <Col md={6}>
                  <div className="profile-item">
                    <label className="profile-label">Studying Year</label>
                    <div className="profile-value">
                      {selectedUser.studyingYear || "N/A"}
                    </div>
                  </div>
                </Col>
                <Col md={6}>
                  <div className="profile-item">
                    <label className="profile-label">Skills</label>
                    <div className="profile-value">
                      {selectedUser.skills || "N/A"}
                    </div>
                  </div>
                </Col>
                <Col xs={12}>
                  <div className="profile-item">
                    <label className="profile-label">Rating</label>
                    <div className="profile-value">
                      {selectedUser.rating > 0 ? (
                        <div className="rating-display">
                          <span className="rating-stars text-warning">
                            {"⭐".repeat(Math.round(selectedUser.rating))}
                          </span>
                          <span className="rating-text ms-2">
                            {selectedUser.rating.toFixed(1)} (
                            {selectedUser.ratingCount} ratings)
                          </span>
                        </div>
                      ) : (
                        "Not rated yet"
                      )}
                    </div>
                  </div>
                </Col>
              </Row>
            </div>
          ) : (
            <div className="text-center text-muted py-4">
              Loading user details...
            </div>
          )}
        </Modal.Body>
        <Modal.Footer className="modal-footer-custom">
          <Button
            variant="secondary"
            onClick={() => setShowProfileModal(false)}
          >
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Rating Modal */}
      <Modal
        show={showRatingModal}
        onHide={() => setShowRatingModal(false)}
        centered
        className="rating-modal"
      >
        <Modal.Header closeButton className="modal-header-custom">
          <Modal.Title>
            <span className="modal-title-icon">⭐</span>
            Rate Freelancer
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center">
          <div className="rating-instruction mb-4">
            <p>How would you rate the freelancer's work?</p>
          </div>
          <div className="rating-stars-large mb-4">
            {[1, 2, 3, 4, 5].map((star) => (
              <Button
                key={star}
                variant={givenRating >= star ? "warning" : "outline-warning"}
                className="rating-star-btn"
                onClick={() => setGivenRating(star)}
              >
                ⭐
              </Button>
            ))}
          </div>
          <Form.Select
            value={givenRating}
            onChange={(e) => setGivenRating(parseInt(e.target.value))}
            className="rating-select-large"
          >
            <option value="0">Select a rating...</option>
            {[1, 2, 3, 4, 5].map((r) => (
              <option key={r} value={r}>
                {r} {r === 1 ? "star" : "stars"}
              </option>
            ))}
          </Form.Select>
          {givenRating > 0 && (
            <div className="selected-rating mt-3">
              <Badge bg="warning" className="selected-rating-badge">
                Selected: {givenRating} ⭐
              </Badge>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer className="modal-footer-custom">
          <Button
            variant="outline-secondary"
            onClick={() => setShowRatingModal(false)}
          >
            Cancel
          </Button>
          <Button
            variant="warning"
            onClick={submitRating}
            disabled={givenRating === 0}
            className="submit-rating-btn"
          >
            <span className="btn-icon">⭐</span>
            Submit Rating
          </Button>
        </Modal.Footer>
      </Modal>

      <style jsx>{`
        .tasks-posted-table {
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
          margin-bottom: 0.25rem;
        }

        .task-description {
          line-height: 1.4;
        }

        .category-badge {
          background: transparent !important;
          border: 1px solid var(--muted-text-color) !important;
          color: var(--muted-text-color) !important;
          font-size: 0.7rem !important;
        }

        .offered-credits {
          font-size: 1.1rem;
        }

        .allocated-credits {
          font-size: 0.8rem;
        }

        .status-badge {
          font-size: 0.75rem !important;
          padding: 0.5rem 0.75rem !important;
        }

        .status-icon {
          margin-right: 0.3rem;
        }

        .download-btn,
        .view-bids-btn,
        .review-btn,
        .message-btn,
        .delete-btn {
          border-radius: 8px !important;
          padding: 0.4rem 0.8rem !important;
          font-size: 0.875rem !important;
          transition: all 0.3s ease !important;
        }

        .btn-icon {
          margin-right: 0.3rem;
        }

        .delete-dsp {
          font-size: 0.8rem;
          color: var(--muted-text-color);
        }

        .rating-stars {
          font-size: 1.1rem;
        }

        .rating-select {
          border-radius: 6px;
        }

        /* Mobile Styles */
        .task-card {
          background: var(--card-bg) !important;
          border: 1px solid var(--input-border) !important;
          border-radius: var(--border-radius) !important;
          box-shadow: var(--shadow) !important;
        }

        .task-title-mobile {
          color: var(--text-color);
          font-size: 1.1rem;
          line-height: 1.3;
        }

        .task-description-mobile {
          line-height: 1.4;
        }

        .task-detail-item {
          margin-bottom: 0.75rem;
        }

        .detail-label {
          font-size: 0.75rem;
          color: var(--muted-text-color);
          text-transform: uppercase;
          letter-spacing: 0.5px;
          font-weight: 600;
          margin-bottom: 0.25rem;
        }

        .detail-value {
          font-size: 0.95rem;
          color: var(--text-color);
          font-weight: 500;
        }

        /* Modal Styles */
        .modal-header-custom {
          background: rgba(var(--primary-btn-bg), 0.05);
          border-bottom: 1px solid var(--input-border);
        }

        .modal-title-icon {
          margin-right: 0.5rem;
        }

        .modal-footer-custom {
          border-top: 1px solid var(--input-border);
          background: var(--bg-color);
        }

        .empty-state-card {
          background: var(--card-bg);
          border: 2px dashed var(--input-border) !important;
          box-shadow: none !important;
        }

        .empty-state-icon {
          font-size: 4rem;
          opacity: 0.5;
        }

        /* Review Modal */
        .section-title {
          font-size: 0.9rem;
          font-weight: 600;
          color: var(--text-color);
          margin-bottom: 0.5rem;
        }

        .accept-btn,
        .revision-btn {
          border-radius: 8px;
          padding: 0.75rem;
          font-weight: 500;
        }

        /* Alert Styles */
        .custom-alert {
          border-radius: var(--border-radius);
          border: none;
          margin-bottom: 1rem;
        }

        .alert-success {
          background: rgba(40, 167, 69, 0.1);
          color: #155724;
          border-left: 4px solid #28a745;
        }

        .alert-danger {
          background: rgba(220, 53, 69, 0.1);
          color: #721c24;
          border-left: 4px solid #dc3545;
        }

        .alert-warning {
          background: rgba(255, 193, 7, 0.1);
          color: #856404;
          border-left: 4px solid #ffc107;
        }

        .alert-info {
          background: rgba(23, 162, 184, 0.1);
          color: #0c5460;
          border-left: 4px solid #17a2b8;
        }

        .alert-icon {
          font-size: 1.2rem;
        }

        /* Credit Transfer Info */
        .credit-transfer-info {
          background: rgba(40, 167, 69, 0.1) !important;
          border: 1px solid rgba(40, 167, 69, 0.3) !important;
          border-radius: var(--border-radius) !important;
        }

        .auto-transfer-badge {
          font-size: 0.8rem !important;
          padding: 0.5rem 0.75rem !important;
        }

        .approve-transfer-btn {
          background: linear-gradient(135deg, #28a745, #20c997) !important;
          border: none !important;
          border-radius: 8px !important;
          padding: 0.75rem !important;
          font-weight: 600 !important;
          transition: all 0.3s ease !important;
        }

        .approve-transfer-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 4px 15px rgba(40, 167, 69, 0.4);
        }

        .revision-btn {
          border-radius: 8px !important;
          padding: 0.75rem !important;
          font-weight: 500 !important;
        }

        /* Delete Modal */
        .delete-warning-icon {
          font-size: 4rem;
          opacity: 0.7;
        }

        .confirm-delete-btn {
          border-radius: 8px !important;
          padding: 0.5rem 1.5rem !important;
          font-weight: 500 !important;
        }

        .confirm-delete-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(220, 53, 69, 0.3);
        }

        /* Bids Modal */
        .bid-card {
          background: var(--card-bg) !important;
          border: 1px solid var(--input-border) !important;
          border-radius: var(--border-radius) !important;
          box-shadow: var(--shadow) !important;
        }

        .bid-credits {
          font-size: 1.5rem;
        }

        .profile-btn,
        .select-btn {
          border-radius: 6px;
          font-size: 0.8rem;
        }

        /* Rating Modal */
        .rating-star-btn {
          font-size: 2rem;
          padding: 0.5rem;
          margin: 0 0.25rem;
          border-radius: 50%;
          width: 50px;
          height: 50px;
        }

        .rating-select-large {
          border-radius: 8px;
          padding: 0.75rem;
        }

        .selected-rating-badge {
          font-size: 1.1rem;
          padding: 0.5rem 1rem;
        }

        .submit-rating-btn {
          border-radius: 8px;
          padding: 0.5rem 1.5rem;
          font-weight: 500;
        }
      `}</style>
    </>
  );
}
