import { useState } from "react";
import { Button, Modal, Form } from "react-bootstrap";

export default function TasksPostedByMe({ tasks, setTasks, headers, fetchTasks }) {
  const [showEditModal, setShowEditModal] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTaskId, setDeleteTaskId] = useState(null);
  const [selectedTaskBids, setSelectedTaskBids] = useState([]);
  const [showBidsModal, setShowBidsModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewTask, setReviewTask] = useState(null);

  // ---------- Wallet Transfer ----------
  const [showCreditTransferModal, setShowCreditTransferModal] = useState(false);
  const [transferAmount, setTransferAmount] = useState(0);
  const [transferToUserId, setTransferToUserId] = useState(null);

  const userId = JSON.parse(localStorage.getItem("user"))?.id;

  // ---------- Edit Task ----------
  const handleEditClick = (task) => {
    setEditTask({ ...task });
    setShowEditModal(true);
  };

  const handleEditChange = (e) =>
    setEditTask({ ...editTask, [e.target.name]: e.target.value });

  const saveEdit = async () => {
    try {
      const res = await fetch(`http://localhost:8080/api/tasks/${editTask.id}`, {
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

  // ---------- Delete Task ----------
  const handleDeleteClick = (taskId) => {
    setDeleteTaskId(taskId);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      const res = await fetch(`http://localhost:8080/api/tasks/${deleteTaskId}`, {
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

  // ---------- View Bids ----------
  const handleViewBids = async (taskId) => {
    try {
      const res = await fetch(`http://localhost:8080/api/bids/tasks/${taskId}`, {
        headers,
      });
      const data = await res.json();
      setSelectedTaskBids(data.map((b) => ({ ...b, taskId })));
      setShowBidsModal(true);
    } catch (err) {
      console.error(err);
      alert("Failed to fetch bids");
    }
  };

  // ---------- Allocate Bid ----------
  const handleSelectBid = async (bid) => {
    try {
      const res = await fetch(
        `http://localhost:8080/api/bids/tasks/${bid.taskId}/allocate/${bid.id}`,
        { method: "POST", headers }
      );

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

  // ---------- Review Work ----------
  const handleReviewClick = (task) => {
    setReviewTask(task);
    setShowReviewModal(true);
  };

  // ---------- Update Status ----------
  const updateStatus = async (taskId, newStatus) => {
    try {
      const res = await fetch(`http://localhost:8080/api/tasks/${taskId}/status`, {
        method: "PUT",
        headers,
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        alert(`Status updated to ${newStatus}!`);
        setShowReviewModal(false);

        // Open credit transfer modal if task accepted
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

  // ---------- Wallet Transfer Handler ----------
  const handleCreditTransfer = async () => {
    try {
      const res = await fetch("http://localhost:8080/api/wallet/transfer", {
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
        setTransferAmount(0);
        setTransferToUserId(null);
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
              <th>View Bids / Assigned</th>
              <th>Review Work</th>
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

                {/* ---------- View Bids / Assigned ---------- */}
                <td>
                  {task.status === "ALLOCATED" ? (
                    <span>Assigned to: {task.assignedUserName || "—"}</span>
                  ) : (
                    <Button variant="info" size="sm" onClick={() => handleViewBids(task.id)}>
                      View Bids
                    </Button>
                  )}
                </td>

                {/* ---------- Review Work ---------- */}
                <td>
                  {task.status === "PENDING" ? (
                    <Button variant="primary" size="sm" onClick={() => handleReviewClick(task)}>
                      Review Work
                    </Button>
                  ) : (
                    <span>—</span>
                  )}
                </td>

                {/* ---------- Delete Task ---------- */}
                <td>
                  {task.status === "OPEN" ? (
                    <Button variant="danger" size="sm" onClick={() => handleDeleteClick(task.id)}>
                      Delete
                    </Button>
                  ) : (
                    <span className="delete_dsp">Assigned task cannot be deleted</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ----------------- Review Work Modal ----------------- */}
      <Modal show={showReviewModal} onHide={() => setShowReviewModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Review Work</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {reviewTask && (
            <>
              <h5>{reviewTask.title}</h5>
              <div style={{ minHeight: "100px", border: "1px solid #ccc", marginTop: "20px" }}></div>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="success" onClick={() => updateStatus(reviewTask.id, "COMPLETED")}>
            Accept
          </Button>
          <Button variant="warning" onClick={() => updateStatus(reviewTask.id, "IN_PROGRESS")}>
            Request Revision
          </Button>
        </Modal.Footer>
      </Modal>

      {/* ----------------- Credit Transfer Modal ----------------- */}
      <Modal show={showCreditTransferModal} onHide={() => setShowCreditTransferModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Transfer Credits</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            You are about to send <strong>{transferAmount} credits</strong> to{" "}
            <strong>
              {tasks.find((t) => t.assignedUserId === transferToUserId)?.assignedUserName || "User"}
            </strong>
            .
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCreditTransferModal(false)}>
            Cancel
          </Button>
          <Button variant="success" onClick={handleCreditTransfer}>
            Send Credits
          </Button>
        </Modal.Footer>
      </Modal>

      {/* ----------------- Edit Task Modal ----------------- */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Task</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            {["title", "description", "category", "creditsOffered", "deadline", "status"].map(
              (field) => (
                <Form.Group key={field} className="mb-3">
                  <Form.Label>{field}</Form.Label>
                  {field === "status" ? (
                    <Form.Select name="status" value={editTask?.status} onChange={handleEditChange}>
                      <option value="PENDING">PENDING</option>
                      <option value="OPEN">OPEN</option>
                      <option value="ALLOCATED">ALLOCATED</option>
                      <option value="IN_PROGRESS">IN_PROGRESS</option>
                      <option value="COMPLETED">COMPLETED</option>
                      <option value="CANCELLED">CANCELLED</option>
                    </Form.Select>
                  ) : (
                    <Form.Control
                      type={field === "creditsOffered" ? "number" : field === "deadline" ? "date" : "text"}
                      name={field}
                      value={editTask?.[field] || ""}
                      onChange={handleEditChange}
                    />
                  )}
                </Form.Group>
              )
            )}
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditModal(false)}>
            Cancel
          </Button>
          <Button variant="success" onClick={saveEdit}>
            Save
          </Button>
        </Modal.Footer>
      </Modal>

      {/* ----------------- Delete Task Modal ----------------- */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
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
      <Modal show={showBidsModal} onHide={() => setShowBidsModal(false)} size="lg" centered>
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
                      {tasks.find((t) => t.id === bid.taskId)?.status === "ALLOCATED" ? (
                        <span>
                          Assigned to:{" "}
                          {tasks.find((t) => t.id === bid.taskId)?.assignedUserName || "—"}
                        </span>
                      ) : (
                        <Button variant="success" size="sm" onClick={() => handleSelectBid(bid)}>
                          Select
                        </Button>
                      )}
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
    </>
  );
}
