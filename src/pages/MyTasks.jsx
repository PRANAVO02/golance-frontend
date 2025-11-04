import { useEffect, useState } from "react";
import { Tab, Nav, Row, Col, Badge, Card } from "react-bootstrap";
import TasksPostedByMe from "./TasksPostedByMe";
import BidsPlacedByMe from "./BidsPlacedByMe";
import AssignedTasks from "./AssignedTasks";
import { ENDPOINTS } from "../api/endpoints";

export default function MyTasks() {
  const [tasks, setTasks] = useState([]);
  const [bids, setBids] = useState([]);
  const [assignedTasks, setAssignedTasks] = useState([]);
  const [activeTab, setActiveTab] = useState("tasks");
  const [loading, setLoading] = useState({
    tasks: true,
    bids: true,
    assigned: true,
  });

  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  const [theme] = useState(() => localStorage.getItem("theme") || "light");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  // ---------- Fetch Functions ----------
  const fetchTasks = async () => {
    if (!user || !token) return;
    setLoading((prev) => ({ ...prev, tasks: true }));
    try {
      const res = await fetch(ENDPOINTS.TASKS_BY_USER(user.id), { headers });
      const data = await res.json();
      setTasks(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading((prev) => ({ ...prev, tasks: false }));
    }
  };

  const fetchBids = async () => {
    setLoading((prev) => ({ ...prev, bids: true }));
    try {
      const res = await fetch(ENDPOINTS.BIDS_BY_USER(user.id), { headers });
      const data = await res.json();
      setBids(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading((prev) => ({ ...prev, bids: false }));
    }
  };

  const fetchAssignedTasks = async () => {
    setLoading((prev) => ({ ...prev, assigned: true }));
    try {
      const res = await fetch(ENDPOINTS.ASSIGNED_TASKS(user.id), { headers });
      const data = await res.json();
      setAssignedTasks(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading((prev) => ({ ...prev, assigned: false }));
    }
  };

  useEffect(() => {
    fetchTasks();
    fetchBids();
    fetchAssignedTasks();
  }, []);

  // Stats for dashboard overview - CORRECTED STATUS FILTERS
  const stats = {
    tasksPosted: tasks.length,
    bidsPlaced: bids.length,
    tasksAssigned: assignedTasks.length,
    // Corrected status filters based on actual task status values
    activeTasks: tasks.filter(
      (task) =>
        task.status === "OPEN" ||
        task.status === "IN_PROGRESS" ||
        task.status === "PENDING"
    ).length,
    pendingBids: bids.filter(
      (bid) =>
        bid.status === "PENDING" ||
        bid.taskStatus === "OPEN" ||
        bid.taskStatus === "PENDING"
    ).length,
    completedTasks: assignedTasks.filter((task) => task.status === "COMPLETED")
      .length,
    // Additional useful stats
    openTasks: tasks.filter((task) => task.status === "OPEN").length,
    inProgressTasks: tasks.filter((task) => task.status === "IN_PROGRESS")
      .length,
    underReviewTasks: tasks.filter((task) => task.status === "PENDING").length,
  };

  const getTabBadge = (tabKey) => {
    switch (tabKey) {
      case "tasks":
        return stats.tasksPosted;
      case "bids":
        return stats.bidsPlaced;
      case "assigned":
        return stats.tasksAssigned;
      default:
        return 0;
    }
  };

  // Get status color for better visual feedback
  const getStatusColor = (count, type) => {
    if (count === 0) return "secondary";
    if (type === "active" || type === "open") return "success";
    if (type === "pending" || type === "review") return "warning";
    if (type === "completed") return "primary";
    return "info";
  };

  return (
    <div className="container mt-4">
      {/* Dashboard Header */}
      <div className="dashboard-header mb-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h2 className="mb-2 fw-bold">My Dashboard</h2>
            <p className="text-muted mb-0">
              Welcome back, {user?.name || "User"}! Manage your tasks and bids.
            </p>
          </div>
          <div className="text-end">
            <div className="d-flex gap-3">
              <div className="stat-pill">
                <div className="stat-number">{stats.tasksPosted}</div>
                <div className="stat-label">Tasks Posted</div>
              </div>
              <div className="stat-pill">
                <div className="stat-number">{stats.bidsPlaced}</div>
                <div className="stat-label">Bids Placed</div>
              </div>
              <div className="stat-pill">
                <div className="stat-number">{stats.tasksAssigned}</div>
                <div className="stat-label">Assigned</div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats Cards - IMPROVED WITH BETTER LABELS */}
        <Row className="g-3 mb-4">
          <Col md={3}>
            <Card className="stat-card h-100 border-0">
              <Card.Body className="text-center p-3">
                <div className="stat-icon mb-2">🔓</div>
                <div
                  className={`stat-value text-${getStatusColor(
                    stats.openTasks,
                    "open"
                  )}`}
                >
                  {stats.openTasks}
                </div>
                <div className="stat-label small">Open Tasks</div>
                <div className="stat-subtext text-muted extra-small">
                  Waiting for bids
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="stat-card h-100 border-0">
              <Card.Body className="text-center p-3">
                <div className="stat-icon mb-2">🚀</div>
                <div
                  className={`stat-value text-${getStatusColor(
                    stats.inProgressTasks,
                    "active"
                  )}`}
                >
                  {stats.inProgressTasks}
                </div>
                <div className="stat-label small">In Progress</div>
                <div className="stat-subtext text-muted extra-small">
                  Being worked on
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="stat-card h-100 border-0">
              <Card.Body className="text-center p-3">
                <div className="stat-icon mb-2">⏳</div>
                <div
                  className={`stat-value text-${getStatusColor(
                    stats.underReviewTasks,
                    "review"
                  )}`}
                >
                  {stats.underReviewTasks}
                </div>
                <div className="stat-label small">Under Review</div>
                <div className="stat-subtext text-muted extra-small">
                  Awaiting approval
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="stat-card h-100 border-0">
              <Card.Body className="text-center p-3">
                <div className="stat-icon mb-2">✅</div>
                <div
                  className={`stat-value text-${getStatusColor(
                    stats.completedTasks,
                    "completed"
                  )}`}
                >
                  {stats.completedTasks}
                </div>
                <div className="stat-label small">Completed</div>
                <div className="stat-subtext text-muted extra-small">
                  Finished tasks
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Additional Stats Row for Bids */}
        <Row className="g-3">
          <Col md={6}>
            <Card className="stat-card h-100 border-0">
              <Card.Body className="text-center p-3">
                <div className="stat-icon mb-2">💼</div>
                <div
                  className={`stat-value text-${getStatusColor(
                    stats.pendingBids,
                    "pending"
                  )}`}
                >
                  {stats.pendingBids}
                </div>
                <div className="stat-label small">Pending Bids</div>
                <div className="stat-subtext text-muted extra-small">
                  Awaiting decision
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={6}>
            <Card className="stat-card h-100 border-0">
              <Card.Body className="text-center p-3">
                <div className="stat-icon mb-2">📊</div>
                <div className="stat-value text-info">{stats.activeTasks}</div>
                <div className="stat-label small">Total Active</div>
                <div className="stat-subtext text-muted extra-small">
                  All ongoing activities
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </div>

      {/* Main Content Tabs */}
      <Tab.Container
        activeKey={activeTab}
        onSelect={(key) => setActiveTab(key)}
        id="dashboard-tabs"
      >
        <Row>
          {/* Enhanced Sidebar Navigation */}
          <Col lg={3} className="mb-4">
            <Card className="sidebar border-0 h-100">
              <Card.Body className="p-3">
                <Nav variant="pills" className="flex-column gap-2">
                  <Nav.Item>
                    <Nav.Link
                      eventKey="tasks"
                      className="dashboard-nav-link d-flex justify-content-between align-items-center p-3 rounded-3"
                    >
                      <div className="d-flex align-items-center gap-3">
                        <div className="nav-icon">📋</div>
                        <span className="nav-text">Tasks Posted</span>
                      </div>
                      <Badge
                        bg={
                          stats.tasksPosted > 0 ? "primary" : "outline-primary"
                        }
                        pill
                        className={loading.tasks ? "pulse" : ""}
                      >
                        {loading.tasks ? "..." : getTabBadge("tasks")}
                      </Badge>
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link
                      eventKey="bids"
                      className="dashboard-nav-link d-flex justify-content-between align-items-center p-3 rounded-3"
                    >
                      <div className="d-flex align-items-center gap-3">
                        <div className="nav-icon">💰</div>
                        <span className="nav-text">My Bids</span>
                      </div>
                      <Badge
                        bg={
                          stats.bidsPlaced > 0 ? "warning" : "outline-warning"
                        }
                        pill
                        className={loading.bids ? "pulse" : ""}
                      >
                        {loading.bids ? "..." : getTabBadge("bids")}
                      </Badge>
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link
                      eventKey="assigned"
                      className="dashboard-nav-link d-flex justify-content-between align-items-center p-3 rounded-3"
                    >
                      <div className="d-flex align-items-center gap-3">
                        <div className="nav-icon">✅</div>
                        <span className="nav-text">Assigned Tasks</span>
                      </div>
                      <Badge
                        bg={
                          stats.tasksAssigned > 0
                            ? "success"
                            : "outline-success"
                        }
                        pill
                        className={loading.assigned ? "pulse" : ""}
                      >
                        {loading.assigned ? "..." : getTabBadge("assigned")}
                      </Badge>
                    </Nav.Link>
                  </Nav.Item>
                </Nav>

                {/* Quick Actions */}
                <div className="mt-4 pt-3 border-top">
                  <h6 className="text-muted mb-3">Quick Actions</h6>
                  <div className="d-grid gap-2">
                    <button
                      className="btn btn-outline-primary btn-sm"
                      onClick={() => (window.location.href = "/post-task")}
                    >
                      + Post New Task
                    </button>
                    <button
                      className="btn btn-outline-secondary btn-sm"
                      onClick={() => (window.location.href = "/tasks")}
                    >
                      🔍 Browse Tasks
                    </button>
                  </div>
                </div>

                {/* Stats Summary */}
                <div className="mt-4 pt-3 border-top">
                  <h6 className="text-muted mb-3">Quick Stats</h6>
                  <div className="small-stats">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <span className="text-muted">Open Tasks:</span>
                      <Badge bg="outline-success" pill>
                        {stats.openTasks}
                      </Badge>
                    </div>
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <span className="text-muted">In Progress:</span>
                      <Badge bg="outline-warning" pill>
                        {stats.inProgressTasks}
                      </Badge>
                    </div>
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <span className="text-muted">Under Review:</span>
                      <Badge bg="outline-info" pill>
                        {stats.underReviewTasks}
                      </Badge>
                    </div>
                    <div className="d-flex justify-content-between align-items-center">
                      <span className="text-muted">Pending Bids:</span>
                      <Badge bg="outline-secondary" pill>
                        {stats.pendingBids}
                      </Badge>
                    </div>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>

          {/* Tab Content Area */}
          <Col lg={9}>
            <Card className="border-0 content-card">
              <Card.Body className="p-4">
                {loading[activeTab] ? (
                  <div className="text-center py-5">
                    <div className="spinner-border text-primary mb-3"></div>
                    <p className="text-muted">Loading {activeTab}...</p>
                  </div>
                ) : (
                  <Tab.Content>
                    <Tab.Pane eventKey="tasks">
                      <div className="d-flex justify-content-between align-items-center mb-4">
                        <div>
                          <h4 className="mb-0 section-title">
                            Tasks Posted by Me
                          </h4>
                          <p className="text-muted mb-0 small">
                            Manage your posted tasks and review submissions
                          </p>
                        </div>
                        <Badge bg="primary" className="fs-6 count-badge">
                          {tasks.length} total • {stats.openTasks} open •{" "}
                          {stats.inProgressTasks} in progress
                        </Badge>
                      </div>
                      <TasksPostedByMe
                        tasks={tasks}
                        setTasks={setTasks}
                        headers={headers}
                        fetchTasks={fetchTasks}
                      />
                    </Tab.Pane>
                    <Tab.Pane eventKey="bids">
                      <div className="d-flex justify-content-between align-items-center mb-4">
                        <div>
                          <h4 className="mb-0 section-title">
                            Bids Placed by Me
                          </h4>
                          <p className="text-muted mb-0 small">
                            Track your bids and their status
                          </p>
                        </div>
                        <Badge bg="warning" className="fs-6 count-badge">
                          {bids.length} total • {stats.pendingBids} pending
                        </Badge>
                      </div>
                      <BidsPlacedByMe
                        bids={bids}
                        setBids={setBids}
                        headers={headers}
                        fetchBids={fetchBids}
                      />
                    </Tab.Pane>
                    <Tab.Pane eventKey="assigned">
                      <div className="d-flex justify-content-between align-items-center mb-4">
                        <div>
                          <h4 className="mb-0 section-title">
                            My Assigned Tasks
                          </h4>
                          <p className="text-muted mb-0 small">
                            Tasks assigned to you for completion
                          </p>
                        </div>
                        <Badge bg="success" className="fs-6 count-badge">
                          {assignedTasks.length} total • {stats.completedTasks}{" "}
                          completed
                        </Badge>
                      </div>
                      <AssignedTasks
                        assignedTasks={assignedTasks}
                        setAssignedTasks={setAssignedTasks}
                        headers={headers}
                        fetchAssignedTasks={fetchAssignedTasks}
                      />
                    </Tab.Pane>
                  </Tab.Content>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Tab.Container>
    </div>
  );
}
