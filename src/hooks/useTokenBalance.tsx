import { Token } from "@uniswap/sdk-core";
import useProvider from "./useProvider";
import { useQuery } from "@tanstack/react-query";
import { ethers } from "ethers";
import { ERC20_ABI } from "../constants";

export default function useTokenBalance(token: Token | undefined, account: string | undefined) {
  const provider = useProvider();
  const { data, isLoading } = useQuery<string | undefined>({
    queryKey: ["tokenBalance", token, account],
    queryFn: async () => {
      if (!token || !account || !provider) return;

      const contract = new ethers.Contract(token.address, ERC20_ABI, provider);
      const balance = await contract.balanceOf(account);
      return balance.toString();
    },
    enabled: !!token && !!account && !!provider,
    refetchInterval: 5000,
  });

  return { balance: data, isLoading };
}
