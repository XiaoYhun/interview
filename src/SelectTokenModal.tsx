import { Modal, ModalBody, ModalContent, ModalHeader } from "@nextui-org/react";
import { Token } from "@uniswap/sdk-core";
import { tokenList } from "./constants";

export default function SelectTokenModal({
  isOpen,
  onClose,
  onSelect,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (token: Token) => void;
}) {
  return (
    <Modal isOpen={isOpen} classNames={{ body: "bg-[#131313]", header: "bg-[#131313]" }} onClose={onClose}>
      <ModalContent>
        <ModalHeader className=" px-3">Select a Token</ModalHeader>
        <ModalBody className="pt-0 pb-4 px-3">
          <div className="text-sm font-semibold text-neutral-500">Tokens</div>
          <div className="flex flex-col -mx-3 gap-1">
            {tokenList.map((token) => (
              <div
                key={token[1]}
                className="flex items-center gap-3 py-2 hover:bg-neutral-800/50 cursor-pointer px-3"
                onClick={() => {
                  onClose();
                  onSelect(
                    new Token(
                      token[0] as number,
                      token[1] as string,
                      token[2] as number,
                      token[3] as string,
                      token[4] as string
                    )
                  );
                }}
              >
                <img
                  src={
                    token[3] === "WETH"
                      ? "https://token-media.defined.fi/8453_0x4200000000000000000000000000000000000006_small_82000c9c-885a-4387-b928-45bd661b9231.png"
                      : `https://token-media.defined.fi/1_${token[1]}_small.png`
                  }
                  className="rounded-full w-8 h-8"
                ></img>
                <div className="flex flex-col">
                  <div>{token[3]}</div>
                  <div className="text-xs text-neutral-500">{token[4]}</div>
                </div>
              </div>
            ))}
          </div>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
