import { useState } from "react";
import { Button, Modal, Form } from "react-bootstrap";
import { ENDPOINTS } from "../api/endpoints";
import { useNavigate } from "react-router-dom";

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

  const [showCreditTransferModal, setShowCreditTransferModal] = useState(false);
  const [transferAmount, setTransferAmount] = useState(0);
  const [transferToUserId, setTransferToUserId] = useState(null);

  const [showRatingModal, setShowRatingModal] = useState(false);
  const [givenRating, setGivenRating] = useState(0);

  const token = localStorage.getItem("token");
  const userId = JSON.parse(localStorage.getItem("user"))?.id;

  const [showProfileModal, setShowProfileModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const handleViewProfile = async (bidderId) => {
    try {
      const res = await fetch(`${ENDPOINTS.USERS(bidderId)}`, { headers });
      if (!res.ok) throw new Error("Failed to fetch user details");
      const data = await res.json();
      setSelectedUser(data);
      setShowProfileModal(true);
    } catch (err) {
      console.error(err);
      alert("Could not load user details");
    }
  };

  // -------- Edit Task --------
  const handleEditClick = (task) => {
    setEditTask({ ...task });
    setShowEditModal(true);
  };

  const handleEditChange = (e) =>
    setEditTask({ ...editTask, [e.target.name]: e.target.value });

  const saveEdit = async () => {
    try {
      const res = await fetch(`${ENDPOINTS.TASKS}/${editTask.id}`, {
        method: "PUT",
        headers,
        body: JSON.stringify(editTask),
      });
      if (res.ok) {
        alert("Task updated successfully!");
        setShowEditModal(false);
        fetchTasks();
      }
    } catch (err) {
      console.error(err);
      alert("Failed to update task");
    }
  };

  // -------- Download File Uploaded By Poster --------
  const handleDownload = async (task) => {
    if (!task.filePath) {
      alert("No file uploaded by task poster");
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
      alert("❌ Could not download task file");
    }
  };

  // -------- Download File Uploaded By Freelancer --------
  const handleFreelancerDownload = async (task) => {
    if (!task.freelancerFilePath) {
      alert("No file uploaded by freelancer");
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
      alert("❌ Could not download freelancer file");
    }
  };

  // -------- Delete Task --------
  const handleDeleteClick = (taskId) => {
    setDeleteTaskId(taskId);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      const res = await fetch(`${ENDPOINTS.TASKS}/${deleteTaskId}`, {
        method: "DELETE",
        headers,
      });
      if (res.ok) {
        alert("Task deleted successfully!");
        setShowDeleteModal(false);
        fetchTasks();
      }
    } catch (err) {
      console.error(err);
      alert("Failed to delete task");
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
      alert("Failed to fetch bids");
    }
  };

  // -------- Allocate Bid --------
  const handleSelectBid = async (bid) => {
    try {
      const res = await fetch(ENDPOINTS.TASK_ALLOCATE(bid.taskId, bid.id), {
        method: "POST",
        headers,
      });

      if (res.ok) {
        const updatedTask = await res.json();
        alert(`Bid allocated to ${bid.bidderName} successfully!`);
        setTasks((prevTasks) =>
          prevTasks.map((t) => (t.id === updatedTask.id ? updatedTask : t))
        );
        setShowBidsModal(false);
        fetchTasks();
      } else {
        const err = await res.json();
        alert("Failed to allocate bid: " + (err.message || "Unknown error"));
      }
    } catch (err) {
      console.error("Error allocating bid:", err);
      alert("Error allocating bid");
    }
  };

  // -------- Review Work --------
  const handleReviewClick = (task) => {
    setReviewTask(task);
    setShowReviewModal(true);
  };

  // -------- Update Status --------
  const updateStatus = async (taskId, newStatus) => {
    try {
      const res = await fetch(`${ENDPOINTS.TASKS}/${taskId}/status`, {
        method: "PUT",
        headers,
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        alert(`Status updated to ${newStatus}!`);
        setShowReviewModal(false);

        if (newStatus === "COMPLETED") {
          const task = tasks.find((t) => t.id === taskId);
          setTransferAmount(task.creditsOffered);
          setTransferToUserId(task.assignedUserId);
          setShowCreditTransferModal(true);
        }
        fetchTasks();
      }
    } catch (err) {
      console.error(err);
      alert("Failed to update status");
    }
  };

  // -------- Wallet Transfer --------
  const handleCreditTransfer = async () => {
    try {
      const res = await fetch(ENDPOINTS.WALLET_TRANSFER, {
        method: "POST",
        headers,
        body: JSON.stringify({
          fromUserId: userId,
          toUserId: transferToUserId,
          amount: parseInt(transferAmount),
        }),
      });
      if (res.ok) {
        alert("Credits sent successfully!");
        setShowCreditTransferModal(false);
        setShowRatingModal(true); // open rating modal
      } else {
        const err = await res.json();
        alert("Transfer failed: " + (err.message || "Unknown error"));
      }
    } catch (err) {
      console.error(err);
      alert("Error transferring credits");
    }
  };

  return (
    <>
      {/* ----------------- Tasks Table ----------------- */}
      <div className="table-responsive">
        <table className="table table-bordered table-hover text-center">
          <thead>
            <tr>
              <th>Title</th>
              <th>Description</th>
              <th>Category</th>
              <th>Credits</th>
              <th>Deadline</th>
              <th>Status</th>
              <th>File</th>
              <th>View Bids / Assigned</th>
              <th>Review Work</th>
              <th>Rating User</th>
              <th>Delete Task</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((task) => (
              <tr key={task.id}>
                <td>{task.title}</td>
                <td>{task.description}</td>
                <td>{task.category}</td>
                <td>{task.creditsOffered}</td>
                <td>{task.deadline}</td>
                <td>{task.status}</td>

                {/* ---------- File Column (task poster) ---------- */}
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

                {/* ---------- View Bids / Assigned ---------- */}
                <td>
                  {task.status === "OPEN" ? (
                    <Button
                      variant="info"
                      size="sm"
                      onClick={() => handleViewBids(task.id)}
                    >
                      View Bids
                    </Button>
                  ) : task.assignedUserName ? (
                    <span>Assigned to: {task.assignedUserName}</span>
                  ) : (
                    <span>—</span>
                  )}
                </td>

                {/* ---------- Review Work Column (freelancer file) ---------- */}
                <td>
                  {task.status === "PENDING" ? (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleReviewClick(task)}
                    >
                      Review Work
                    </Button>
                  ) : task.status === "COMPLETED" && task.freelancerFilePath ? (
                    <Button
                      variant="success"
                      size="sm"
                      onClick={() => handleFreelancerDownload(task)}
                    >
                      ⬇️ Download File
                    </Button>
                  ) : (
                    <span>—</span>
                  )}
                </td>
                {/* rating */}
                <td>
                  {task.status === "COMPLETED" ? (
                    task.rating ? (
                      <span>
                        Thank you for the rating! Rating Awarded {task.rating}{" "}
                        ⭐
                      </span>
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
                                  body: JSON.stringify({ rating: newRating }),
                                }
                              );
                              if (res.ok) {
                                alert("Rating submitted!");
                                // ✅ Update the local state instantly instead of waiting for refetch
                                setTasks((prevTasks) =>
                                  prevTasks.map((t) =>
                                    t.id === task.id
                                      ? { ...t, rating: newRating }
                                      : t
                                  )
                                );
                              } else {
                                alert("Error submitting rating");
                              }
                            } catch (err) {
                              console.error(err);
                            }
                          }
                        }}
                      >
                        <option value="0">Give Rating</option>
                        {[1, 2, 3, 4, 5].map((r) => (
                          <option key={r} value={r}>
                            {r}
                          </option>
                        ))}
                      </Form.Select>
                    )
                  ) : (
                    <span>–</span>
                  )}
                </td>

                {/* ---------- Delete Task ---------- */}
                <td>
                  {task.status === "OPEN" ? (
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDeleteClick(task.id)}
                    >
                      Delete
                    </Button>
                  ) : (
                    <span className="delete_dsp">
                      Assigned task cannot be deleted
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ----------------- Review Work Modal ----------------- */}
      <Modal
        show={showReviewModal}
        onHide={() => setShowReviewModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Review Work</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {reviewTask && (
            <>
              <h5>{reviewTask.title}</h5>
              <div
                style={{
                  minHeight: "100px",
                  border: "1px solid #ccc",
                  marginTop: "20px",
                }}
              ></div>
              {/* ✅ Use freelancerFilePath here */}
              {reviewTask.freelancerFilePath ? (
                <Button
                  variant="outline-success"
                  size="sm"
                  onClick={() => handleFreelancerDownload(reviewTask)}
                >
                  ⬇️ Download Freelancer File
                </Button>
              ) : (
                <span className="text-muted">
                  No file uploaded by freelancer
                </span>
              )}
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="success"
            onClick={() => updateStatus(reviewTask.id, "COMPLETED")}
          >
            Accept
          </Button>
          <Button
            variant="warning"
            onClick={() => updateStatus(reviewTask.id, "IN_PROGRESS")}
          >
            Request Revision
          </Button>
        </Modal.Footer>
      </Modal>

      {/* ----------------- Credit Transfer Modal ----------------- */}
      <Modal
        show={showCreditTransferModal}
        onHide={() => setShowCreditTransferModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Transfer Credits</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            You are about to send <strong>{transferAmount} credits</strong> to{" "}
            <strong>
              {tasks.find((t) => t.assignedUserId === transferToUserId)
                ?.assignedUserName || "User"}
            </strong>
            .
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowCreditTransferModal(false)}
          >
            Cancel
          </Button>
          <Button variant="success" onClick={handleCreditTransfer}>
            Send Credits
          </Button>
        </Modal.Footer>
      </Modal>

      {/* ----------------- Delete Task Modal ----------------- */}
      <Modal
        show={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>Are you sure you want to delete this task?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={confirmDelete}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>

      {/* ----------------- Bids Modal ----------------- */}
      <Modal
        show={showBidsModal}
        onHide={() => setShowBidsModal(false)}
        size="lg"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Bids for Task</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedTaskBids.length > 0 ? (
            <table className="table table-bordered text-center">
              <thead>
                <tr>
                  <th>Bidder</th>
                  <th>Credits</th>
                  <th>Description</th>
                  <th>Estimated Days</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {selectedTaskBids.map((bid) => (
                  <tr key={bid.id}>
                    <td>{bid.bidderName}</td>
                    <td>{bid.credits}</td>
                    <td>{bid.description}</td>
                    <td>{bid.estimatedDays}</td>
                    <td>
                      <div className="d-flex flex-column gap-2 align-items-center">
                        {/* View Profile button */}
                        <Button
                          variant="outline-primary"
                          size="sm"
                          onClick={() => handleViewProfile(bid.bidderId)}
                        >
                          View Profile
                        </Button>

                        {/* Select button or Assigned text */}
                        {tasks.find((t) => t.id === bid.taskId)?.status ===
                        "ALLOCATED" ? (
                          <span>
                            Assigned to:{" "}
                            {tasks.find((t) => t.id === bid.taskId)
                              ?.assignedUserName || "—"}
                          </span>
                        ) : (
                          <Button
                            variant="success"
                            size="sm"
                            onClick={() => handleSelectBid(bid)}
                          >
                            Select
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-center">No bids for this task</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowBidsModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
      {/* ----------------- View Profile Modal ----------------- */}
      <Modal
        show={showProfileModal}
        onHide={() => setShowProfileModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>User Profile</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedUser ? (
            <>
              <div className="mb-3">
                <strong>Username:</strong> {selectedUser.username}
              </div>
              <div className="mb-3">
                <strong>Email:</strong> {selectedUser.email}
              </div>
              <div className="mb-3">
                <strong>Role:</strong> {selectedUser.role}
              </div>
              <div className="mb-3">
                <strong>Department:</strong> {selectedUser.department || "N/A"}
              </div>
              <div className="mb-3">
                <strong>Studying Year:</strong>{" "}
                {selectedUser.studyingYear || "N/A"}
              </div>
              <div className="mb-3">
                <strong>Skills:</strong> {selectedUser.skills || "N/A"}
              </div>
              <div className="mb-3">
                <strong>Rating:</strong>{" "}
                {selectedUser.rating > 0
                  ? `${selectedUser.rating.toFixed(1)} ⭐ (${
                      selectedUser.ratingCount
                    } ratings)`
                  : "Not rated yet"}
              </div>
            </>
          ) : (
            <p>Loading user details...</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowProfileModal(false)}
          >
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      {/* rating */}
      <Modal
        show={showRatingModal}
        onHide={() => setShowRatingModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Rate Freelancer</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Give a rating (1–5) for the freelancer’s work:</p>
          <Form.Select
            value={givenRating}
            onChange={(e) => setGivenRating(parseInt(e.target.value))}
          >
            <option value="0">Select Rating</option>
            {[1, 2, 3, 4, 5].map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </Form.Select>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="success"
            onClick={async () => {
              if (givenRating < 1 || givenRating > 5) {
                alert("Please select a rating between 1 and 5");
                return;
              }
              try {
                const res = await fetch(
                  `${ENDPOINTS.USERS(transferToUserId)}/rating`,
                  {
                    method: "PUT",
                    headers,
                    body: JSON.stringify({ rating: givenRating }),
                  }
                );
                if (res.ok) {
                  alert("Rating submitted successfully!");
                  setShowRatingModal(false);
                } else {
                  alert("Failed to submit rating");
                }
              } catch (err) {
                console.error(err);
                alert("Error submitting rating");
              }
            }}
          >
            Submit Rating
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
