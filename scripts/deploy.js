// scripts/deploy.js
async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  const VehicleRegistry = await ethers.getContractFactory("VehicleRegistry");
  const vr = await VehicleRegistry.deploy();

  // ethers v6 / hardhat-toolbox: wait for the deployment like this
  await vr.waitForDeployment();

  // getAddress() works in ethers v6 to retrieve contract address
  const deployedAddress = await vr.getAddress();
  console.log("VehicleRegistry deployed to:", deployedAddress);

  // optional: register a sample vehicle (only admin can call)
  // const tx = await vr.registerVehicle("KA01AB1234", deployer.address, "ModelX", "ManufacturerY", "");
  // await tx.wait();
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
