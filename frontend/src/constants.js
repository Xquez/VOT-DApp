// frontend/src/constants.js
// export const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; // <-- replace if different
export const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS || "0x0000000000000000000000000000000000000000";

// If you created src/abi.json (recommended), import it:
import abiJson from "./abi.json";
export const CONTRACT_ABI = abiJson.abi || abiJson;

// 0x5FbDB2315678afecb367f032d93F642f64180aa3
// 0xb8B8c77326E92085256FA5aA7850Cf2Adb07C2f3