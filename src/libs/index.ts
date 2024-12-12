import { ethers, providers } from "ethers";
import { CurrentConfig } from "../config";
import { Token } from "@uniswap/sdk-core";
import { ERC20_ABI, SWAP_ROUTER_ADDRESS, TOKEN_AMOUNT_TO_APPROVE_FOR_TRANSFER, TransactionState } from "../constants";
import { fromReadableAmount } from "../utils";

const wallet = createWallet();

function createWallet() {
  const provider = new ethers.providers.JsonRpcProvider(CurrentConfig.rpc.local);
  return new ethers.Wallet(CurrentConfig.wallet.privateKey, provider);
}

export function getProvider(): providers.Provider | null {
  return wallet.provider;
}

export async function sendTransaction(transaction: ethers.providers.TransactionRequest) {
  const provider = getProvider();
  if (!provider) {
    return TransactionState.Failed;
  }
  const wallet = new ethers.Wallet(CurrentConfig.wallet.privateKey, provider);
  const txRes = await wallet.sendTransaction(transaction);
  let receipt = null;
  if (!provider) {
    return TransactionState.Failed;
  }
  while (receipt === null) {
    try {
      receipt = await provider.getTransactionReceipt(txRes.hash);

      if (receipt === null) {
        continue;
      }
    } catch (e) {
      console.log(`Receipt error:`, e);
      break;
    }
  }

  // Transaction was successful if status === 1
  if (receipt) {
    return TransactionState.Sent;
  } else {
    return TransactionState.Failed;
  }
}

export async function getTokenTransferApproval(token: Token): Promise<TransactionState> {
  const provider = getProvider();
  const address = CurrentConfig.wallet.address;
  if (!provider || !address) {
    console.log("No Provider Found");
    return TransactionState.Failed;
  }

  try {
    const tokenContract = new ethers.Contract(token.address, ERC20_ABI, provider);

    const transaction = await tokenContract.populateTransaction.approve(
      SWAP_ROUTER_ADDRESS,
      fromReadableAmount(TOKEN_AMOUNT_TO_APPROVE_FOR_TRANSFER, token.decimals).toString()
    );

    return sendTransaction({
      ...transaction,
      from: address,
    });
  } catch (e) {
    console.error(e);
    return TransactionState.Failed;
  }
}
