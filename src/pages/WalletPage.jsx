import { useEffect, useState } from "react";
import { ENDPOINTS } from "../api/endpoints";

export default function WalletPage() {
  const user = JSON.parse(localStorage.getItem("user"));
  const userId = user?.id;
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

  const [balance, setBalance] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [rechargeAmount, setRechargeAmount] = useState("");
  const [transferAmount, setTransferAmount] = useState("");
  const [transferToUserId, setTransferToUserId] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  // Fetch balance and transactions
  const fetchWalletData = async () => {
    try {
      // const balanceRes = await fetch( `http://localhost:8080/api/wallet/balance/${userId}`, { headers });
      const balanceRes = await fetch(ENDPOINTS.WALLET_BALANCE(userId), {
        headers,
      });
      if (!balanceRes.ok) throw new Error("Failed to fetch balance");
      const balanceData = await balanceRes.json();
      setBalance(balanceData);

      // const txRes = await fetch(`http://localhost:8080/api/transactions/${userId}`,{ headers });
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
    if (!rechargeAmount || parseInt(rechargeAmount) <= 0) return;
    try {
      // const res = await fetch("http://localhost:8080/api/wallet/recharge", {
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
      fetchWalletData();
    } catch (err) {
      setError(err.message);
    }
  };

  // Transfer handler
  const handleTransfer = async () => {
    if (!transferAmount || !transferToUserId) return;
    try {
      // const res = await fetch("http://localhost:8080/api/wallet/transfer", {
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
      fetchWalletData();
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <div className="container mt-5">Loading wallet...</div>;
  if (error) return <div className="container mt-5 text-danger">{error}</div>;

  return (
    <div className="container mt-5" style={{ maxWidth: "700px" }}>
      <h2 className="mb-4 text-center">Wallet Dashboard</h2>

      {/* Balance */}
      <div className="card bg-light p-3 mb-4 border-0">
        <h4 className="text-center">
          Current Balance:{" "}
          <span className="text-success fw-bold">{balance} credits</span>
        </h4>
      </div>

      {/* Recharge */}
      <div className="card p-4 shadow-sm border-0 mb-4">
        <h5>Recharge Wallet</h5>
        <div className="d-flex gap-2 mt-2">
          <input
            type="number"
            placeholder="Enter amount"
            className="form-control"
            value={rechargeAmount}
            onChange={(e) => setRechargeAmount(e.target.value)}
          />
          <button
            className="btn btn-success"
            onClick={handleRecharge}
            disabled={!rechargeAmount || parseInt(rechargeAmount) <= 0}
          >
            Recharge
          </button>
        </div>
      </div>

      {/* Transfer */}
      <div className="card shadow p-4 mb-4">
        <h5>Transfer Credits</h5>
        <div className="d-flex gap-2 mt-2">
          <input
            type="number"
            placeholder="To User ID"
            className="form-control"
            value={transferToUserId}
            onChange={(e) => setTransferToUserId(e.target.value)}
          />
          <input
            type="number"
            placeholder="Amount"
            className="form-control"
            value={transferAmount}
            onChange={(e) => setTransferAmount(e.target.value)}
          />
          <button
            className="btn btn-primary"
            onClick={handleTransfer}
            disabled={!transferAmount || !transferToUserId}
          >
            Transfer
          </button>
        </div>
      </div>

      {/* Transaction History */}
      <div className="card p-4 shadow-sm border-0">
        <h5>Transaction History</h5>
        {transactions.length === 0 ? (
          <p className="text-muted mt-3">No transactions yet.</p>
        ) : (
          <div
            className="table-responsive mt-3"
            style={{ maxHeight: "300px", overflowY: "auto" }} // <-- added scroll
          >
            <table className="table table-striped table-hover align-middle">
              <thead
                className="table-primary"
                style={{ position: "sticky", top: 0, zIndex: 1 }}
              >
                <tr>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>Description</th>
                  <th>Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {transactions
                  .slice() // create a shallow copy so we don't mutate the original
                  .reverse() // reverse the order (newest first)
                  .map((tx, idx) => (
                    <tr key={idx}>
                      <td>{tx.type}</td>
                      <td>{tx.amount}</td>
                      <td>{tx.description}</td>
                      <td>{new Date(tx.timestamp).toLocaleString()}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
