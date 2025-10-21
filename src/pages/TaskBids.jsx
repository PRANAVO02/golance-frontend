import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button, Table } from "react-bootstrap";

export default function TaskBids() {
  const { taskId } = useParams();
  const [task, setTask] = useState(null); // store task details
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");
  const headers = {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`,
  };

  // Fetch task and bids
  useEffect(() => {
    const fetchData = async () => {
      if (!token) {
        alert("You must be logged in to view bids.");
        navigate("/login");
        return;
      }

      try {
        // Fetch task details
        const taskRes = await fetch(`http://localhost:8080/api/tasks/${taskId}`, { headers });
        if (!taskRes.ok) throw new Error("Failed to fetch task details");
        const taskData = await taskRes.json();
        setTask(taskData);

        // Fetch bids
        const bidRes = await fetch(`http://localhost:8080/api/bids/tasks/${taskId}`, { headers });
        if (!bidRes.ok) throw new Error("Failed to fetch bids");
        const bidData = await bidRes.json();
        setBids(bidData);
      } catch (err) {
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [taskId, navigate, token]);

  const selectBid = async (bidId) => {
    if (!window.confirm("Are you sure you want to select this bid? This will allocate the task.")) return;

    try {
      // Update task status to ALLOCATED and assign bidder
      const res = await fetch(`http://localhost:8080/api/tasks/${taskId}/allocate/${bidId}`, {
        method: "PUT",
        headers,
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText || "Failed to allocate task");
      }

      const updatedTask = await res.json();
      setTask(updatedTask);

      // Freeze other bids (optional: you can mark a field in bids for UI)
      setBids((prevBids) =>
        prevBids.map((b) => ({ ...b, disabled: b.id !== bidId }))
      );

      alert("Bid selected and task allocated successfully!");
    } catch (err) {
      console.error(err);
      alert("Error selecting bid: " + err.message);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (!task) return <p>Task not found</p>;

  const isOwner = task.postedBy?.id === user.id;
  const taskAllocated = task.status === "ALLOCATED";

  return (
    <div className="container mt-5">
      <h2>Bids for Task: {task.title}</h2>
      <p><strong>Status:</strong> {task.status}</p>

      {bids.length === 0 ? (
        <p>No bids placed yet.</p>
      ) : (
        <Table bordered hover>
          <thead>
            <tr>
              <th>Bidder</th>
              <th>Credits</th>
              <th>Description</th>
              <th>Estimated Days</th>
              {isOwner && <th>Action</th>}
            </tr>
          </thead>
          <tbody>
            {bids.map((bid) => (
              <tr key={bid.id} className={bid.disabled ? "table-secondary" : ""}>
                <td>{bid.bidderName}</td>
                <td>{bid.credits}</td>
                <td>{bid.description}</td>
                <td>{bid.estimatedDays}</td>
                {isOwner && (
                  <td>
                    <Button
                      variant="success"
                      size="sm"
                      disabled={taskAllocated || bid.disabled}
                      onClick={() => selectBid(bid.id)}
                    >
                      Select
                    </Button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      <div className="mt-3">
        <Button variant="secondary" onClick={() => navigate(-1)}>
          Back
        </Button>
      </div>
    </div>
  );
}
