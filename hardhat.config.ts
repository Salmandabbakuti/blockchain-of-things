import hardhatToolboxViemPlugin from "@nomicfoundation/hardhat-toolbox-viem";
import { configVariable, defineConfig } from "hardhat/config";

const accounts = [configVariable("PRIVATE_KEY")];

export default defineConfig({
  plugins: [hardhatToolboxViemPlugin],
  solidity: {
    profiles: {
      default: {
        version: "0.8.37"
      },
      production: {
        version: "0.8.37",
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
    arbitrumSepolia: {
      type: "http",
      url: "https://sepolia-rollup.arbitrum.io/rpc",
      accounts
    },
    arbitrum: {
      type: "http",
      url: "https://arb1.arbitrum.io/rpc",
      accounts
    }
  }
});
