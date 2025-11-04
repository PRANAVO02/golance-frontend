import { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { ListGroup, Card, Form, InputGroup, Badge } from "react-bootstrap";
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
  const [userHasBid, setUserHasBid] = useState(false);
  
  // Search states
  const [searchTitle, setSearchTitle] = useState("");
  const [searchCategory, setSearchCategory] = useState("");
  const [availableCategories, setAvailableCategories] = useState([]);

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

  // Enhanced authentication check
  useEffect(() => {
    if (!user || !token) {
      alert("You must be logged in to view tasks.");
      window.location.href = "/login";
    }
  }, [user, token]);

  const fetchTasks = async () => {
    try {
      const res = await fetch(ENDPOINTS.TASKS, { headers });
      if (!res.ok) throw new Error("Failed to fetch tasks");
      const data = await res.json();
      setTasks(data);
      
      // Extract unique categories for dropdown
      const categories = [...new Set(data.map(task => task.category).filter(Boolean))];
      setAvailableCategories(categories);
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

      // Check if current user already placed a bid
      const hasBid = data.some((bid) => bid.userId === user.id);
      setUserHasBid(hasBid);

    } catch (err) {
      console.error(err);
      setBids([]);
      setUserHasBid(false);
    }
  };

  useEffect(() => {
    if (user && token) {
      fetchTasks();
    }
  }, [user, token]);

  const handleViewDetails = (task) => {
    setSelectedTask(task);
    if (task.status === "OPEN") {
      fetchBids(task.id);
    } else {
      setBids([]);
      setUserHasBid(false);
    }
    setShowBidForm(false);
  };

  // Helper function to check if current user is task owner - FIXED VERSION
  const isTaskOwner = (task) => {
    console.log("Current user ID:", user?.id);
    console.log("Task poster ID:", task.postedBy?.id);
    console.log("Task postedBy object:", task.postedBy);
    console.log("Task postedByName:", task.postedByName);
    
    // Check both ways - by ID and by name as fallback
    const isOwnerById = task.postedBy?.id === user.id;
    const isOwnerByName = task.postedByName === user.name || task.postedByName === user.username;
    
    console.log("Is owner by ID:", isOwnerById);
    console.log("Is owner by name:", isOwnerByName);
    
    return isOwnerById || isOwnerByName;
  };

  // Enhanced bid submission with better owner validation
  const handleBidSubmit = async (e) => {
    e.preventDefault();

    // CRITICAL FIX: Enhanced validation to prevent task poster from bidding
    if (isTaskOwner(selectedTask)) {
      alert("You cannot bid on your own task.");
      setShowBidForm(false);
      return;
    }

    if (!bidAmount || !bidDescription || !estimatedDays)
      return alert("Please fill all fields");

    if (Number(bidAmount) < 0)
      return alert("Bid amount cannot be negative");

    if (Number(estimatedDays) <= 0)
      return alert("Estimated days must be at least 1");

    if (Number(bidAmount) > selectedTask.creditsOffered)
      return alert(`Bid cannot exceed ${selectedTask.creditsOffered} credits`);

    const deadlineDate = new Date(selectedTask.deadline);
    const now = new Date();
    const daysUntilDeadline = Math.max(
      0,
      Math.ceil((deadlineDate - now) / (1000 * 60 * 60 * 24))
    );

    if (Number(estimatedDays) > daysUntilDeadline)
      return alert(
        `Estimated days cannot exceed ${daysUntilDeadline} (days left till deadline)`
      );

    // Prevent double bidding
    if (userHasBid) {
      alert("You have already placed a bid on this task.");
      return;
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
      setUserHasBid(true);
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

  const now = new Date();

  // FIXED: Filter tasks - Only show tasks where current user is NOT the owner in OPEN tab
  const baseOpenTasks = tasks.filter(
    (t) =>
      t.status === "OPEN" &&
      !isTaskOwner(t) && // This should now work properly
      new Date(t.deadline) > now
  );

  // FIXED: Other tasks should include tasks where current user IS the owner
  const baseOtherTasks = tasks.filter(
    (t) =>
      isTaskOwner(t) || // User's own tasks
      t.status !== "OPEN" || // All non-OPEN tasks
      (t.status === "OPEN" && new Date(t.deadline) <= now) // Expired OPEN tasks
  ).map((t) => {
    if (t.status === "OPEN" && new Date(t.deadline) <= now) {
      return { ...t, status: "EXPIRED" };
    }
    return t;
  });

  // Debug logging to see what's happening
  console.log("All tasks:", tasks);
  console.log("Open tasks (user NOT owner):", baseOpenTasks);
  console.log("Other tasks (user IS owner or other status):", baseOtherTasks);
  console.log("Current user:", user);

  // Search filter function
  const filterTasks = (taskList) => {
    return taskList.filter(task => {
      const matchesTitle = task.title.toLowerCase().includes(searchTitle.toLowerCase());
      const matchesCategory = searchCategory === "" || task.category === searchCategory;
      return matchesTitle && matchesCategory;
    });
  };

  // Apply search filters
  const openTasks = filterTasks(baseOpenTasks);
  const otherTasks = filterTasks(baseOtherTasks);

  const deadlineDateForForm = selectedTask ? new Date(selectedTask.deadline) : null;
  const daysUntilDeadlineForForm = selectedTask
    ? Math.max(0, Math.ceil((deadlineDateForForm - now) / (1000 * 60 * 60 * 24)))
    : 0;

  const clearSearch = () => {
    setSearchTitle("");
    setSearchCategory("");
  };

  // Early return if no user
  if (!user || !token) {
    return <div>Redirecting to login...</div>;
  }

  return (
    <div className="container my-5">
      <h2 className="mb-4">All Tasks</h2>

      {loading && <p>Loading tasks...</p>}
      {error && <div className="alert alert-danger">{error}</div>}

      {/* Search Section */}
      <div className="card shadow-sm border-0 mb-4">
        <div className="card-body">
          <h5 className="card-title mb-3">
            <i className="fas fa-search me-2"></i>
            Search Tasks
          </h5>
          <div className="row g-3">
            <div className="col-md-6">
              <Form.Group>
                <Form.Label className="fw-semibold">Search by Title</Form.Label>
                <InputGroup>
                  <InputGroup.Text>
                    <i className="fas fa-heading"></i>
                  </InputGroup.Text>
                  <Form.Control
                    type="text"
                    placeholder="Enter task title..."
                    value={searchTitle}
                    onChange={(e) => setSearchTitle(e.target.value)}
                  />
                </InputGroup>
              </Form.Group>
            </div>
            <div className="col-md-5">
              <Form.Group>
                <Form.Label className="fw-semibold">Filter by Category</Form.Label>
                <InputGroup>
                  <InputGroup.Text>
                    <i className="fas fa-tags"></i>
                  </InputGroup.Text>
                  <Form.Select
                    value={searchCategory}
                    onChange={(e) => setSearchCategory(e.target.value)}
                  >
                    <option value="">All Categories</option>
                    {availableCategories.map((category, index) => (
                      <option key={index} value={category}>
                        {category}
                      </option>
                    ))}
                  </Form.Select>
                </InputGroup>
              </Form.Group>
            </div>
            <div className="col-md-1 d-flex align-items-end">
              <button
                className="btn btn-outline-secondary w-100"
                onClick={clearSearch}
                title="Clear search"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
          </div>
          
          {/* Search Results Summary */}
          {(searchTitle || searchCategory) && (
            <div className="mt-3">
              <small className="text-muted">
                Showing {activeTab === "OPEN" ? openTasks.length : otherTasks.length} tasks
                {searchTitle && ` matching "${searchTitle}"`}
                {searchTitle && searchCategory && " and"}
                {searchCategory && ` in category "${searchCategory}"`}
              </small>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <ul className="nav nav-tabs mb-3">
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === "OPEN" ? "active" : ""}`}
            onClick={() => setActiveTab("OPEN")}
          >
            <i className="fas fa-lock-open me-1"></i>
            Available Tasks ({openTasks.length})
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === "OTHER" ? "active" : ""}`}
            onClick={() => setActiveTab("OTHER")}
          >
            <i className="fas fa-tasks me-1"></i>
            My Tasks & Others ({otherTasks.length})
          </button>
        </li>
      </ul>

      {/* No Results Message */}
      {(activeTab === "OPEN" ? openTasks.length === 0 : otherTasks.length === 0) && (
        <div className="text-center py-5">
          <i className="fas fa-search fa-3x text-muted mb-3"></i>
          <h5 className="text-muted">No tasks found</h5>
          <p className="text-muted">
            {searchTitle || searchCategory 
              ? "Try adjusting your search criteria or clear the filters."
              : activeTab === "OPEN" 
                ? "No available tasks to bid on at the moment." 
                : "No tasks available in this category."}
          </p>
          {(searchTitle || searchCategory) && (
            <button className="btn btn-primary" onClick={clearSearch}>
              Clear Search
            </button>
          )}
        </div>
      )}

      {/* Task List */}
      <div className="row">
        {(activeTab === "OPEN" ? openTasks : otherTasks).map((task) => {
          const isOwner = isTaskOwner(task);
          const hasFile = task.filePath && task.filePath !== "";

          return (
            <div key={task.id} className="col-md-4 mb-3">
              <div className="card h-100 shadow-sm border-0">
                <div className="card-body">
                  <h5 className="card-title fw-semibold">{task.title}</h5>
                  {isOwner && <Badge bg="info" className="mb-2">My Task</Badge>}
                  <p><strong>Category:</strong> {task.category}</p>
                  <p><strong>Credits:</strong> {task.creditsOffered}</p>
                  <p>
                    <strong>Status:</strong>{" "}
                    <span className={
                      task.status === "EXPIRED" ? "text-danger" :
                      task.status === "OPEN" ? "text-success" : "text-warning"
                    }>
                      {task.status}
                    </span>
                  </p>
                  <p><strong>Deadline:</strong> {new Date(task.deadline).toLocaleDateString()}</p>
                  <p><strong>Posted By:</strong> {task.postedByName || "N/A"}</p>

                  {/* For OPEN tab - only show bid button if not owner */}
                  {activeTab === "OPEN" && !isOwner && (
                    <button className="btn btn-primary mt-2" onClick={() => handleViewDetails(task)}>
                      View Details & Bid
                    </button>
                  )}

                  {/* For OPEN tab - if somehow owner's task appears, show different button */}
                  {activeTab === "OPEN" && isOwner && (
                    <button className="btn btn-info mt-2" onClick={() => handleViewDetails(task)}>
                      View My Task
                    </button>
                  )}

                  {/* For OTHER tab - show appropriate actions */}
                  {activeTab === "OTHER" && (
                    <>
                      {isOwner ? (
                        <button className="btn btn-info mt-2" onClick={() => handleViewDetails(task)}>
                          View My Task
                        </button>
                      ) : (
                        <button className="btn btn-secondary mt-2" onClick={() => handleViewDetails(task)}>
                          View Details
                        </button>
                      )}
                      {task.status !== "OPEN" && task.status !== "EXPIRED" && (
                        <p className="text-success mt-2">Assigned To: {task.assignedUserName || "N/A"}</p>
                      )}
                    </>
                  )}

                  {/* File download button */}
                  {hasFile && (
                    <div className="d-flex align-items-center mb-2 bg-light p-2 rounded">
                      <i className="bi bi-paperclip text-primary me-2"></i>
                      <span className="text-truncate" style={{ maxWidth: "150px" }}>
                        {task.filePath.split("_").slice(1).join("_")}
                      </span>
                      <button className="btn btn-outline-success btn-sm ms-auto" onClick={() => handleDownload(task)}>
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
      {selectedTask && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {selectedTask.title}
                  {isTaskOwner(selectedTask) && (
                    <Badge bg="info" className="ms-2">My Task</Badge>
                  )}
                </h5>
                <button type="button" className="btn-close" onClick={() => setSelectedTask(null)}></button>
              </div>
              <div className="modal-body">
                <p><strong>Category:</strong> {selectedTask.category}</p>
                <p><strong>Description:</strong> {selectedTask.description}</p>
                <p><strong>Credits:</strong> {selectedTask.creditsOffered}</p>
                <p><strong>Status:</strong> {selectedTask.status}</p>
                <p><strong>Deadline:</strong> {new Date(selectedTask.deadline).toLocaleDateString()}</p>
                <p><strong>Posted By:</strong> {selectedTask.postedByName || "N/A"}</p>

                {selectedTask.filePath && (
                  <button className="btn btn-outline-success btn-sm mb-2" onClick={() => handleDownload(selectedTask)}>
                    ⬇️ Download File
                  </button>
                )}

                {/* Enhanced bid section with better owner validation */}
                {selectedTask.status === "OPEN" && !isTaskOwner(selectedTask) && (
                  <>
                    {!showBidForm && !userHasBid && (
                      <button className="btn btn-success mb-3 mt-2" onClick={() => setShowBidForm(true)}>
                        Place Bid
                      </button>
                    )}

                    {userHasBid && (
                      <div className="alert alert-info mb-3">
                        <i className="fas fa-info-circle me-2"></i>
                        You have already placed a bid on this task.
                      </div>
                    )}

                    {showBidForm && (
                      <form onSubmit={handleBidSubmit} className="mb-3">
                        <div className="mb-2">
                          <label className="form-label">Bid Amount (Credits)</label>
                          <input
                            type="number"
                            className="form-control"
                            value={bidAmount}
                            onChange={(e) => setBidAmount(e.target.value)}
                            min={0}
                            max={selectedTask.creditsOffered}
                            required
                          />
                          <small className="text-muted">
                            Maximum: {selectedTask.creditsOffered} credits
                          </small>
                        </div>
                        <div className="mb-2">
                          <label className="form-label">Bid Description</label>
                          <textarea
                            className="form-control"
                            value={bidDescription}
                            onChange={(e) => setBidDescription(e.target.value)}
                            rows="3"
                            required
                          />
                        </div>
                        <div className="mb-2">
                          <label className="form-label">Estimated Completion Days</label>
                          <input
                            type="number"
                            className="form-control"
                            value={estimatedDays}
                            onChange={(e) => setEstimatedDays(e.target.value)}
                            min={1}
                            max={daysUntilDeadlineForForm}
                            required
                          />
                          <small className="text-muted">
                            Maximum: {daysUntilDeadlineForForm} day(s) (until deadline)
                          </small>
                        </div>
                        <button type="submit" className="btn btn-primary me-2">Submit Bid</button>
                        <button type="button" className="btn btn-secondary" onClick={() => setShowBidForm(false)}>Cancel</button>
                      </form>
                    )}
                  </>
                )}

                {/* Enhanced owner message */}
                {isTaskOwner(selectedTask) && (
                  <div className="alert alert-info mb-3">
                    <i className="fas fa-info-circle me-2"></i>
                    <strong>This is your task.</strong> You can view bids but cannot place a bid on your own task.
                    {selectedTask.status === "OPEN" && bids.length > 0 && (
                      <div className="mt-2">
                        {/* <a href={`/task-bids/${selectedTask.id}`} className="btn btn-sm btn-outline-primary">
                          Manage Bids
                        </a> */}
                      </div>
                    )}
                  </div>
                )}

                <h5>Bids:</h5>
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
                            {/* {isTaskOwner(selectedTask) && selectedTask.status === "OPEN" && (
                              <button 
                                className="btn btn-success btn-sm mt-2"
                                onClick={() => window.location.href = `/task-bids/${selectedTask.id}`}
                              >
                                Select Bid
                              </button>
                            )} */}
                          </Card.Body>
                        </Card>
                      </ListGroup.Item>
                    ))}
                  </ListGroup>
                )}
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setSelectedTask(null)}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}