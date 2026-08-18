// frontend/src/components/VerifyVehicle.jsx
import { useState } from "react";
import { ethers } from "ethers";
import { CONTRACT_ABI, CONTRACT_ADDRESS } from "../constants";

/*
  Dark-themed VerifyVehicle component
  - provider: ethers BrowserProvider passed from App
  - inline status messages, safe BigInt handling
*/

export default function VerifyVehicle({ provider }) {
  const [vehicleId, setVehicleId] = useState("");
  const [info, setInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);

  const clearStatusLater = () => {
    setTimeout(() => setStatus(null), 5000);
  };

  const shorten = (addr) => {
    if (!addr) return "";
    return addr.slice(0, 6) + "..." + addr.slice(-4);
  };

  const handleVerify = async () => {
    setInfo(null);
    if (!vehicleId.trim()) {
      setStatus({ type: "error", text: "Please enter a Vehicle ID to verify." });
      clearStatusLater();
      return;
    }

    if (!provider) {
      setStatus({ type: "error", text: "Please connect MetaMask first." });
      clearStatusLater();
      return;
    }

    setLoading(true);
    setStatus({ type: "info", text: "Querying blockchain..." });

    try {
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);

      const exists = await contract.isRegistered(vehicleId.trim());
      if (!exists) {
        setStatus({ type: "error", text: "Vehicle not found." });
        setLoading(false);
        clearStatusLater();
        return;
      }

      const v = await contract.getVehicle(vehicleId.trim());
      // v[4] is uint256 timestamp; convert safely
      const registeredAtSec = Number(v[4]);
      const registeredAt = new Date(registeredAtSec * 1000).toLocaleString();

      setInfo({
        vehicleId: v[0],
        owner: v[1],
        ownerShort: shorten(v[1]),
        model: v[2],
        manufacturer: v[3],
        registeredAt,
        ipfsDoc: v[6] || "—",
      });

      setStatus({ type: "success", text: "Vehicle found" });
    } catch (err) {
      console.error(err);
      const m = err?.data?.message || err?.message || String(err);
      setStatus({ type: "error", text: "Verify failed: " + m });
    } finally {
      setLoading(false);
      clearStatusLater();
    }
  };

  return (
    <div style={{
      padding: 16,
      borderRadius: 10,
      background: "#0f1724",
      border: "1px solid #1f2937",
      color: "#e6eef8",
      boxShadow: "0 4px 18px rgba(2,6,23,0.6)"
    }}>
      <h3 style={{ marginTop: 0, marginBottom: 12, color: "#f8fafc" }}>Verify Vehicle</h3>

      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <input
          placeholder="Vehicle ID (e.g. KA01AB1234)"
          value={vehicleId}
          onChange={(e) => setVehicleId(e.target.value)}
          style={{
            padding: 10,
            flex: 1,
            background: "#071025",
            color: "#f8fafc",
            border: "1px solid #23303b",
            borderRadius: 8,
            outline: "none",
          }}
        />
        <button
          onClick={handleVerify}
          disabled={loading}
          style={{
            padding: "10px 14px",
            borderRadius: 8,
            border: "none",
            cursor: loading ? "not-allowed" : "pointer",
            background: loading ? "#334155" : "#0ea5e9",
            color: "#001219",
            fontWeight: 600,
            minWidth: 120,
            transition: "all 0.18s ease",
          }}
        >
          {loading ? "Checking..." : "Verify"}
        </button>
      </div>

      {status && (
        <div style={{ marginTop: 4 }}>
          <small style={{
            color:
              status.type === "error" ? "#fca5a5" :
              status.type === "success" ? "#86efac" : "#93c5fd"
          }}>
            {status.text}
          </small>
        </div>
      )}

      {info && (
        <div style={{ marginTop: 14, padding: 12, borderRadius: 8, background: "#071025", border: "1px solid #23303b" }}>
          <p style={{ margin: "6px 0", color: "#cfe8ff" }}><strong>Vehicle ID:</strong> {info.vehicleId}</p>
          <p style={{ margin: "6px 0", color: "#cfe8ff" }}>
            <strong>Owner:</strong> <span style={{ color: "#9fe6ff" }}>{info.ownerShort}</span>
            <span style={{ marginLeft: 8, color: "#94a3b8", fontSize: 12 }}>{info.owner}</span>
          </p>
          <p style={{ margin: "6px 0", color: "#cfe8ff" }}><strong>Model:</strong> {info.model}</p>
          <p style={{ margin: "6px 0", color: "#cfe8ff" }}><strong>Manufacturer:</strong> {info.manufacturer}</p>
          <p style={{ margin: "6px 0", color: "#cfe8ff" }}><strong>Registered At:</strong> {info.registeredAt}</p>
          {/* <p style={{ margin: "6px 0", color: "#cfe8ff" }}><strong>IPFS doc:</strong> {info.ipfsDoc}</p> */}
        </div>
      )}
    </div>
  );
}
