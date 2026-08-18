// scripts/queryVehicle.js
async function main() {
  // <- update this if your deploy printed a different address
  const contractAddress = "0xb8B8c77326E92085256FA5aA7850Cf2Adb07C2f3";

  const [caller] = await ethers.getSigners();
  console.log("Using signer:", caller.address);

  const vr = await ethers.getContractAt(
    "VehicleRegistry",
    contractAddress,
    caller
  );

  const vehicleId = "KA01AB1234";
  console.log("Checking registration for:", vehicleId);

  const registered = await vr.isRegistered(vehicleId);
  if (!registered) {
    console.log("Vehicle not registered on this contract:", contractAddress);
    return;
  }

  // safe: this won't revert because we checked isRegistered
  const v = await vr.getVehicle(vehicleId);

  // v is a tuple: [vehicleId, owner, model, manufacturer, registeredAt, exists, ipfsDoc]
  // In ethers v6 registeredAt may be a BigInt-like type; convert with Number()
  const registeredAt = Number(v[4]);

  console.log({
    vehicleId: v[0],
    owner: v[1],
    model: v[2],
    manufacturer: v[3],
    registeredAt: new Date(registeredAt * 1000).toLocaleString(),
    exists: v[5],
    ipfsDoc: v[6],
  });
}

main().catch((e) => {
  console.error("Error:", e);
  process.exitCode = 1;
});
