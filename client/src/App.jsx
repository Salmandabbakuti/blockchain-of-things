import { useState } from "react";
import { BrowserProvider } from "ethers";
import { useAppKitProvider, useAppKitAccount } from "@reown/appkit/react";
import {
  message,
  Typography,
  Switch,
  Card,
  Button,
  Input,
  Row,
  Col,
  Descriptions,
  Empty,
  Badge,
  Statistic,
  Space,
  Tag,
  Tooltip
} from "antd";
import { LoginOutlined, ReloadOutlined } from "@ant-design/icons";
import {
  supportedPins,
  contract,
  CONTRACT_ADDRESS,
  EXPLORER_URL
} from "./utils";
import "./App.css";

export default function App() {
  const [loading, setLoading] = useState({});
  const [pinStates, setPinStates] = useState({});
  const [deviceId, setDeviceId] = useState(null);
  const [deviceIdInput, setDeviceIdInput] = useState("");

  const { address: account, caipAddress } = useAppKitAccount();
  const selectedChainId = caipAddress?.split(":")?.[1];
  const { walletProvider } = useAppKitProvider("eip155");

  const activePins = supportedPins.filter((pin) => pinStates[pin]).length;

  const deviceDetailItems = [
    {
      key: "id",
      label: "Device ID",
      children: (
        <Typography.Text strong copyable={{ text: deviceId }}>
          #{deviceId}
        </Typography.Text>
      )
    },
    {
      key: "owner",
      label: "Owner",
      children: (
        <Typography.Text strong copyable={{ text: account }}>
          {account?.slice(0, 6)}...{account?.slice(-6)}
        </Typography.Text>
      )
    },
    {
      key: "contract",
      label: "Contract",
      children: (
        <Space size="small">
          <a
            href={`${EXPLORER_URL}/address/${CONTRACT_ADDRESS}`}
            target="_blank"
            rel="noreferrer"
          >
            {CONTRACT_ADDRESS.slice(0, 6)}...{CONTRACT_ADDRESS.slice(-6)}
          </a>
          <Tag color="blue">Sepolia</Tag>
        </Space>
      )
    }
  ];

  const pinActivityItems = [
    {
      key: "all",
      children: (
        <Statistic
          title="All"
          value={supportedPins.length}
          styles={{ content: { color: "#1677ff", fontWeight: 700 } }}
        />
      )
    },
    {
      key: "active",
      children: (
        <Statistic
          title="Active"
          value={activePins}
          styles={{ content: { color: "#52c41a", fontWeight: 700 } }}
        />
      )
    },
    {
      key: "inactive",
      children: (
        <Statistic
          title="Inactive"
          value={supportedPins.length - activePins}
          styles={{ content: { color: "red", fontWeight: 700 } }}
        />
      )
    }
  ];

  const loadDevice = async () => {
    if (deviceIdInput === "" || isNaN(deviceIdInput) || deviceIdInput < 0) {
      return message.error("Enter a valid device ID");
    }
    if (!walletProvider) return message.error("Please connect your wallet");
    if (selectedChainId !== "11155111") {
      return message.error("Please switch to the Sepolia network");
    }

    try {
      setLoading({ device: true });
      const provider = new BrowserProvider(walletProvider);
      const deviceBitmapRes = await contract
        .connect(provider)
        .deviceBitmaps(account, deviceIdInput);
      const deviceBitmap = Number(deviceBitmapRes); // Convert BigInt to Number for faster bitwise operations
      const nextPinStates = {};
      for (const pin of supportedPins) {
        nextPinStates[pin] = ((deviceBitmap >> pin) & 1) === 1;
      }
      setDeviceId(deviceIdInput);
      setPinStates(nextPinStates);
      message.success(`Device ${deviceIdInput} loaded`);
    } catch (err) {
      console.log("err loading device", err);
      message.error(
        "Could not load this device. Check the network and device ID."
      );
    } finally {
      setLoading({});
    }
  };

  const handleSetPinStatus = async (pin, status) => {
    if (!account || !walletProvider)
      return message.error("Please connect your wallet");
    if (selectedChainId !== "11155111")
      return message.error("Please switch to sepolia network");

    setLoading((prev) => ({ ...prev, [pin]: true }));
    try {
      message.info("Sending pin status change transaction...");
      // +status converts boolean to number (0 or 1) since contract accepts (0 or 1) as status
      const ethersProvider = new BrowserProvider(walletProvider);
      const signer = await ethersProvider.getSigner();
      const tx = await contract
        .connect(signer)
        .setDevicePinStatus(deviceId, pin, +status);
      message.info(
        "Pin status change transaction sent. Waiting for confirmation..."
      );
      await tx.wait();
      message.success(`Pin ${pin} is now turned ${status ? "on" : "off"}`);
      setPinStates((prev) => ({ ...prev, [pin]: status }));
    } catch (err) {
      console.log("err setting pin status", err);
      message.error(
        `Failed to set pin ${pin} status: ${err?.reason || err?.message || "Unknown error"}`
      );
      setPinStates((prev) => ({ ...prev, [pin]: !status }));
    } finally {
      setLoading((prev) => ({ ...prev, [pin]: false }));
    }
  };

  const handleResetPins = async () => {
    if (deviceId === null) return message.error("Load a device first");
    if (!account || !walletProvider)
      return message.error("Please connect your wallet");
    if (selectedChainId !== "11155111")
      return message.error("Please switch to sepolia network");
    setLoading((prev) => ({ ...prev, reset: true }));

    try {
      const ethersProvider = new BrowserProvider(walletProvider);
      const signer = await ethersProvider.getSigner();
      const tx = await contract.connect(signer).resetDeviceBitmap(deviceId);
      await tx.wait();
      setPinStates({}); // Reset pin states locally
      message.success("Device pin states reset successfully");
    } catch (err) {
      console.log("err resetting pins", err);
      message.error(
        `Failed to reset pins: ${err?.reason || err?.message || "Unknown error"}`
      );
    } finally {
      setLoading((prev) => ({ ...prev, reset: false }));
    }
  };

  return (
    <div className="App">
      {account ? (
        <div className="dashboard-container">
          <Card>
            <section className="console-header" aria-labelledby="console-title">
              <div>
                <span className="eyebrow">DEVICE CONSOLE</span>
                <h2 id="console-title">GPIO control, recorded on-chain.</h2>
                <p>
                  Load device to read or update the pin map associated with your
                  connected wallet.
                </p>
              </div>
              <div className="device-loader">
                <label htmlFor="device-id">Device ID</label>
                <Space.Compact>
                  <Input
                    id="device-id"
                    size="large"
                    inputMode="numeric"
                    type="number"
                    min="0"
                    placeholder="e.g. 7"
                    value={deviceIdInput}
                    onChange={(e) => setDeviceIdInput(e.target.value)}
                    onPressEnter={loadDevice}
                  />
                  <Button
                    type="primary"
                    size="large"
                    title="Load device"
                    icon={<LoginOutlined />}
                    loading={loading.device}
                    onClick={loadDevice}
                  />
                </Space.Compact>
              </div>
            </section>
            {deviceId !== null ? (
              <>
                <section
                  className="overview-cards"
                  aria-label="Device overview"
                >
                  <Row gutter={[16, 16]}>
                    <Col xs={24} md={12}>
                      <Card
                        size="small"
                        title="Device Info"
                        variant="borderless"
                        style={{ height: "100%" }}
                      >
                        <Descriptions
                          colon={false}
                          column={{ xs: 2 }}
                          items={deviceDetailItems}
                          layout="vertical"
                          size="small"
                        />
                      </Card>
                    </Col>
                    <Col xs={24} md={12}>
                      <Card
                        size="small"
                        title="Pin Activity"
                        variant="borderless"
                        style={{ height: "100%" }}
                      >
                        <Descriptions
                          colon={false}
                          column={3}
                          items={pinActivityItems}
                          layout="vertical"
                          size="small"
                        />
                      </Card>
                    </Col>
                  </Row>
                </section>
                <div className="pins-heading">
                  <div className="pins-heading-content">
                    <h3>Pin controls</h3>
                    <p>
                      Each change sends a transaction, then your listener can
                      update the Raspberry Pi.{" "}
                      <Typography.Link
                        href="https://github.com/Salmandabbakuti/blockchain-of-things#3-start-the-event-listener"
                        target="_blank"
                        rel="noreferrer"
                      >
                        Learn more
                      </Typography.Link>
                    </p>
                  </div>
                  <Tooltip title="Use this when the physical device is out of sync or has restarted">
                    <Button
                      type="primary"
                      icon={<ReloadOutlined />}
                      shape="round"
                      onClick={handleResetPins}
                      loading={loading.reset}
                    >
                      Reset
                    </Button>
                  </Tooltip>
                </div>
                <Row gutter={[8, 8]}>
                  {supportedPins.map((pin) => (
                    <Col key={pin} xs={12} sm={8} md={6} lg={4} xl={3}>
                      <Card
                        title="GPIO"
                        extra={<Typography.Text strong>{pin}</Typography.Text>}
                        hoverable
                        size="small"
                        styles={{
                          root: {
                            borderColor: loading[pin]
                              ? "#faad14"
                              : pinStates[pin]
                                ? "#52c41a"
                                : "#d9d9d9",
                            background: loading[pin]
                              ? "#fffbe6"
                              : pinStates[pin]
                                ? "#f6ffed"
                                : undefined
                          },
                          body: { padding: 14 }
                        }}
                      >
                        <Space
                          orientation="vertical"
                          align="center"
                          style={{
                            width: "100%"
                          }}
                        >
                          <Switch
                            loading={Boolean(loading[pin])}
                            checked={Boolean(pinStates[pin])}
                            onChange={(checked) =>
                              handleSetPinStatus(pin, checked)
                            }
                          />

                          {loading[pin] ? (
                            <Badge status="processing" text="Updating..." />
                          ) : (
                            <Typography.Text
                              strong
                              type={pinStates[pin] ? "success" : "secondary"}
                            >
                              {pinStates[pin] ? "🟢 ON" : "⚫️ OFF"}
                            </Typography.Text>
                          )}
                        </Space>
                      </Card>
                    </Col>
                  ))}
                </Row>
              </>
            ) : (
              <Empty
                description={
                  <p>
                    Load the device with the ID configured in your Raspberry Pi
                    listener.{" "}
                    <Typography.Link
                      href="https://github.com/Salmandabbakuti/blockchain-of-things"
                      target="_blank"
                      rel="noreferrer"
                    >
                      Learn more
                    </Typography.Link>
                  </p>
                }
              />
            )}
          </Card>
        </div>
      ) : (
        <div className="hero-section">
          <div className="hero-content">
            <span className="eyebrow">BLOCKCHAIN OF THINGS</span>
            <h1 className="hero-title">
              A secure control path to your Raspberry Pi.
            </h1>
            <p className="hero-description">
              Change GPIO pin states through a smart contract. A local listener
              receives the event and updates the device.
            </p>
            <div className="hero-cta">
              <Space>
                <Button
                  type="link"
                  size="large"
                  href="https://github.com/Salmandabbakuti/blockchain-of-things?tab=readme-ov-file"
                  target="_blank"
                >
                  Learn More
                </Button>
                <appkit-button />
              </Space>
            </div>
            <div className="workflow" aria-label="How it works">
              <span>Connect wallet ❯</span>
              <span>Load device ❯</span>
              <span>Control GPIO</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
