import { Contract } from "ethers";

const CONTRACT_ADDRESS = "0x0db6d7f70754f0acd4ab664f4e3ace9f6c5f08c9";

const CONTRACT_ABI = [
  "event DevicePinStatusChanged(uint256 indexed _deviceId, uint8 indexed pin, uint8 status)",
  "function getDevicePinStatus(uint256 _deviceId, uint8 _pin) view returns (uint8)",
  "function setDevicePinStatus(uint256 _deviceId, uint8 _pin, uint8 _pinStatus)",
  "function getFullDeviceBitmap(uint256 _deviceId) view returns (uint256)"
];

export const contract = new Contract(CONTRACT_ADDRESS, CONTRACT_ABI);

export const supportedPins = [
  14, 15, 18, 23, 24, 25, 8, 7, 12, 16, 20, 21, 2, 3, 4, 17, 27, 22, 10, 9, 11,
  5, 6, 13, 19, 26
];
