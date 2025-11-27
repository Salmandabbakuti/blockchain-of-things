import { useEffect, useState } from "react";
import { Contract, BrowserProvider, JsonRpcProvider } from "ethers";
import {
  useAppKitProvider,
  useAppKitAccount,
  useAppKitState
} from "@reown/appkit/react";
import {
  message,
  Typography,
  Switch,
  Card,
  Button,
  Input,
  Row,
  Col,
  Empty,
  Tag,
  Statistic,
  Divider,
  Space,
  Alert,
  Modal,
  Form,
  Tooltip
} from "antd";
import {
  PlusCircleOutlined,
  ArrowRightOutlined,
  EnvironmentOutlined,
  CheckCircleOutlined,
  SwapOutlined,
  AppstoreOutlined,
  BgColorsOutlined,
  PoweroffOutlined
} from "@ant-design/icons";
import "./App.css";

const defaultProvider = new JsonRpcProvider(
  "https://rpc-amoy.polygon.technology",
  80002,
  {
    staticNetwork: true
  }
);

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

const contract = new Contract(
  "0xDcd83C8bFd6222375EC5E63d000896eAeFC2ecab",
  contractABI,
  defaultProvider
);

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
  const [transferModalVisible, setTransferModalVisible] = useState(false);
  const [form] = Form.useForm();

  const { address: account } = useAppKitAccount();
  const { selectedNetworkId } = useAppKitState();
  const { walletProvider } = useAppKitProvider("eip155");

  const handleRegisterDevice = async () => {
    if (!account || !walletProvider)
      return message.error("Please connect your wallet");
    if (selectedNetworkId !== "eip155:80002")
      return message.error("Please switch to the Polygon Amoy network");
    try {
      setLoading({ registerDevice: true });
      const ethersProvider = new BrowserProvider(walletProvider);
      const signer = await ethersProvider.getSigner();
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
    if (!account || !walletProvider)
      return message.error("Please connect your wallet");
    if (selectedNetworkId !== "eip155:80002")
      return message.error("Please switch to the Polygon Amoy network");
    if (deviceOwner?.toLowerCase() !== account.toLowerCase())
      return message.error("Only device owner can control these pins");
    try {
      setLoading({ [pin]: true });
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
    if (!account || !walletProvider)
      return message.error("Please connect your wallet");
    if (selectedNetworkId !== "eip155:80002")
      return message.error("Please switch to the Polygon Amoy network");
    if (!newOwner) return message.error("Please enter new owner address");
    try {
      setLoading({ transferOwnership: true });
      const ethersProvider = new BrowserProvider(walletProvider);
      const signer = await ethersProvider.getSigner();
      const tx = await contract
        .connect(signer)
        .transferDeviceOwnership(deviceId, newOwner);
      await tx.wait();
      message.success(`Device Ownership transferred to ${newOwner}`);
      setTransferModalVisible(false);
      form.resetFields();
    } catch (err) {
      console.log("err transferring device ownership", err);
      message.error("Failed to transfer device ownership");
    } finally {
      setLoading({ transferOwnership: false });
    }
  };

  const getDeviceOwner = async () => {
    try {
      const device = await contract.devices(deviceId);
      setDeviceOwner(device?.owner);
    } catch (err) {
      console.log("err getting current device owner", err);
    }
  };

  useEffect(() => {
    if (deviceId === null) return;
    getDeviceOwner();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deviceId]);

  return (
    <div className="App">
      {account ? (
        <div className="dashboard-container">
          {/* Main Control Panel - Always Visible */}
          <Card
            className="control-panel-card"
            bordered={false}
            title="GPIO Control Panel"
            extra={
              <Space>
                <Input
                  type="number"
                  placeholder="Device ID"
                  value={deviceIdInput}
                  onChange={(e) => setDeviceIdInput(e.target.value)}
                  size="middle"
                  prefix={<EnvironmentOutlined />}
                  style={{ width: "120px" }}
                  onPressEnter={() => {
                    if (
                      deviceIdInput === "" ||
                      isNaN(deviceIdInput) ||
                      deviceIdInput < 0
                    )
                      return message.error("Please enter a valid device ID");
                    setDeviceId(deviceIdInput);
                    setLoading({});
                    setPinStates({});
                    message.success(`Connected to Device: ${deviceIdInput}`);
                  }}
                />
                <Button
                  type="primary"
                  size="middle"
                  icon={<ArrowRightOutlined />}
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
                    message.success(`Connected to Device: ${deviceIdInput}`);
                  }}
                >
                  Connect
                </Button>
                <Tooltip title="Register a new device">
                  <Button
                    type="default"
                    shape="circle"
                    size="middle"
                    icon={<PlusCircleOutlined />}
                    onClick={handleRegisterDevice}
                    loading={loading.registerDevice || false}
                    style={{ color: "#52c41a", borderColor: "#52c41a" }}
                  />
                </Tooltip>
              </Space>
            }
          >
            {deviceId !== null ? (
              <>
                {/* Device Info Section */}
                <Divider style={{ margin: "16px 0" }} />
                <Row gutter={[24, 24]} style={{ marginBottom: "24px" }}>
                  <Col xs={24} sm={12} md={8}>
                    <Statistic
                      title="Device ID"
                      value={deviceId}
                      prefix={<BgColorsOutlined />}
                    />
                  </Col>
                  <Col xs={24} sm={12} md={8}>
                    <Space size="small">
                      <Typography.Text
                        type="secondary"
                        strong
                        style={{ fontSize: "0.8rem" }}
                      >
                        Owner
                      </Typography.Text>
                      <Tag color="blue" icon={<CheckCircleOutlined />}>
                        {deviceOwner?.slice(0, 6)}...{deviceOwner?.slice(-4)}
                      </Tag>

                      {deviceOwner?.toLowerCase() === account.toLowerCase() && (
                        <Button
                          title="Transfer Ownership"
                          type="default"
                          size="small"
                          shape="ciircle"
                          icon={<SwapOutlined />}
                          onClick={() => setTransferModalVisible(true)}
                        />
                      )}
                    </Space>
                  </Col>
                </Row>

                {/* Pin Status Summary */}
                <Row gutter={[16, 16]} className="pin-summary">
                  <Col xs={12} sm={8} md={6}>
                    <Card size="small" className="summary-card">
                      <Statistic
                        title="Total Pins"
                        value={supportedPins.length}
                        prefix={<AppstoreOutlined />}
                      />
                    </Card>
                  </Col>
                  <Col xs={12} sm={8} md={6}>
                    <Card size="small" className="summary-card">
                      <Statistic
                        title="Active Pins"
                        value={Object.values(pinStates).filter(Boolean).length}
                        valueStyle={{ color: "#52c41a" }}
                      />
                    </Card>
                  </Col>
                  <Col xs={12} sm={8} md={6}>
                    <Card size="small" className="summary-card">
                      <Statistic
                        title="Inactive Pins"
                        value={
                          Object.values(pinStates).filter((v) => !v).length
                        }
                        valueStyle={{ color: "#ff4d4f" }}
                      />
                    </Card>
                  </Col>
                </Row>

                <Divider />

                {/* Pin Grid */}
                <Typography.Title level={4} style={{ marginBottom: "24px" }}>
                  GPIO Pins
                </Typography.Title>
                <Row gutter={[8, 8]} className="pin-grid">
                  {supportedPins.map((pin) => (
                    <Col key={pin} xs={12} sm={8} md={6} lg={4} xl={3}>
                      <Card
                        className={`pin-card ${pinStates[pin] ? "active" : ""}`}
                        bordered={false}
                        hoverable
                      >
                        <Space direction="vertical" style={{ width: "100%" }}>
                          <Space
                            style={{
                              width: "100%",
                              justifyContent: "space-between"
                            }}
                          >
                            <Typography.Text strong>GPIO</Typography.Text>
                            <div className="pin-number-highlight">{pin}</div>
                          </Space>

                          <Space
                            style={{ width: "100%", justifyContent: "center" }}
                          >
                            <Switch
                              size="small"
                              loading={loading[pin] || false}
                              checked={pinStates[pin] || false}
                              onChange={(checked) =>
                                handleSetPinStatus(pin, checked)
                              }
                            />
                          </Space>

                          <Tag
                            color={pinStates[pin] ? "green" : "default"}
                            icon={pinStates[pin] ? <PoweroffOutlined /> : null}
                            className="pin-status-tag"
                            style={{ width: "100%", textAlign: "center" }}
                          >
                            {pinStates[pin] ? "ON" : "OFF"}
                          </Tag>
                        </Space>
                      </Card>
                    </Col>
                  ))}
                </Row>
              </>
            ) : (
              <Empty
                description="No Device Connected"
                style={{ marginTop: "40px", marginBottom: "40px" }}
              >
                <Typography.Paragraph type="secondary">
                  Enter a device ID above and click &quot;Connect&quot; to get
                  started
                </Typography.Paragraph>
              </Empty>
            )}
          </Card>
        </div>
      ) : (
        <div className="hero-section">
          <Card className="hero-card" bordered={false}>
            <div className="hero-content">
              <div className="hero-icon">⚙️</div>
              <Typography.Title level={1} className="hero-title">
                Blockchain of Things
              </Typography.Title>
              <Typography.Paragraph className="hero-subtitle">
                Decentralized Smart Home IoT Platform
              </Typography.Paragraph>
              <Typography.Paragraph className="hero-description">
                Control your Raspberry Pi GPIO pins securely through blockchain
                technology. Own your IoT devices with true decentralization.
              </Typography.Paragraph>

              <Row
                gutter={[16, 16]}
                className="features-grid"
                style={{ marginBottom: "40px" }}
              >
                <Col xs={24} sm={8}>
                  <Card size="small" className="feature-card">
                    <div className="feature-icon">🔐</div>
                    <Typography.Text strong>
                      Secure & Decentralized
                    </Typography.Text>
                  </Card>
                </Col>
                <Col xs={24} sm={8}>
                  <Card size="small" className="feature-card">
                    <div className="feature-icon">📡</div>
                    <Typography.Text strong>IoT Enabled</Typography.Text>
                  </Card>
                </Col>
                <Col xs={24} sm={8}>
                  <Card size="small" className="feature-card">
                    <div className="feature-icon">⚡</div>
                    <Typography.Text strong>Instant Control</Typography.Text>
                  </Card>
                </Col>
              </Row>

              <Alert
                message="Connect your wallet to get started"
                type="info"
                showIcon
                style={{ marginBottom: "30px" }}
              />

              <div className="hero-cta">
                <appkit-button />
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Transfer Ownership Modal */}
      <Modal
        title="Transfer Device Ownership"
        open={transferModalVisible}
        onCancel={() => {
          setTransferModalVisible(false);
          form.resetFields();
        }}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={(values) => {
            handleTransferDeviceOwnership(values.newOwner);
          }}
        >
          <Form.Item
            label="New Owner Address"
            name="newOwner"
            rules={[
              { required: true, message: "Please enter the new owner address" },
              {
                pattern: /^0x[a-fA-F0-9]{40}$/,
                message: "Please enter a valid Ethereum address"
              }
            ]}
          >
            <Input
              placeholder="0x..."
              size="large"
              prefix={<EnvironmentOutlined />}
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading.transferOwnership || false}
              block
              size="large"
              icon={<SwapOutlined />}
            >
              Transfer Ownership
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default App;
