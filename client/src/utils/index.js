import { Contract } from "ethers";

export const CONTRACT_ADDRESS =
  import.meta.env.VITE_CONTRACT_ADDRESS ||
  "0x7F46dD5eB0b48805053738541693EBC5473669d2";
export const EXPLORER_URL = "https://sepolia.etherscan.io";

const CONTRACT_ABI = [
  "function setDevicePinStatus(uint256 _deviceId, uint8 _pin, uint8 _pinStatus)",
  "function resetDeviceBitmap(uint256 _deviceId)",
  "function deviceBitmaps(address owner, uint256 deviceId) view returns (uint256)"
];

export const contract = new Contract(CONTRACT_ADDRESS, CONTRACT_ABI);

export const supportedPins = [
  2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22,
  23, 24, 25, 26, 27
];
