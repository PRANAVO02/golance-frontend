import { useState, useEffect } from "react";
import { Button, Modal, Form, Card, Badge, Row, Col } from "react-bootstrap";
import { ENDPOINTS } from "../api/endpoints";

export default function BidsPlacedByMe({ bids, setBids, headers, fetchBids }) {
  const [deleteBidId, setDeleteBidId] = useState(null);
  const [showDeleteBidModal, setShowDeleteBidModal] = useState(false);
  const [selectedBid, setSelectedBid] = useState(null);
  const [theme] = useState(() => localStorage.getItem("theme") || "light");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  // ---------- Delete Bid ----------
  const handleDeleteBidClick = (bid) => {
    setDeleteBidId(bid.id);
    setSelectedBid(bid);
    setShowDeleteBidModal(true);
  };

  const confirmDeleteBid = async () => {
    try {
      const res = await fetch(ENDPOINTS.DELETE_BID(deleteBidId), {
        method: "DELETE",
        headers,
      });
      if (res.ok) {
        setShowDeleteBidModal(false);
        fetchBids();
        // Show success feedback (you could replace this with a toast notification)
        console.log("Bid deleted successfully!");
      } else {
        alert("Failed to delete bid");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to delete bid");
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      PENDING: { variant: "warning", text: "Pending" },
      ALLOCATED: { variant: "success", text: "Allocated" },
      COMPLETED: { variant: "info", text: "Completed" },
      REJECTED: { variant: "danger", text: "Rejected" },
    };

    const config = statusConfig[status] || {
      variant: "secondary",
      text: status,
    };
    return (
      <Badge bg={config.variant} className="status-badge">
        {config.text}
      </Badge>
    );
  };

  const formatDays = (days) => {
    return days === 1 ? `${days} day` : `${days} days`;
  };

  if (bids.length === 0) {
    return (
      <Card className="border-0 empty-state-card">
        <Card.Body className="text-center py-5">
          <div className="empty-state-icon mb-3">💼</div>
          <h5 className="text-muted mb-3">No Bids Placed Yet</h5>
          <p className="text-muted mb-4">
            You haven't placed any bids on tasks yet. Start browsing available
            tasks to place your first bid!
          </p>
          <Button
            variant="primary"
            onClick={() => (window.location.href = "/tasks")}
            className="px-4"
          >
            Browse Tasks
          </Button>
        </Card.Body>
      </Card>
    );
  }

  return (
    <>
      {/* Card View for Bids - Better for mobile */}
      <div className="d-none d-md-block">
        <div className="table-responsive">
          <table className="table table-hover bids-table">
            <thead className="table-header">
              <tr>
                <th>Task Details</th>
                <th>Bid Details</th>
                <th>Timeline</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {bids.map((bid) => (
                <tr key={bid.id} className="bid-row">
                  <td>
                    <div className="task-info">
                      <div className="task-title fw-bold">{bid.taskTitle}</div>
                      {bid.taskCategory && (
                        <Badge
                          bg="outline-secondary"
                          className="category-badge"
                        >
                          {bid.taskCategory}
                        </Badge>
                      )}
                    </div>
                  </td>
                  <td>
                    <div className="bid-details">
                      <div className="credits-amount text-primary fw-bold">
                        {bid.credits} credits
                      </div>
                      {bid.description && (
                        <div className="bid-description text-muted small mt-1">
                          {bid.description.length > 50
                            ? `${bid.description.substring(0, 50)}...`
                            : bid.description}
                        </div>
                      )}
                    </div>
                  </td>
                  <td>
                    <div className="timeline-info">
                      <div className="estimated-days">
                        {formatDays(bid.estimatedDays)}
                      </div>
                      {bid.createdAt && (
                        <div className="created-date text-muted small">
                          {new Date(bid.createdAt).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </td>
                  <td>{getStatusBadge(bid.taskStatus)}</td>
                  <td>
                    {bid.taskStatus !== "ALLOCATED" ? (
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => handleDeleteBidClick(bid)}
                        className="delete-btn"
                      >
                        <span className="btn-icon">🗑️</span>
                        Delete
                      </Button>
                    ) : (
                      <span className="text-muted small">Locked</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="d-block d-md-none">
        <div className="bids-cards-container">
          {bids.map((bid) => (
            <Card key={bid.id} className="bid-card mb-3">
              <Card.Body>
                <Row className="g-2">
                  <Col xs={12}>
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <div className="task-title-mobile fw-bold">
                        {bid.taskTitle}
                      </div>
                      {getStatusBadge(bid.taskStatus)}
                    </div>
                    {bid.taskCategory && (
                      <Badge
                        bg="outline-secondary"
                        className="category-badge mb-2"
                      >
                        {bid.taskCategory}
                      </Badge>
                    )}
                  </Col>

                  <Col xs={6}>
                    <div className="bid-detail-item">
                      <div className="detail-label">Bid Amount</div>
                      <div className="detail-value text-primary fw-bold">
                        {bid.credits} credits
                      </div>
                    </div>
                  </Col>

                  <Col xs={6}>
                    <div className="bid-detail-item">
                      <div className="detail-label">Timeline</div>
                      <div className="detail-value">
                        {formatDays(bid.estimatedDays)}
                      </div>
                    </div>
                  </Col>

                  {bid.description && (
                    <Col xs={12}>
                      <div className="bid-detail-item">
                        <div className="detail-label">Description</div>
                        <div className="detail-value text-muted small">
                          {bid.description}
                        </div>
                      </div>
                    </Col>
                  )}

                  <Col xs={12}>
                    <div className="actions-mobile mt-2">
                      {bid.taskStatus !== "ALLOCATED" ? (
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => handleDeleteBidClick(bid)}
                          className="w-100 delete-btn"
                        >
                          <span className="btn-icon">🗑️</span>
                          Delete Bid
                        </Button>
                      ) : (
                        <div className="text-center text-muted small py-2">
                          Bid cannot be modified - Task allocated
                        </div>
                      )}
                    </div>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          ))}
        </div>
      </div>

      {/* ---------- Enhanced Delete Bid Modal ---------- */}
      <Modal
        show={showDeleteBidModal}
        onHide={() => setShowDeleteBidModal(false)}
        centered
        className="delete-modal"
      >
        <Modal.Header closeButton className="modal-header-custom">
          <Modal.Title>
            <span className="modal-title-icon">⚠️</span>
            Confirm Bid Deletion
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center">
          {selectedBid && (
            <div className="bid-delete-info mb-3">
              <div className="task-title-delete fw-bold">
                {selectedBid.taskTitle}
              </div>
              <div className="bid-amount-delete text-primary">
                {selectedBid.credits} credits
              </div>
            </div>
          )}
          <p className="mb-0">
            Are you sure you want to delete this bid? This action cannot be
            undone.
          </p>
        </Modal.Body>
        <Modal.Footer className="modal-footer-custom">
          <Button
            variant="outline-secondary"
            onClick={() => setShowDeleteBidModal(false)}
            className="cancel-btn"
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={confirmDeleteBid}
            className="confirm-delete-btn"
          >
            <span className="btn-icon">🗑️</span>
            Delete Bid
          </Button>
        </Modal.Footer>
      </Modal>

      <style jsx>{`
        .bids-table {
          background: var(--card-bg);
          border-radius: var(--border-radius);
          overflow: hidden;
          box-shadow: var(--shadow);
        }

        .table-header {
          background: rgba(var(--primary-btn-bg), 0.1);
          border-bottom: 2px solid var(--input-border);
        }

        .table-header th {
          border: none;
          padding: 1rem;
          font-weight: 600;
          color: var(--text-color);
        }

        .bid-row td {
          padding: 1rem;
          vertical-align: middle;
          border-color: var(--input-border);
        }

        .bid-row:hover {
          background: rgba(var(--primary-btn-bg), 0.05);
        }

        .task-title {
          color: var(--text-color);
          margin-bottom: 0.25rem;
        }

        .category-badge {
          background: transparent;
          border: 1px solid var(--muted-text-color);
          color: var(--muted-text-color);
          font-size: 0.7rem;
        }

        .credits-amount {
          font-size: 1.1rem;
        }

        .bid-description {
          line-height: 1.4;
        }

        .estimated-days {
          font-weight: 500;
          color: var(--text-color);
        }

        .created-date {
          font-size: 0.8rem;
        }

        .status-badge {
          font-size: 0.75rem;
          padding: 0.35rem 0.75rem;
        }

        .delete-btn {
          border-radius: 20px;
          padding: 0.4rem 1rem;
          font-size: 0.875rem;
          transition: all 0.3s ease;
        }

        .delete-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(220, 53, 69, 0.3);
        }

        .btn-icon {
          margin-right: 0.5rem;
        }

        /* Mobile Styles */
        .bid-card {
          background: var(--card-bg);
          border: 1px solid var(--input-border);
          border-radius: var(--border-radius);
          box-shadow: var(--shadow);
        }

        .task-title-mobile {
          color: var(--text-color);
          font-size: 1.1rem;
        }

        .bid-detail-item {
          margin-bottom: 0.5rem;
        }

        .detail-label {
          font-size: 0.8rem;
          color: var(--muted-text-color);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .detail-value {
          font-size: 0.95rem;
          color: var(--text-color);
        }

        /* Modal Styles */
        .modal-header-custom {
          background: rgba(220, 53, 69, 0.05);
          border-bottom: 1px solid var(--input-border);
        }

        .modal-title-icon {
          margin-right: 0.5rem;
        }

        .task-title-delete {
          font-size: 1.2rem;
          color: var(--text-color);
          margin-bottom: 0.5rem;
        }

        .bid-amount-delete {
          font-size: 1.3rem;
          font-weight: bold;
        }

        .modal-footer-custom {
          border-top: 1px solid var(--input-border);
          background: var(--bg-color);
        }

        .cancel-btn,
        .confirm-delete-btn {
          border-radius: 8px;
          padding: 0.5rem 1.5rem;
          font-weight: 500;
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
