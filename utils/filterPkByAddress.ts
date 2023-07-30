import { Wallet } from "ethers";

export function filterPkByAddress(
  privateKeys: string[],
  selectedWalletAddressesParsed: string[]
) {
  return privateKeys.filter((privateKey) => {
    return (
      selectedWalletAddressesParsed.indexOf(new Wallet(privateKey).address) !==
      -1
    );
  });
}
