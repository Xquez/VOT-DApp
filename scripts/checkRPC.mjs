// scripts/checkRPC.js
import { JsonRpcProvider } from "ethers";
async function main() {
  try {
    const provider = new JsonRpcProvider("http://127.0.0.1:8545");
    const n = await provider.getBlockNumber();
    console.log("RPC OK — blockNumber:", n);
  } catch (e) {
    console.error("RPC error:", e.message || e);
  }
}
main();
