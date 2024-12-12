import { Button, Input, Skeleton } from "@nextui-org/react";
import { useState } from "react";
import SelectTokenModal from "./SelectTokenModal";
import { Token } from "@uniswap/sdk-core";
import useTokenBalance from "./hooks/useTokenBalance";
import { CurrentConfig } from "./config";
import { toReadableAmount } from "./utils";

export default function CurrencyInput({
  title,
  value,
  token,
  isLoading,
  onValueChange,
  onTokenChange,
}: {
  title: string;
  value?: string;
  token?: Token;
  isLoading?: boolean;
  onValueChange?: (value: string) => void;
  onTokenChange?: (token: Token) => void;
}) {
  const [isFocusing, setIsFocusing] = useState(false);
  const [isOpenSelectTokenModal, setIsOpenSelectTokenModal] = useState(false);
  const { balance: tokenInBalance } = useTokenBalance(token, CurrentConfig.wallet.address);
  return (
    <div
      className={`rounded-[20px] border border-neutral-800 flex items-center p-3 py-4 transition-all relative ${
        isFocusing ? "bg-neutral-800" : ""
      }`}
    >
      <div className="flex-1 flex flex-col gap-3">
        <div className="font-semibold text-sm">{title}</div>
        <div>
          {isLoading ? (
            <Skeleton className="w-[200px] h-[40px] opacity-70 rounded-lg" />
          ) : (
            <Input
              value={value}
              onValueChange={(v) => onValueChange?.(v)}
              variant="flat"
              classNames={{ inputWrapper: "!bg-transparent shadow-none pl-1", input: "text-2xl font-bold pl-0" }}
              onFocus={() => setIsFocusing(true)}
              onBlur={() => setIsFocusing(false)}
              type="number"
            />
          )}
        </div>
        <div className="text-sm text-neutral-400">$0</div>
      </div>
      <div className="">
        {token ? (
          <Button className="rounded-full !bg-neutral-800 p-2 h-fit " onPress={() => setIsOpenSelectTokenModal(true)}>
            <img
              src={
                token.symbol === "WETH"
                  ? "https://token-media.defined.fi/8453_0x4200000000000000000000000000000000000006_small_82000c9c-885a-4387-b928-45bd661b9231.png"
                  : `https://token-media.defined.fi/1_${token.address.toLowerCase()}_small.png`
              }
              className="rounded-full w-6 h-6"
            ></img>{" "}
            {token.symbol}
          </Button>
        ) : (
          <Button
            radius="full"
            size="sm"
            color="primary"
            className="font-bold"
            onPress={() => setIsOpenSelectTokenModal(true)}
          >
            Select Token
          </Button>
        )}
      </div>
      <div className="absolute right-4 top-4 text-xs text-neutral-300">
        {tokenInBalance && token && toReadableAmount(tokenInBalance, token.decimals)}
      </div>
      <SelectTokenModal
        isOpen={isOpenSelectTokenModal}
        onClose={() => setIsOpenSelectTokenModal(false)}
        onSelect={(token) => onTokenChange?.(token)}
      />
    </div>
  );
}
