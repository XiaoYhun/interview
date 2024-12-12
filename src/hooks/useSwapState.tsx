import { Token } from "@uniswap/sdk-core";
import { create } from "zustand";

type SwapState = {
  tokenIn: Token | undefined;
  tokenOut: Token | undefined;
  amountIn: string;
  setTokenIn: (token: Token) => void;
  setTokenOut: (token: Token) => void;
  swapTokens: () => void;
  setAmountIn: (amount: string) => void;
};

const useSwapState = create<SwapState>((set) => ({
  tokenIn: undefined,
  tokenOut: undefined,
  amountIn: "",
  setTokenIn: (token: Token | undefined) => set({ tokenIn: token }),
  setTokenOut: (token: Token | undefined) => set({ tokenOut: token }),
  swapTokens: () => set((state) => ({ tokenIn: state.tokenOut, tokenOut: state.tokenIn })),
  setAmountIn: (amount: string) => set({ amountIn: amount }),
}));
export default useSwapState;
