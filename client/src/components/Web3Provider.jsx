import { useEffect, useState } from "react";
import { createAppKit } from "@reown/appkit/react";
import { EthersAdapter } from "@reown/appkit-adapter-ethers";
import { mainnet, polygon, polygonAmoy } from "@reown/appkit/networks";

// 1. Get projectId
const projectId = import.meta.env.VITE_REOWN_PROJECT_ID;

// 2. Set the networks
const networks = [mainnet, polygon, polygonAmoy];

// 3. Create a metadata object - optional
const metadata = {
  name: "My Website",
  description: "My Website description",
  url: "https://mywebsite.com", // origin must match your domain & subdomain
  icons: ["https://avatars.mywebsite.com/"]
};

// 4. Create a AppKit instance
createAppKit({
  adapters: [new EthersAdapter()],
  defaultNetwork: polygonAmoy,
  allowUnsupportedChain: false,
  networks,
  metadata,
  projectId,
  features: {
    analytics: true // Optional - defaults to your Cloud configuration
  }
});

export default function Web3Provider({ children }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  return mounted && children;
}
