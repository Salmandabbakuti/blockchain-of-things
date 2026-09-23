import { useEffect, useState } from "react";
import { createAppKit } from "@reown/appkit/react";
import { EthersAdapter } from "@reown/appkit-adapter-ethers";
import { arbitrumSepolia, arbitrum } from "@reown/appkit/networks";

// 1. Get projectId
const projectId = import.meta.env.VITE_REOWN_PROJECT_ID;

// 2. Set the networks
const networks = [arbitrumSepolia, arbitrum];

// 3. Create a metadata object - optional
const metadata = {
  name: "BoT",
  description:
    "BoT is a dapp that allows users to interact with the Blockchain of Things.",
  url: "https://blockchain-of-things.vercel.app", // origin must match your domain & subdomain
  icons: ["https://blockchain-of-things.vercel.app/favicon.svg"] // must be an array of at least one icon
};

// 4. Create a AppKit instance
createAppKit({
  adapters: [new EthersAdapter()],
  defaultNetwork: arbitrumSepolia,
  allowUnsupportedChain: false,
  networks,
  metadata,
  projectId,
  themeMode: "light",
  features: {
    analytics: true // Optional - defaults to your Cloud configuration
  }
});

export default function Web3Provider({ children }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  return mounted && children;
}
