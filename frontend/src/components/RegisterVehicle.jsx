// frontend/src/components/RegisterVehicle.jsx
import { useState } from "react";
import { ethers } from "ethers";
import { CONTRACT_ABI, CONTRACT_ADDRESS } from "../constants";

/*
  Dark-themed RegisterVehicle component
  - input validation, disable button while tx pending
  - inline status messages
*/

export default function RegisterVehicle({ provider }) {
  const [vehicleId, setVehicleId] = useState("");
  const [model, setModel] = useState("");
  const [manufacturer, setManufacturer] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null); // { type: 'info'|'success'|'error', text }

  const clearStatusLater = () => {
    setTimeout(() => setStatus(null), 5000);
  };

  const handleRegister = async () => {
    if (!vehicleId.trim() || !model.trim() || !manufacturer.trim()) {
      setStatus({ type: "error", text: "Please fill Vehicle ID, Model and Manufacturer." });
      clearStatusLater();
      return;
    }

    if (!provider) {
      setStatus({ type: "error", text: "Please connect MetaMask first." });
      clearStatusLater();
      return;
    }

    setLoading(true);
    setStatus({ type: "info", text: "Waiting for MetaMask confirmation..." });

    try {
      const signer = await provider.getSigner();
      const signerAddress = signer.address ?? (await signer.getAddress());
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

      const tx = await contract.registerVehicle(
        vehicleId.trim(),
        signerAddress,
        model.trim(),
        manufacturer.trim(),
        ""
      );

      setStatus({
        type: "info",
        text: `Sent — waiting confirmation (${tx.hash.slice(0,10)}...)`,
        txHash: tx.hash
      });

      await tx.wait();

      setStatus({ type: "success", text: `Registered ✓ Tx: ${tx.hash}`, txHash: tx.hash });

      setVehicleId("");
      setModel("");
      setManufacturer("");
    } catch (err) {
      console.error(err);
      const msg = err?.data?.message || err?.message || String(err);
      setStatus({ type: "error", text: `Registration failed: ${msg}` });
    } finally {
      setLoading(false);
      clearStatusLater();
    }
  };

  return (
    <div style={{
      padding: 16,
      borderRadius: 10,
      background: "#0f1724",      // deep dark
      border: "1px solid #1f2937",
      color: "#e6eef8",
      boxShadow: "0 4px 18px rgba(2,6,23,0.6)"
    }}>
      <h3 style={{ marginTop: 0, marginBottom: 12, color: "#f8fafc" }}>Register Vehicle (Admin)</h3>

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

      <div style={{ marginBottom: 10 }}>
        <input
          placeholder="Model"
          value={model}
          onChange={(e) => setModel(e.target.value)}
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
          placeholder="Manufacturer"
          value={manufacturer}
          onChange={(e) => setManufacturer(e.target.value)}
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
          onClick={handleRegister}
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
          {loading ? "Processing..." : "Register Vehicle"}
        </button>
      </div>

      {status && (
        <div style={{ marginTop: 12 }}>
          <small style={{
            color:
              status.type === "error" ? "#fca5a5" :
              status.type === "success" ? "#86efac" : "#93c5fd"
          }}>
            {status.text}
          </small>

          {status.txHash && (
            <div style={{ marginTop: 8 }}>
              <a
                href={`https://sepolia.etherscan.io/tx/${status.txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "#93c5fd", textDecoration: "underline", fontSize: 13 }}
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
