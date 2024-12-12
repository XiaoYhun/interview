import { ArrowUp, Settings } from "lucide-react";
import CurrencyInput from "./CurrencyInput";
import { Button } from "@nextui-org/react";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { useAccount, useDisconnect } from "wagmi";
import useQuoteData from "./hooks/useQuoteData";
import useSwapState from "./hooks/useSwapState";
import { fromReadableAmount, toReadableAmount } from "./utils";
import { Route, SwapOptions, SwapRouter, Trade } from "@uniswap/v3-sdk";
import usePool from "./hooks/usePool";
import { CurrencyAmount, Percent, TradeType } from "@uniswap/sdk-core";
import JSBI from "jsbi";
import { CurrentConfig } from "./config";
import { getTokenTransferApproval, sendTransaction } from "./libs";
import { ERC20_ABI, MAX_FEE_PER_GAS, MAX_PRIORITY_FEE_PER_GAS, SWAP_ROUTER_ADDRESS } from "./constants";
import { useEffect } from "react";
import { ethers } from "ethers";
import useProvider from "./hooks/useProvider";
import useTokenBalance from "./hooks/useTokenBalance";

export default function SwapForm() {
  const { openConnectModal } = useConnectModal();
  const { address } = useAccount();
  const { disconnect } = useDisconnect();
  const { tokenIn, tokenOut, amountIn, setTokenIn, setTokenOut, setAmountIn, swapTokens } = useSwapState();
  const { quotedData, isLoading } = useQuoteData();
  const { pool } = usePool({ tokenIn, tokenOut });
  const provider = useProvider();

  const handleSwap = async () => {
    if (!tokenIn || !tokenOut || !amountIn || !address || !pool) return;

    const swapRoute = new Route([pool], tokenIn, tokenOut);
    const uncheckedTrade = Trade.createUncheckedTrade({
      route: swapRoute,
      inputAmount: CurrencyAmount.fromRawAmount(tokenIn, fromReadableAmount(+amountIn, tokenIn.decimals).toString()),
      outputAmount: CurrencyAmount.fromRawAmount(tokenOut, JSBI.toNumber(JSBI.BigInt(quotedData))),
      tradeType: TradeType.EXACT_INPUT,
    });
    const tokenApproval = await getTokenTransferApproval(tokenIn);

    const options: SwapOptions = {
      slippageTolerance: new Percent(1000, 10_000), // 50 bips, or 0.50%
      deadline: Math.floor(Date.now() / 1000) + 60 * 20, // 20 minutes from the current Unix time
      recipient: CurrentConfig.wallet.address,
    };

    const methodParameters = SwapRouter.swapCallParameters([uncheckedTrade], options);
    const tx = {
      data: methodParameters.calldata,
      to: SWAP_ROUTER_ADDRESS,
      value: methodParameters.value,
      from: CurrentConfig.wallet.address,
      maxFeePerGas: MAX_FEE_PER_GAS,
      maxPriorityFeePerGas: MAX_PRIORITY_FEE_PER_GAS,
      gasLimit: 1000000,
    };

    const res = await sendTransaction(tx);
    console.log("🚀 ~ handleSwap ~ res:", res);
  };

  const wrapEther = async () => {
    const wethAbi = ["function deposit() public payable", "function withdraw(uint256) public"];

    // WETH contract address
    const wethAddress = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
    const signer = provider.getSigner();
    // Create the WETH contract instance
    const wethContract = new ethers.Contract(wethAddress, wethAbi, signer);

    const amountToWrap = ethers.utils.parseEther("100");

    // Wrap the ETH
    const tx = await wethContract.deposit({ value: amountToWrap });
    await tx.wait();

    console.log(`Wrapped ${ethers.utils.formatEther(amountToWrap)} ETH into WETH`);
  };

  useEffect(() => {
    if (!tokenIn || !provider) return;
    console.log("🚀 ~ useEffect ~ tokenIn:", tokenIn);

    provider.getBalance(CurrentConfig.wallet.address).then((balance: any) => {
      console.log("🚀 ~ balance: native", balance.toString());
    });
    if (tokenIn.isNative) {
    } else {
      const contract = new ethers.Contract(tokenIn?.address, ERC20_ABI, provider);

      contract.balanceOf(CurrentConfig.wallet.address).then((balance: any) => {
        console.log("🚀 ~ balance:", balance.toString());
      });
    }
  }, [tokenIn, provider]);

  return (
    <div className="flex flex-col gap-1 w-[400px]">
      <div>{address}</div>
      <Button onPress={wrapEther}>Wrapp 100 ETH into WETH</Button>
      <div className="flex justify-between items-center px-1.5">
        <div className="text-sm font-bold px-3 py-1.5 rounded-full bg-neutral-800">Swap</div>
        <div>
          <Settings size={20} />
        </div>
      </div>
      <CurrencyInput
        title="Sell"
        token={tokenIn}
        onValueChange={(value) => setAmountIn(value)}
        onTokenChange={(token) => {
          if (token.address !== tokenOut?.address) {
            setTokenIn(token);
          } else {
            swapTokens();
          }
        }}
        value={amountIn}
      />
      <div className="relative">
        <div
          onClick={() => {
            swapTokens();
          }}
          className="bg-neutral-900 border-neutral-700 border-2 rounded-[8px] p-1.5 absolute left-1/2 -translate-x-1/2 -top-4 cursor-pointer hover:bg-neutral-800 hover:border-neutral-400"
        >
          <ArrowUp size={16} />
        </div>
        <CurrencyInput
          title="Buy"
          token={tokenOut}
          value={tokenOut && quotedData && toReadableAmount(quotedData, tokenOut.decimals)}
          onTokenChange={(token) => {
            if (token.address !== tokenIn?.address) {
              setTokenOut(token);
            } else {
              swapTokens();
            }
          }}
          isLoading={isLoading}
        />
      </div>
      {!address && (
        <Button color="secondary" variant="flat" className="font-bold" onPress={openConnectModal}>
          Connect wallet
        </Button>
      )}
      {address && (
        <>
          <Button color="secondary" className="font-bold" onPress={handleSwap}>
            Swap
          </Button>
          <div className="text-xs mt-2 text-red-700 text-center cursor-pointer" onClick={() => disconnect()}>
            Disconnect
          </div>
        </>
      )}
    </div>
  );
}
