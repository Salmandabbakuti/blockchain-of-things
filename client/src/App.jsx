import { useEffect, useState } from "react";
import { useSigner, useAddress } from "@thirdweb-dev/react";
import { Contract } from "@ethersproject/contracts";
import { message } from "antd";
import "./App.css";

const contractAddress = "0x2239CaF0A0d35c83dE8eF2b28879DC20F7047ef7";

const contractABI = [
  "event PinStatusChanged(uint8 pin, uint8 status)",
  "function pinStatus(uint8) view returns (uint8)",
  "function owner() view returns (address)",
  "function setPinStatus(uint8 _pin, uint8 _pinStatus)",
  "function transferOwnership(address _newOwner)"
];

const contract = new Contract(contractAddress, contractABI);

const supportedPins = [
  14, 15, 18, 23, 24, 25, 8, 7, 12, 16, 20, 21, 2, 3, 4, 17, 27, 22, 10, 9, 11,
  5, 6, 13, 19, 26
];

function App() {
  const [logMessage, setLogMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentOwner, setCurrentOwner] = useState("");

  const account = useAddress();
  const signer = useSigner();

  const handleSetPinStatus = async (pin, status) => {
    if (!account || !signer) return message.error("Please connect your wallet");
    try {
      setLoading(true);
      // +status converts boolean to number (0 or 1) since contract accepts (0 or 1) as status
      const tx = await contract.connect(signer).setPinStatus(pin, +status);
      await tx.wait();
      setLogMessage(`Pin ${pin} status changed to ${status}`);
    } catch (err) {
      console.log("err setting pin status", err);
      message.error("Failed to set pin status");
    } finally {
      setLoading(false);
    }
  };

  const handleTransferOwnership = async (newOwner) => {
    if (!account || !signer) return message.error("Please connect your wallet");
    try {
      setLoading(true);
      const tx = await contract.connect(signer).transferOwnership(newOwner);
      await tx.wait();
      setLogMessage(`Ownership transferred to ${newOwner}`);
    } catch (err) {
      console.log("err transferring ownership", err);
      message.error("Failed to transfer ownership");
    } finally {
      setLoading(false);
    }
  };

  const getCurrentOwner = async () => {
    if (!signer) return;
    try {
      const owner = await contract.connect(signer).owner();
      setCurrentOwner(owner);
    } catch (err) {
      console.log("err getting current owner", err);
    }
  };

  useEffect(() => {
    if (signer) getCurrentOwner();
  }, [signer]);

  return (
    <div className="App">
      <h1>Hello Vite + React!</h1>
      <p>Current owner: {currentOwner}</p>
    </div>
  );
}

export default App;
