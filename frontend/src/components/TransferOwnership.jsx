// frontend/src/components/TransferOwnership.jsx
import { useState } from "react";
import { ethers } from "ethers";
import { CONTRACT_ABI, CONTRACT_ADDRESS } from "../constants";

/*
  Dark-themed TransferOwnership component
  - input validation, disable button while tx pending
  - inline status messages
*/

export default function TransferOwnership({ provider }) {
  const [vehicleId, setVehicleId] = useState("");
  const [newOwner, setNewOwner] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);

  const clearStatusLater = () => {
    setTimeout(() => setStatus(null), 5000);
  };

  // basic Ethereum address validator (ethers v6)
  const isValidAddress = (addr) => {
    try {
      return ethers.isAddress(addr);
    } catch {
      return false;
    }
  };

  const handleTransfer = async () => {
    if (!vehicleId.trim() || !newOwner.trim()) {
      setStatus({ type: "error", text: "Please fill Vehicle ID and New Owner address." });
      clearStatusLater();
      return;
    }

    if (!isValidAddress(newOwner.trim())) {
      setStatus({ type: "error", text: "New owner address is not a valid Ethereum address." });
      clearStatusLater();
      return;
    }

    if (!provider) {
      setStatus({ type: "error", text: "Please connect MetaMask first." });
      clearStatusLater();
      return;
    }

    setLoading(true);
    setStatus({ type: "info", text: "Confirm transfer in MetaMask..." });

    try {
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

      const tx = await contract.transferOwnership(vehicleId.trim(), newOwner.trim());
      setStatus({
        type: "info",
        text: `Transaction sent — waiting for confirmation (${tx.hash.slice(0,10)}...)`,
        txHash: tx.hash,
      });

      await tx.wait();

      setStatus({ type: "success", text: `Ownership transferred ✓ Tx: ${tx.hash}` });
      setVehicleId("");
      setNewOwner("");
    } catch (err) {
      console.error(err);
      const msg = err?.data?.message || err?.message || String(err);
      setStatus({ type: "error", text: `Transfer failed: ${msg}` });
    } finally {
      setLoading(false);
      clearStatusLater();
    }
  };

  return (
    <div style={{
      padding: 16,
      borderRadius: 10,
      background: "#0f1724",      // deep dark (matches Register)
      border: "1px solid #1f2937",
      color: "#e6eef8",
      boxShadow: "0 4px 18px rgba(2,6,23,0.6)"
    }}>
      <h3 style={{ marginTop: 0, marginBottom: 12, color: "#f8fafc" }}>Transfer Ownership</h3>

      <div style={{ marginBottom: 10 }}>
        <input
          placeholder="Vehicle ID (e.g. KA01AB1234)"
          value={vehicleId}
          onChange={(e) => setVehicleId(e.target.value)}
          style={{
            padding: 10,
            width: "100%",
            background: "#071025",
            color: "#f8fafc",
            border: "1px solid #23303b",
            borderRadius: 8,
            outline: "none",
          }}
        />
      </div>

      <div style={{ marginBottom: 14 }}>
        <input
          placeholder="New owner address (0x...)"
          value={newOwner}
          onChange={(e) => setNewOwner(e.target.value)}
          style={{
            padding: 10,
            width: "100%",
            background: "#071025",
            color: "#f8fafc",
            border: "1px solid #23303b",
            borderRadius: 8,
            outline: "none",
          }}
        />
      </div>

      <div>
        <button
          onClick={handleTransfer}
          disabled={loading}
          style={{
            padding: "10px 14px",
            borderRadius: 8,
            border: "none",
            cursor: loading ? "not-allowed" : "pointer",
            background: loading ? "#334155" : "#0ea5e9",
            color: "#001219",
            fontWeight: 600,
            minWidth: 160,
            transition: "all 0.18s ease",
          }}
        >
          {loading ? "Processing..." : "Transfer Ownership"}
        </button>
      </div>

      {status && (
        <div style={{ marginTop: 12 }}>
          <small
            style={{
              color:
                status.type === "error"
                  ? "#f87171"
                  : status.type === "success"
                  ? "#4ade80"
                  : "#60a5fa",
            }}
          >
            {status.text}
          </small>
          {/* Show Etherscan link if txHash exists */}
          {status.txHash && (
            <div style={{ marginTop: 4 }}>
              <a
                href={`https://sepolia.etherscan.io/tx/${status.txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "#60a5fa", fontSize: 12 }}
              >
                View on Etherscan
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
