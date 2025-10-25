const { expect } = require("chai");

describe("VehicleRegistry", function () {
  it("registers and transfers vehicle", async function () {
    const [admin, alice, bob] = await ethers.getSigners();

    const VR = await ethers.getContractFactory("VehicleRegistry");
    // deploy with admin signer
    const vr = await VR.connect(admin).deploy();
    // ethers v6: wait for deployment
    await vr.waitForDeployment();

    // register vehicle as admin
    await vr
      .connect(admin)
      .registerVehicle("KA01AB1234", alice.address, "ModelA", "Maker", "");
    const v1 = await vr.getVehicle("KA01AB1234");
    expect(v1[1]).to.equal(alice.address);

    // transfer by owner (alice) to bob
    await vr.connect(alice).transferOwnership("KA01AB1234", bob.address);
    const v2 = await vr.getVehicle("KA01AB1234");
    expect(v2[1]).to.equal(bob.address);
  });
});

// VehicleRegistry deployed to: 0x5FbDB2315678afecb367f032d93F642f64180aa3