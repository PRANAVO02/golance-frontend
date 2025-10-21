import { useState } from "react";
import { Button, Modal, Form } from "react-bootstrap";

export default function BidsPlacedByMe({ bids, setBids, headers, fetchBids }) {
  const [deleteBidId, setDeleteBidId] = useState(null);
  const [showDeleteBidModal, setShowDeleteBidModal] = useState(false);

  // ---------- Delete Bid ----------
  const handleDeleteBidClick = (bidId) => {
    setDeleteBidId(bidId);
    setShowDeleteBidModal(true);
  };

  const confirmDeleteBid = async () => {
    try {
      const res = await fetch(`http://localhost:8080/api/bids/${deleteBidId}`, {
        method: "DELETE",
        headers,
      });
      if (res.ok) {
        alert("Bid deleted successfully!");
        setShowDeleteBidModal(false);
        fetchBids();
      } else alert("Failed to delete bid");
    } catch (err) {
      console.error(err);
      alert("Failed to delete bid");
    }
  };

  return (
    <>
      <div className="table-responsive">
        <table className="table table-bordered table-hover text-center">
          <thead>
            <tr>
              <th>Task</th>
              <th>Credits Offered</th>
              <th>Description</th>
              <th>Estimated Days</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {bids.map((bid) => (
              <tr key={bid.id}>
                <td>{bid.taskTitle}</td>
                <td>{bid.credits}</td>
                <td>{bid.description}</td>
                <td>{bid.estimatedDays}</td>
                <td>
                  {/* Show Delete button only if task is not ALLOCATED */}
                  {bid.taskStatus !== "ALLOCATED" && (
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDeleteBidClick(bid.id)}
                    >
                      Delete
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ---------- Delete Bid Modal ---------- */}
      <Modal show={showDeleteBidModal} onHide={() => setShowDeleteBidModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>Are you sure you want to delete this bid?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteBidModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={confirmDeleteBid}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
