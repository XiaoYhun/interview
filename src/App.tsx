import "./App.css";
import SwapForm from "./SwapForm";
import "@rainbow-me/rainbowkit/styles.css";

import { darkTheme, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { createConfig, http, injected, WagmiProvider } from "wagmi";
import { mainnet } from "wagmi/chains";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";

const config = createConfig({
  chains: [mainnet],
  transports: {
    [mainnet.id]: http("https://eth-mainnet.g.alchemy.com/v2/MI4ouV4ckEN9e4cTaoGAjKnjYdAz6MKK"),
    // [mainnet.id]: http("https://api.zan.top/eth-mainnet"),
  },
});

const queryClient = new QueryClient();

function App() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={darkTheme()}>
          <div className="flex flex-col gap-2 w-full h-screen justify-center items-center">
            <SwapForm />
          </div>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export default App;
