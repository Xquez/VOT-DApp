// scripts/registerViaNode.js
async function main() {
  // update this address if you redeploy and get a new one
  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

  const [deployer] = await ethers.getSigners();
  console.log("Using deployer:", deployer.address);

  const vr = await ethers.getContractAt(
    "VehicleRegistry",
    contractAddress,
    deployer
  );

  console.log("Registering via Node...");
  const tx = await vr.registerVehicle(
    "KA01NODE123",
    deployer.address,
    "NodeModel",
    "MakerCo",
    ""
  );
  const receipt = await tx.wait();
  console.log("Transaction mined. Hash:", receipt.transactionHash);
}

main().catch((e) => {
  console.error("Error in script:", e);
  process.exitCode = 1;
});
