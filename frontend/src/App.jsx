import { useEffect, useState } from "react";
import { ethers } from "ethers";
import RegisterVehicle from "./components/RegisterVehicle";
import TransferOwnership from "./components/TransferOwnership";
import VerifyVehicle from "./components/VerifyVehicle";

function App() {
  const [provider, setProvider] = useState(null);
  const [account, setAccount] = useState(null);

  useEffect(() => {
    if (window.ethereum) {
      const p = new ethers.BrowserProvider(window.ethereum); // ethers v6 BrowserProvider
      setProvider(p);
      window.ethereum.on("accountsChanged", (accounts) => {
        setAccount(accounts[0] || null);
      });
    }
  }, []);

  const connectWallet = async () => {
    if (!window.ethereum) return alert("Install MetaMask");
    await window.ethereum.request({ method: "eth_requestAccounts" });
    const p = new ethers.BrowserProvider(window.ethereum);
    setProvider(p);
    const signer = await p.getSigner();
    const address = signer.address;
    setAccount(address);
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Vehicle Ownership Tracker DApp</h1>
      <div>Wallet: {account ? account : <button onClick={connectWallet}>Connect MetaMask</button>}</div>
      <hr />
      <RegisterVehicle provider={provider} />
      <hr />
      <TransferOwnership provider={provider} />
      <hr />
      <VerifyVehicle provider={provider} />      
    </div>
  );
}

export default App;
