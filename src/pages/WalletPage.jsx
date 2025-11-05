import { useEffect, useState } from "react";
import { ENDPOINTS } from "../api/endpoints";

export default function WalletPage() {
  const user = JSON.parse(localStorage.getItem("user"));
  const userId = user?.id;
  const token = localStorage.getItem("token");

  const [theme] = useState(() => localStorage.getItem("theme") || "light");
  const [balance, setBalance] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [rechargeAmount, setRechargeAmount] = useState("");
  const [transferAmount, setTransferAmount] = useState("");
  const [transferToUserId, setTransferToUserId] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [activeAction, setActiveAction] = useState("recharge");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  // Fetch balance and transactions
  const fetchWalletData = async () => {
    try {
      const balanceRes = await fetch(ENDPOINTS.WALLET_BALANCE(userId), {
        headers,
      });
      if (!balanceRes.ok) throw new Error("Failed to fetch balance");
      const balanceData = await balanceRes.json();
      setBalance(balanceData);

      const txRes = await fetch(ENDPOINTS.TRANSACTIONS(userId), { headers });
      if (!txRes.ok) throw new Error("Failed to fetch transactions");
      const txData = await txRes.json();
      setTransactions(txData);
      setLoading(false);
    } catch (err) {
      setError(err.message || "Something went wrong");
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId && token) fetchWalletData();
  }, [userId, token]);

  // Recharge handler
  const handleRecharge = async () => {
    if (!rechargeAmount || parseInt(rechargeAmount) <= 0) {
      setError("Please enter a valid amount");
      return;
    }
    try {
      const res = await fetch(ENDPOINTS.WALLET_RECHARGE, {
        method: "POST",
        headers,
        body: JSON.stringify({
          userId,
          rechargeAmount: parseInt(rechargeAmount),
        }),
      });
      if (!res.ok) throw new Error("Recharge failed");
      setRechargeAmount("");
      setError("");
      fetchWalletData();
    } catch (err) {
      setError(err.message);
    }
  };

  // Transfer handler
  const handleTransfer = async () => {
    if (!transferAmount || !transferToUserId) {
      setError("Please fill all transfer fields");
      return;
    }
    if (parseInt(transferAmount) <= 0) {
      setError("Transfer amount must be positive");
      return;
    }
    if (parseInt(transferAmount) > balance) {
      setError("Insufficient balance for this transfer");
      return;
    }
    try {
      const res = await fetch(ENDPOINTS.WALLET_TRANSFER, {
        method: "POST",
        headers,
        body: JSON.stringify({
          fromUserId: parseInt(userId),
          toUserId: parseInt(transferToUserId),
          amount: parseInt(transferAmount),
        }),
      });
      if (!res.ok) throw new Error("Transfer failed");
      setTransferAmount("");
      setTransferToUserId("");
      setError("");
      fetchWalletData();
    } catch (err) {
      setError(err.message);
    }
  };

  const getTransactionIcon = (type, description) => {
    const typeLower = type?.toLowerCase();
    const descLower = description?.toLowerCase();

    // Check description first for more accurate detection
    if (descLower?.includes("transfer to") || descLower?.includes("sent to")) {
      return "📤"; // Sent out
    } else if (
      descLower?.includes("transfer from") ||
      descLower?.includes("received from")
    ) {
      return "📥"; // Received
    } else if (
      typeLower?.includes("recharge") ||
      descLower?.includes("recharge")
    ) {
      return "💰"; // Recharge
    } else if (typeLower?.includes("task") || descLower?.includes("task")) {
      return "💼"; // Task related
    } else {
      return "💳"; // Default
    }
  };

  const getTransactionColor = (type, description) => {
    const typeLower = type?.toLowerCase();
    const descLower = description?.toLowerCase();

    // Outgoing transactions (negative)
    if (
      descLower?.includes("transfer to") ||
      descLower?.includes("sent to") ||
      typeLower?.includes("sent")
    ) {
      return "var(--danger-color, #dc3545)";
    }
    // Incoming transactions (positive)
    else if (
      descLower?.includes("transfer from") ||
      descLower?.includes("received from") ||
      typeLower?.includes("received") ||
      typeLower?.includes("recharge")
    ) {
      return "var(--success-color, #28a745)";
    } else {
      return "var(--text-color)";
    }
  };

  const getAmountDisplay = (type, amount, description) => {
    const typeLower = type?.toLowerCase();
    const descLower = description?.toLowerCase();

    // Outgoing transactions (negative)
    if (
      descLower?.includes("transfer to") ||
      descLower?.includes("sent to") ||
      typeLower?.includes("sent")
    ) {
      return `-${amount}`;
    }
    // Incoming transactions (positive)
    else if (
      descLower?.includes("transfer from") ||
      descLower?.includes("received from") ||
      typeLower?.includes("received") ||
      typeLower?.includes("recharge")
    ) {
      return `+${amount}`;
    } else {
      // Default to positive if we can't determine
      return `+${amount}`;
    }
  };

  const getTransactionTitle = (type, description) => {
    const descLower = description?.toLowerCase();

    if (descLower?.includes("transfer to")) {
      return "TRANSFER SENT";
    } else if (descLower?.includes("transfer from")) {
      return "TRANSFER RECEIVED";
    } else if (descLower?.includes("recharge")) {
      return "RECHARGE";
    } else {
      return type?.toUpperCase() || "TRANSACTION";
    }
  };

  if (loading) {
    return (
      <div className="main-container">
        <div className="content-wrapper">
          <div className="container py-5">
            <div className="text-center py-5">
              <div
                className="spinner-border text-primary mb-3"
                style={{ width: "3rem", height: "3rem" }}
                role="status"
              >
                <span className="visually-hidden">Loading...</span>
              </div>
              <h3>Loading wallet...</h3>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="main-container">
      <div className="content-wrapper">
        <div className="container py-5">
          <div className="row justify-content-center">
            <div className="col-lg-8">
              {/* Header */}
              <div className="text-center mb-5">
                <h1 className="gradient-text mb-3">Wallet Dashboard</h1>
                <p className="text-muted">
                  Manage your credits and transactions
                </p>
              </div>

              {/* Balance Card */}
              <div
                className="card glass p-4 mb-4 text-center"
                style={{ background: "var(--primary-gradient)" }}
              >
                <div className="row align-items-center">
                  <div className="col-md-8">
                    <h3 className="text-white mb-2">Current Balance</h3>
                    <h1 className="text-white display-4 fw-bold">
                      {balance} credits
                    </h1>
                  </div>
                  <div className="col-md-4">
                    <div
                      className="wallet-icon"
                      style={{ fontSize: "4rem", opacity: 0.8 }}
                    >
                      💳
                    </div>
                  </div>
                </div>
              </div>

              {/* Error Alert */}
              {error && (
                <div
                  className="alert alert-danger alert-dismissible fade show mb-4"
                  role="alert"
                >
                  {error}
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setError("")}
                  ></button>
                </div>
              )}

              {/* Action Tabs */}
              <div className="card glass p-4 mb-4">
                <div className="d-flex gap-2 mb-4">
                  <button
                    className={`btn flex-fill ${
                      activeAction === "recharge"
                        ? "btn-primary"
                        : "btn-outline-primary"
                    }`}
                    onClick={() => setActiveAction("recharge")}
                  >
                    💰 Recharge
                  </button>
                  <button
                    className={`btn flex-fill ${
                      activeAction === "transfer"
                        ? "btn-primary"
                        : "btn-outline-primary"
                    }`}
                    onClick={() => setActiveAction("transfer")}
                  >
                    🔄 Transfer
                  </button>
                </div>

                {/* Recharge Form */}
                {activeAction === "recharge" && (
                  <div className="action-form">
                    <h5 className="mb-3">Add Credits to Wallet</h5>
                    <div className="row g-3 align-items-end">
                      <div className="col-md-6">
                        <label className="form-label">Amount to Recharge</label>
                        <input
                          type="number"
                          placeholder="Enter amount"
                          className="form-control"
                          value={rechargeAmount}
                          onChange={(e) => setRechargeAmount(e.target.value)}
                          min="1"
                        />
                      </div>
                      <div className="col-md-6">
                        <button
                          className="btn btn-success w-100"
                          onClick={handleRecharge}
                          disabled={
                            !rechargeAmount || parseInt(rechargeAmount) <= 0
                          }
                          style={{ height: "45px" }}
                        >
                          💳 Recharge Now
                        </button>
                      </div>
                    </div>
                    <div className="mt-3">
                      <small className="text-muted">
                        Quick recharge amounts:
                        <button
                          className="btn btn-sm btn-outline-secondary ms-2 me-1"
                          onClick={() => setRechargeAmount("100")}
                        >
                          100
                        </button>
                        <button
                          className="btn btn-sm btn-outline-secondary mx-1"
                          onClick={() => setRechargeAmount("500")}
                        >
                          500
                        </button>
                        <button
                          className="btn btn-sm btn-outline-secondary mx-1"
                          onClick={() => setRechargeAmount("1000")}
                        >
                          1000
                        </button>
                      </small>
                    </div>
                  </div>
                )}

                {/* Transfer Form */}
                {activeAction === "transfer" && (
                  <div className="action-form">
                    <h5 className="mb-3">Transfer Credits</h5>
                    <div className="row g-3">
                      <div className="col-md-6">
                        <label className="form-label">Recipient User ID</label>
                        <input
                          type="number"
                          placeholder="Enter User ID"
                          className="form-control"
                          value={transferToUserId}
                          onChange={(e) => setTransferToUserId(e.target.value)}
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Amount to Transfer</label>
                        <input
                          type="number"
                          placeholder="Enter amount"
                          className="form-control"
                          value={transferAmount}
                          onChange={(e) => setTransferAmount(e.target.value)}
                          min="1"
                          max={balance}
                        />
                      </div>
                      <div className="col-12">
                        <button
                          className="btn btn-primary w-100"
                          onClick={handleTransfer}
                          disabled={
                            !transferAmount ||
                            !transferToUserId ||
                            parseInt(transferAmount) <= 0 ||
                            parseInt(transferAmount) > balance
                          }
                          style={{ height: "45px" }}
                        >
                          🔄 Transfer Credits
                        </button>
                      </div>
                    </div>
                    {transferAmount > 0 && (
                      <div className="mt-3 p-3 bg-light rounded">
                        <small className="text-muted">
                          You will have{" "}
                          <strong>
                            {balance - parseInt(transferAmount || 0)}
                          </strong>{" "}
                          credits remaining after this transfer.
                        </small>
                      </div>
                    )}
                  </div>
                )}
              </div>
              {/* Quick Stats */}
              {transactions.length > 0 && (
                <div className="row mt-4">
                  <div className="col-md-4">
                    <div className="card glass text-center p-3">
                      <div className="text-success fw-bold fs-4">
                        +
                        {transactions
                          .filter((tx) => {
                            const desc = tx.description?.toLowerCase();
                            return (
                              desc?.includes("transfer from") ||
                              desc?.includes("recharge")
                            );
                          })
                          .reduce((sum, tx) => sum + tx.amount, 0)}
                      </div>
                      <small className="text-muted">Total Received</small>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="card glass text-center p-3">
                      <div className="text-danger fw-bold fs-4">
                        {transactions
                          .filter((tx) => {
                            const desc = tx.description?.toLowerCase();
                            return desc?.includes("transfer to");
                          })
                          .reduce((sum, tx) => sum + tx.amount, 0)}
                      </div>
                      <small className="text-muted">Total Sent</small>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="card glass text-center p-3">
                      <div className="text-primary fw-bold fs-4">
                        {transactions.length}
                      </div>
                      <small className="text-muted">Total Transactions</small>
                    </div>
                  </div>
                </div>
              )}

              <br></br>
              {/* Transaction History */}
              <div className="card glass p-4">
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h5 className="mb-0">Transaction History</h5>
                  <span className="badge bg-primary">
                    {transactions.length} transactions
                  </span>
                </div>

                {transactions.length === 0 ? (
                  <div className="text-center py-5">
                    <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>
                      💸
                    </div>
                    <h5 className="text-muted">No transactions yet</h5>
                    <p className="text-muted">
                      Your transaction history will appear here
                    </p>
                  </div>
                ) : (
                  <div
                    className="transaction-list"
                    style={{ maxHeight: "500px", overflowY: "auto" }}
                  >
                    {transactions
                      .slice()
                      .reverse()
                      .map((tx, idx) => (
                        <div
                          key={idx}
                          className="transaction-item card mb-3 border-0"
                        >
                          <div className="card-body">
                            <div className="row align-items-center">
                              <div className="col-auto">
                                <div
                                  className="transaction-icon d-flex align-items-center justify-content-center rounded-circle"
                                  style={{
                                    width: "50px",
                                    height: "50px",
                                    background: "var(--card-bg)",
                                    border: `2px solid ${getTransactionColor(
                                      tx.type,
                                      tx.description
                                    )}`,
                                    fontSize: "1.2rem",
                                  }}
                                >
                                  {getTransactionIcon(tx.type, tx.description)}
                                </div>
                              </div>
                              <div className="col">
                                <div className="d-flex justify-content-between align-items-start">
                                  <div>
                                    <h6
                                      className="mb-1"
                                      style={{ color: "var(--text-color)" }}
                                    >
                                      {getTransactionTitle(
                                        tx.type,
                                        tx.description
                                      )}
                                    </h6>
                                    <small className="text-muted">
                                      {tx.description}
                                    </small>
                                  </div>
                                  <div className="text-end">
                                    <div
                                      className="fw-bold fs-5"
                                      style={{
                                        color: getTransactionColor(
                                          tx.type,
                                          tx.description
                                        ),
                                      }}
                                    >
                                      {getAmountDisplay(
                                        tx.type,
                                        tx.amount,
                                        tx.description
                                      )}
                                    </div>
                                    <small className="text-muted">
                                      {new Date(
                                        tx.timestamp
                                      ).toLocaleDateString()}{" "}
                                      •{" "}
                                      {new Date(
                                        tx.timestamp
                                      ).toLocaleTimeString()}
                                    </small>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add some custom styles */}
      <style jsx>{`
        .wallet-icon {
          transition: transform 0.3s ease;
        }

        .wallet-icon:hover {
          transform: scale(1.1);
        }

        .transaction-item {
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .transaction-item:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
        }

        .action-form {
          animation: fadeIn 0.3s ease;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .gradient-text {
          background: linear-gradient(
            135deg,
            var(--primary-btn-bg),
            var(--link-color)
          );
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
      `}</style>
    </div>
  );
}
