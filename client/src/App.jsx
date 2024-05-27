import { useEffect, useState } from "react";
import { useSigner, useAddress } from "@thirdweb-dev/react";
import { Contract } from "@ethersproject/contracts";
import {
  message,
  Typography,
  Switch,
  Card,
  Badge,
  Space,
  Button,
  Input,
  Popconfirm,
  Result
} from "antd";
import {
  PlusCircleOutlined,
  ArrowRightOutlined,
  UserSwitchOutlined
} from "@ant-design/icons";
import "./App.css";

const contractAddress =
  import.meta.env.VITE_PIN_CONTROLLER_CONTRACT_ADDRESS ||
  "0xf7A218961DA9187BB43171F69581b511876b4d96";

const contractABI = [
  "event DeviceRegistered(uint256 indexed deviceId, address indexed owner)",
  "event DeviceOwnershipTransferred(address indexed previousOwner, address indexed newOwner)",
  "event DevicePinStatusChanged(uint256 indexed _deviceId, uint8 indexed pin, uint8 status)",
  "function currentDeviceId() view returns (uint256)",
  "function devices(uint256) view returns (uint256 id, address owner)",
  "function getDevicePinStatus(uint256 _deviceId, uint8 _pin) view returns (uint8)",
  "function registerDevice() returns (uint256)",
  "function setDevicePinStatus(uint256 _deviceId, uint8 _pin, uint8 _pinStatus)",
  "function transferDeviceOwnership(uint256 _deviceId, address _newOwner)"
];

const contract = new Contract(contractAddress, contractABI);

const supportedPins = [
  14, 15, 18, 23, 24, 25, 8, 7, 12, 16, 20, 21, 2, 3, 4, 17, 27, 22, 10, 9, 11,
  5, 6, 13, 19, 26
];

function App() {
  const [loading, setLoading] = useState({});
  const [deviceOwner, setDeviceOwner] = useState("");
  const [pinStates, setPinStates] = useState({});
  const [deviceId, setDeviceId] = useState(null);
  const [deviceIdInput, setDeviceIdInput] = useState(0);
  const [newOwner, setNewOwner] = useState("");

  const account = useAddress();
  const signer = useSigner();

  const handleRegisterDevice = async () => {
    if (!account || !signer) return message.error("Please connect your wallet");
    try {
      setLoading({ registerDevice: true });
      const tx = await contract.connect(signer).registerDevice();
      message.info(
        "Device registration transaction sent. Waiting for confirmation..."
      );
      const receipt = await tx.wait();
      console.log("receipt", receipt);
      // Access the return value from the receipt
      const deviceId = receipt?.events[0]?.args?.deviceId;
      console.log("deviceId", deviceId);
      message.success(`Device registered with ID: ${deviceId.toString()}`);
    } catch (err) {
      console.log("err registering device", err);
      message.error("Failed to register device");
    } finally {
      setLoading({ registerDevice: false });
    }
  };

  const handleSetPinStatus = async (pin, status) => {
    if (!account || !signer) return message.error("Please connect your wallet");
    if (deviceOwner?.toLowerCase() !== account.toLowerCase())
      return message.error("Only device owner can control these pins");
    try {
      setLoading({ [pin]: true });
      message.info("Sending pin status change transaction...");
      // +status converts boolean to number (0 or 1) since contract accepts (0 or 1) as status
      const tx = await contract
        .connect(signer)
        .setDevicePinStatus(deviceId, pin, +status);
      message.info(
        "Pin status change transaction sent. Waiting for confirmation..."
      );
      await tx.wait();
      message.success(`Pin ${pin} is now turned ${status ? "on" : "off"}`);
      setPinStates({ ...pinStates, [pin]: status });
    } catch (err) {
      console.log("err setting pin status", err);
      message.error("Failed to set pin status");
      setPinStates({ ...pinStates, [pin]: !status });
    } finally {
      setLoading({ [pin]: false });
    }
  };

  const handleTransferDeviceOwnership = async (newOwner) => {
    if (!account || !signer) return message.error("Please connect your wallet");
    if (!newOwner) return message.error("Please enter new owner address");
    try {
      setLoading({ transferOwnership: true });
      const tx = await contract
        .connect(signer)
        .transferDeviceOwnership(deviceId, newOwner);
      await tx.wait();
      message.success(`Device Ownership transferred to ${newOwner}`);
    } catch (err) {
      console.log("err transferring device ownership", err);
      message.error("Failed to transfer device ownership");
    } finally {
      setLoading({ transferOwnership: false });
    }
  };

  const getDeviceOwner = async () => {
    if (!signer) return;
    try {
      const device = await contract.connect(signer).devices(deviceId);
      setDeviceOwner(device?.owner);
    } catch (err) {
      console.log("err getting current device owner", err);
    }
  };

  const getDevicePinStates = async () => {
    if (!signer) return;
    message.info("Getting pin states from chain...");
    try {
      // should use promise all here without await
      const pinStates = {};
      for (let pin of supportedPins) {
        const status = await contract
          .connect(signer)
          .getDevicePinStatus(deviceId, pin);
        pinStates[pin] = status;
      }
      setPinStates(pinStates);
      console.log("pinStates", pinStates);
    } catch (err) {
      message.error("Failed to get some pin states");
      console.log("err getting pin states", err);
    }
  };

  useEffect(() => {
    if (deviceId === null) return;
    getDeviceOwner();
    // getPinStates();
  }, [signer, deviceId]);

  return (
    <div className="App">
      {account ? (
        <div>
          <Space>
            <Typography.Text strong>
              Set Control Panel for Device ID:{" "}
            </Typography.Text>
            <Input
              type="number"
              placeholder="Enter Device ID"
              value={deviceIdInput}
              onChange={(e) => setDeviceIdInput(e.target.value)}
              addonAfter={
                <ArrowRightOutlined
                  style={{ cursor: "pointer", color: "blue" }}
                  onClick={() => {
                    if (
                      deviceIdInput === "" ||
                      isNaN(deviceIdInput) ||
                      deviceIdInput < 0
                    )
                      return message.error("Please enter a valid device ID");
                    setDeviceId(deviceIdInput);
                    setLoading({});
                    setPinStates({});
                    message.info(
                      `Control Panel is now set for Device: ${deviceIdInput}`
                    );
                  }}
                />
              }
            />
            <Button
              type="primary"
              title="Register a new device"
              style={{
                float: "right"
              }}
              onClick={handleRegisterDevice}
              loading={loading.registerDevice || false}
              icon={<PlusCircleOutlined />}
            >
              Device
            </Button>
          </Space>
          {deviceId != null ? (
            <Card
              style={{ marginTop: "20px", maxWidth: "1220px" }}
              title={`Control Panel for Device ID: ${deviceId}`}
              bordered
              extra={
                <Space>
                  <Typography.Text
                    title="Pro Tip: Only Device owner can control these pins"
                    strong
                  >
                    Owner:{" "}
                    {deviceOwner?.slice(0, 6) + "..." + deviceOwner?.slice(-4)}
                  </Typography.Text>
                  {deviceOwner?.toLowerCase() === account.toLowerCase() && (
                    <Popconfirm
                      title={
                        <div>
                          <label>Transfer Device Ownership</label>
                          <Input
                            type="text"
                            placeholder="Enter new owner address"
                            onChange={(e) => setNewOwner(e.target.value)}
                          />
                        </div>
                      }
                      onConfirm={() => handleTransferDeviceOwnership(newOwner)}
                    >
                      <Button
                        type="primary"
                        icon={<UserSwitchOutlined />}
                        title="Transfer Ownership"
                        shape="circle"
                      />
                    </Popconfirm>
                  )}
                </Space>
              }
            >
              <div
                className="pin-container"
                style={{ display: "flex", flexWrap: "wrap" }}
              >
                {supportedPins.map((pin, index) => (
                  <div
                    key={index}
                    className="pin-item"
                    style={{ width: "20%", marginBottom: "10px" }}
                  >
                    <Switch
                      size="default"
                      loading={loading[pin] || false}
                      checkedChildren="On"
                      unCheckedChildren="Off"
                      checked={pinStates[pin] || false}
                      onChange={(checked) => handleSetPinStatus(pin, checked)}
                    />
                    <Badge
                      count={pin}
                      style={{
                        backgroundColor: pinStates[pin] ? "green" : "red",
                        marginLeft: "10px"
                      }}
                    />
                  </div>
                ))}
              </div>
            </Card>
          ) : (
            <Result
              status="info"
              title="Control panel is not set for any device yet"
              extra={
                <h3>
                  {" "}
                  Please enter a valid device ID to set control panel for or
                  register a new device and set control panel for it
                </h3>
              }
            />
          )}
        </div>
      ) : (
        <div className="hero-section">
          <h1>
            Welcome to{" "}
            <p
              style={{
                color: "blue",
                display: "inline",
                fontWeight: "bold",
                fontSize: "1.5em"
              }}
            >
              DePIN Raspi Connect
            </p>
          </h1>
          <h2>
            Decentralized Smart Home IoT platform that allows you to control
            Raspberry PI GPIO pins using blockchain
          </h2>
          <h2>Please connect your wallet to get started!</h2>
        </div>
      )}
    </div>
  );
}

export default App;
