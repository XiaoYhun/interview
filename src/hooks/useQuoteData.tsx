import { useEffect, useState } from "react";
import useSwapState from "./useSwapState";
import { computePoolAddress, FeeAmount, Pool, Route, SwapQuoter } from "@uniswap/v3-sdk";
import { POOL_FACTORY_CONTRACT_ADDRESS, QUOTER_CONTRACT_ADDRESS } from "../constants";
import { CurrencyAmount, TradeType } from "@uniswap/sdk-core";
import { ethers } from "ethers";
import IUniswapV3PoolABI from "@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Pool.sol/IUniswapV3Pool.json";
import useProvider from "./useProvider";
import { fromReadableAmount } from "../utils";
import { useQuery } from "@tanstack/react-query";
import usePool from "./usePool";

export default function useQuoteData() {
  const { tokenIn, tokenOut, amountIn } = useSwapState();
  const provider = useProvider();

  const { pool } = usePool({ tokenIn, tokenOut });

  const { data, isLoading } = useQuery({
    queryKey: ["quoteData", tokenIn, tokenOut, amountIn, pool],
    queryFn: async () => {
      if (!tokenIn || !tokenOut || !provider || !amountIn || !pool) return;

      const swapRoute = new Route([pool], tokenIn, tokenOut);

      const { calldata } = await SwapQuoter.quoteCallParameters(
        swapRoute,
        CurrencyAmount.fromRawAmount(tokenIn, fromReadableAmount(+amountIn, tokenIn.decimals).toString()),
        TradeType.EXACT_INPUT
      );

      const quoteCallReturnData = await provider.call({
        to: QUOTER_CONTRACT_ADDRESS,
        data: calldata,
      });

      return ethers.utils.defaultAbiCoder.decode(["uint256"], quoteCallReturnData)[0];
    },
    enabled: !!tokenIn && !!tokenOut && !!amountIn && !!provider && !!pool,
  });

  return { quotedData: data, isLoading };
}
