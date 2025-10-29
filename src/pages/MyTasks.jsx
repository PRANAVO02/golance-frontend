import { useEffect, useState } from "react";
import { Tab, Nav, Row, Col } from "react-bootstrap";
import TasksPostedByMe from "./TasksPostedByMe";
import BidsPlacedByMe from "./BidsPlacedByMe";
import AssignedTasks from "./AssignedTasks";
import { ENDPOINTS } from "../api/endpoints";

export default function MyTasks() {
  const [tasks, setTasks] = useState([]);
  const [bids, setBids] = useState([]);
  const [assignedTasks, setAssignedTasks] = useState([]);

  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  // ---------- Fetch Functions ----------
  const fetchTasks = async () => {
    if (!user || !token) return;
    try {
      // const res = await fetch(`http://localhost:8080/api/tasks/user/${user.id}`, { headers });
        const res = await fetch(ENDPOINTS.TASKS_BY_USER(user.id), { headers });
      setTasks(await res.json());
    } catch (err) {
      console.error(err);
    }
  };

  const fetchBids = async () => {
    try {
      // const res = await fetch(`http://localhost:8080/api/bids/user/${user.id}`, { headers });
       const res = await fetch(ENDPOINTS.BIDS_BY_USER(user.id), { headers });
      setBids(await res.json());
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAssignedTasks = async () => {
    try {
      // const res = await fetch(`http://localhost:8080/api/tasks/user/${user.id}/assigned-tasks`, { headers });
       const res = await fetch(ENDPOINTS.ASSIGNED_TASKS(user.id), { headers });
      setAssignedTasks(await res.json());
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchTasks();
    fetchBids();
    fetchAssignedTasks();
  }, []);

  return (
    <div className="container mt-5">
      <h2 className="mb-4 text-center">My Dashboard</h2>
      <Tab.Container defaultActiveKey="tasks">
        <Row>
          {/* ---------- Left-side Nav ---------- */}
          <Col sm={3}>
            <Nav variant="pills" className="flex-column">
              <Nav.Item>
                <Nav.Link eventKey="tasks">Tasks Posted by Me</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="bids">Bids Placed by Me</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="assigned">Assigned Tasks</Nav.Link>
              </Nav.Item>
            </Nav>
          </Col>

          {/* ---------- Tab Content ---------- */}
          <Col sm={9}>
            <Tab.Content>
              <Tab.Pane eventKey="tasks">
                <TasksPostedByMe
                  tasks={tasks}
                  setTasks={setTasks}
                  headers={headers}
                  fetchTasks={fetchTasks}
                />
              </Tab.Pane>
              <Tab.Pane eventKey="bids">
                <BidsPlacedByMe
                  bids={bids}
                  setBids={setBids}
                  headers={headers}
                  fetchBids={fetchBids}
                />
              </Tab.Pane>
              <Tab.Pane eventKey="assigned">
                <AssignedTasks
                  assignedTasks={assignedTasks}
                  setAssignedTasks={setAssignedTasks}
                  headers={headers}
                  fetchAssignedTasks={fetchAssignedTasks}
                />
              </Tab.Pane>
            </Tab.Content>
          </Col>
        </Row>
      </Tab.Container>
    </div>
  );
}
