import { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { ListGroup, Card } from "react-bootstrap";
import { ENDPOINTS } from "../api/endpoints";

export default function TaskPage() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedTask, setSelectedTask] = useState(null);
  const [bids, setBids] = useState([]);
  const [activeTab, setActiveTab] = useState("OPEN");
  const [showBidForm, setShowBidForm] = useState(false);
  const [bidAmount, setBidAmount] = useState("");
  const [bidDescription, setBidDescription] = useState("");
  const [estimatedDays, setEstimatedDays] = useState("");

  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");

  // theme
  const [theme] = useState(() => localStorage.getItem("theme") || "light");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  if (!user || !token) {
    alert("You must be logged in to view tasks.");
    window.location.href = "/login";
  }

  const fetchTasks = async () => {
    try {
      const res = await fetch(ENDPOINTS.TASKS, { headers });
      if (!res.ok) throw new Error("Failed to fetch tasks");
      const data = await res.json();
      setTasks(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchBids = async (taskId) => {
    try {
      const res = await fetch(ENDPOINTS.BIDS_BY_TASK(taskId), { headers });
      if (!res.ok) throw new Error("Failed to fetch bids");
      const data = await res.json();
      setBids(data);
    } catch (err) {
      console.error(err);
      setBids([]);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleViewDetails = (task) => {
    setSelectedTask(task);
    if (task.status === "OPEN" && task.postedBy?.id !== user.id) {
      fetchBids(task.id);
    } else {
      setBids([]);
    }
    setShowBidForm(false);
  };

  const handleBidSubmit = async (e) => {
    e.preventDefault();
    if (!bidAmount || !bidDescription || !estimatedDays)
      return alert("Fill all fields");

    if (Number(bidAmount) > selectedTask.creditsOffered) {
      return alert(`Bid cannot exceed ${selectedTask.creditsOffered} credits`);
    }

    const payload = {
      userId: user.id,
      credits: Number(bidAmount),
      description: bidDescription,
      estimatedDays: Number(estimatedDays),
    };

    try {
      const res = await fetch(ENDPOINTS.BIDS_BY_TASK(selectedTask.id), {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText || "Failed to place bid");
      }

      const newBid = await res.json();
      setBids((prev) => [...prev, newBid]);
      setBidAmount("");
      setBidDescription("");
      setEstimatedDays("");
      setShowBidForm(false);
      alert("Bid placed successfully!");
    } catch (err) {
      console.error("Error placing bid:", err);
      alert("Error placing bid: " + err.message);
    }
  };

  const handleDownload = async (task) => {
    try {
      const response = await fetch(`${ENDPOINTS.TASKS}/download/${task.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Failed to download file");
      const blob = await response.blob();
      const originalFileName = task.filePath.split("_").slice(1).join("_");
      const filename = `${task.title.replace(/\s+/g, "_")}_${originalFileName}`;
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download failed:", error);
      alert("❌ Could not download file");
    }
  };

  // Filter tasks based on deadline
  const now = new Date();

  const openTasks = tasks.filter(
    (t) =>
      t.status === "OPEN" &&
      t.postedBy?.id !== user.id &&
      new Date(t.deadline) > now
  );

  const otherTasks = tasks
    .filter(
      (t) =>
        t.status !== "OPEN" ||
        (t.status === "OPEN" && new Date(t.deadline) <= now)
    )
    .map((t) => {
      if (t.status === "OPEN" && new Date(t.deadline) <= now) {
        return { ...t, status: "EXPIRED" };
      }
      return t;
    });

  return (
    <div className="container my-5">
      <h2 className="mb-4">All Tasks</h2>

      {loading && <p>Loading tasks...</p>}
      {error && <div className="alert alert-danger">{error}</div>}

      {/* Tabs */}
      <ul className="nav nav-tabs mb-3">
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === "OPEN" ? "active" : ""}`}
            onClick={() => setActiveTab("OPEN")}
          >
            Open Tasks
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === "OTHER" ? "active" : ""}`}
            onClick={() => setActiveTab("OTHER")}
          >
            Other Tasks
          </button>
        </li>
      </ul>

      {/* Task List */}
      <div className="row">
        {(activeTab === "OPEN" ? openTasks : otherTasks).map((task) => {
          const isOwner = task.postedBy?.id === user.id;
          const hasFile = task.filePath && task.filePath !== "";

          return (
            <div key={task.id} className="col-md-4 mb-3">
              <div className="card h-100 shadow-sm border-0">
                <div className="card-body">
                  <h5 className="card-title fw-semibold">{task.title}</h5>
                  <p><strong>Category:</strong> {task.category}</p>
                  <p><strong>Credits:</strong> {task.creditsOffered}</p>
                  <p>
                    <strong>Status:</strong>{" "}
                    <span
                      className={`${
                        task.status === "EXPIRED" ? "text-danger" : "text-success"
                      }`}
                    >
                      {task.status}
                    </span>
                  </p>
                  <p><strong>Deadline:</strong> {task.deadline}</p>
                  <p><strong>Posted By:</strong> {task.postedByName || "N/A"}</p>

                  {/* Dynamic View: Bids or Assigned */}
                  {task.status === "OPEN" && !isOwner ? (
                    <button
                      className="btn btn-primary mt-2"
                      onClick={() => handleViewDetails(task)}
                    >
                      View Bids
                    </button>
                  ) : task.status !== "OPEN" && task.status !== "EXPIRED" ? (
                    <p className="text-success mt-2">
                      Assigned To: {task.assignedUserName || "N/A"}
                    </p>
                  ) : null}

                  {/* File download button */}
                  {hasFile && (
                    <div className="d-flex align-items-center mb-2 bg-light p-2 rounded">
                      <i className="bi bi-paperclip text-primary me-2"></i>
                      <span className="text-truncate" style={{ maxWidth: "150px" }}>
                        {task.filePath.split("_").slice(1).join("_")}
                      </span>
                      <button
                        className="btn btn-outline-success btn-sm ms-auto"
                        onClick={() => handleDownload(task)}
                      >
                        ⬇️
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal for Task Details */}
      {selectedTask && selectedTask.status === "OPEN" && (
        <div
          className="modal show d-block"
          tabIndex="-1"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{selectedTask.title}</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setSelectedTask(null)}
                ></button>
              </div>
              <div className="modal-body text-dark">
                <p><strong>Category:</strong> {selectedTask.category}</p>
                <p><strong>Description:</strong> {selectedTask.description}</p>
                <p><strong>Credits:</strong> {selectedTask.creditsOffered}</p>
                <p><strong>Status:</strong> {selectedTask.status}</p>
                <p><strong>Deadline:</strong> {selectedTask.deadline}</p>
                <p><strong>Posted By:</strong> {selectedTask.postedByName || "N/A"}</p>

                {selectedTask.filePath && (
                  <button
                    className="btn btn-outline-success btn-sm mb-2"
                    onClick={() => handleDownload(selectedTask)}
                  >
                    ⬇️ Download File
                  </button>
                )}

                {/* Bid form */}
                {selectedTask.postedBy?.id !== user.id && !showBidForm && (
                  <button
                    className="btn btn-success mb-3 mt-2"
                    onClick={() => setShowBidForm(true)}
                  >
                    Bid
                  </button>
                )}

                {showBidForm && (
                  <form onSubmit={handleBidSubmit} className="mb-3">
                    <div className="mb-2">
                      <label className="form-label">Bid Amount</label>
                      <input
                        type="number"
                        className="form-control"
                        value={bidAmount}
                        onChange={(e) => setBidAmount(e.target.value)}
                        max={selectedTask.creditsOffered}
                      />
                    </div>
                    <div className="mb-2">
                      <label className="form-label">Description</label>
                      <textarea
                        className="form-control"
                        value={bidDescription}
                        onChange={(e) => setBidDescription(e.target.value)}
                      />
                    </div>
                    <div className="mb-2">
                      <label className="form-label">Estimated Days</label>
                      <input
                        type="number"
                        className="form-control"
                        value={estimatedDays}
                        onChange={(e) => setEstimatedDays(e.target.value)}
                      />
                    </div>
                    <button type="submit" className="btn btn-primary me-2">
                      Submit Bid
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setShowBidForm(false)}
                    >
                      Cancel
                    </button>
                  </form>
                )}

                <h5>Previous Bids:</h5>
                {bids.length === 0 ? (
                  <p>No bids yet.</p>
                ) : (
                  <ListGroup>
                    {bids.map((bid) => (
                      <ListGroup.Item key={bid.id} className="mb-2">
                        <Card>
                          <Card.Body>
                            <p><strong>Bidder:</strong> {bid.bidderName}</p>
                            <p><strong>Credits:</strong> {bid.credits}</p>
                            <p><strong>Description:</strong> {bid.description}</p>
                            <p><strong>Estimated Days:</strong> {bid.estimatedDays}</p>
                          </Card.Body>
                        </Card>
                      </ListGroup.Item>
                    ))}
                  </ListGroup>
                )}
              </div>
              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => setSelectedTask(null)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
