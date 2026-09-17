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
  2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22,
  23, 24, 25, 26, 27
];
