import { Token } from "@uniswap/sdk-core";
import { computePoolAddress, FeeAmount, Pool } from "@uniswap/v3-sdk";
import { ethers } from "ethers";
import IUniswapV3PoolABI from "@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Pool.sol/IUniswapV3Pool.json";
import { POOL_FACTORY_CONTRACT_ADDRESS } from "../constants";
import useProvider from "./useProvider";
import { useQuery } from "@tanstack/react-query";

export default function usePool({ tokenIn, tokenOut }: { tokenIn?: Token; tokenOut?: Token }) {
  const provider = useProvider();
  const { data, isLoading } = useQuery<Pool | undefined>({
    queryKey: ["quoteData", tokenIn, tokenOut],
    queryFn: async () => {
      if (!tokenIn || !tokenOut || !provider) return;

      const currentPoolAddress = computePoolAddress({
        factoryAddress: POOL_FACTORY_CONTRACT_ADDRESS,
        tokenA: tokenIn,
        tokenB: tokenOut,
        fee: FeeAmount.MEDIUM,
      });
      const poolContract = new ethers.Contract(currentPoolAddress, IUniswapV3PoolABI.abi, provider);
      const [fee, liquidity, slot0] = await Promise.all([
        poolContract.fee(),
        poolContract.liquidity(),
        poolContract.slot0(),
      ]);
      const poolInfo = { fee, liquidity, sqrtPriceX96: slot0[0], tick: slot0[1] };
      const pool = new Pool(
        tokenIn,
        tokenOut,
        FeeAmount.MEDIUM,
        poolInfo.sqrtPriceX96.toString(),
        poolInfo.liquidity.toString(),
        poolInfo.tick
      );
      return pool;
    },
    enabled: !!tokenIn && !!tokenOut && !!provider,
  });

  return { pool: data, isLoading };
}
