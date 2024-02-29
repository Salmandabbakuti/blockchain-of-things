import { HardhatUserConfig, vars } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const accounts = vars.has("PRIVATE_KEY") ? [vars.get("PRIVATE_KEY")] : [];

const config: HardhatUserConfig = {
  solidity: "0.8.21",
  defaultNetwork: "localhost",
  networks: {
    localhost: {
      url: "http://127.0.0.1:8545"
    },
    bscTestnet: {
      url: "https://bsc-testnet-dataseed.bnbchain.org",
      chainId: 97,
      accounts
    },
    bscMainnet: {
      url: "https://bsc-dataseed.bnbchain.org",
      chainId: 56,
      accounts
    },
    greenFieldTestnet: {
      url: "https://gnfd-testnet-fullnode-tendermint-us.bnbchain.org",
      chainId: 5600,
      accounts
    },
    greenFieldMainnet: {
      url: "https://greenfield-chain-ap.bnbchain.org",
      chainId: 1017,
      accounts
    },
    opBNBTestnet: {
      url: "https://opbnb-testnet-rpc.bnbchain.org",
      chainId: 5611,
      accounts
    },
    opBNBMainnet: {
      url: "https://opbnb-mainnet-rpc.bnbchain.org",
      chainId: 204,
      accounts
    },
    mumbai: {
      url: "https://rpc-mumbai.maticvigil.com",
      accounts
    }
  }
};

export default config;
