import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("PinControllerModule", (m) => {
  const pinController = m.contract("PinController");
  return { pinController };
});
