import { useState, useEffect } from "react";
import {
  ThirdwebProvider,
  metamaskWallet,
  coinbaseWallet,
  walletConnect,
  rainbowWallet,
  trustWallet
} from "@thirdweb-dev/react";
import {
  Binance,
  BinanceTestnet,
  OpbnbTestnet,
  Opbnb
} from "@thirdweb-dev/chains";

const supportedWallets = [
  metamaskWallet({ recommended: true }),
  coinbaseWallet({ recommended: true }),
  walletConnect(),
  rainbowWallet(),
  trustWallet()
];
const clientId = import.meta.env.VITE_THIRDWEB_CLIENT_ID;

export default function Web3Provider({ children }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <ThirdwebProvider
      activeChain={Binance}
      supportedChains={[Binance, BinanceTestnet, Opbnb, OpbnbTestnet]}
      supportedWallets={supportedWallets}
      autoConnect={true}
      clientId={clientId}
      dAppMeta={{
        name: "DePIN Raspi Connect",
        description:
          "Decentralized Smart Home IOT with Raspberry Pi and Blockchain",
        logoUrl: "https://example.com/logo.png",
        url: "https://example.com",
        isDarkMode: true
      }}
    >
      {mounted && children}
    </ThirdwebProvider>
  );
}
