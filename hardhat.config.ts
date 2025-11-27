import hardhatToolboxViemPlugin from "@nomicfoundation/hardhat-toolbox-viem";
import { configVariable, defineConfig } from "hardhat/config";

export default defineConfig({
  plugins: [hardhatToolboxViemPlugin],
  solidity: {
    profiles: {
      default: {
        version: "0.8.28"
      },
      production: {
        version: "0.8.28",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200
          }
        }
      }
    }
  },
  networks: {
    polygonAmoy: {
      type: "http",
      chainType: "l1",
      url: "https://rpc-amoy.polygon.technology/",
      accounts: [configVariable("PRIVATE_KEY")]
    },
    polygon: {
      type: "http",
      chainType: "l1",
      url: "https://polygon-rpc.com/",
      accounts: [configVariable("PRIVATE_KEY")]
    }
  }
});
