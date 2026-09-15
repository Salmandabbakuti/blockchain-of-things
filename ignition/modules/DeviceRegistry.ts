import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("DeviceRegistryModule", (m) => {
  const deviceRegistry = m.contract("DeviceRegistry");
  return { deviceRegistry };
});
