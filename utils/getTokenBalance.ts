import { ethers } from "ethers";
import { Token } from "../constants/tokens";
import { ERC20_ABI__factory } from "../abis/types";
import { NetworkNames, networks } from "../constants/networks";

export const getTokenBalance = async (
  privateKey: string,
  inToken: Token,
  network: (typeof networks)[NetworkNames]
): Promise<{ address: string; balance: bigint }> => {
  const provider: ethers.JsonRpcProvider = new ethers.JsonRpcProvider(
    network.url
  );

  const wallet: ethers.Wallet = new ethers.Wallet(privateKey, provider);
  const isNativeTokenIn = inToken.symbol === "ETH";

  const tokenContract = ERC20_ABI__factory.connect(inToken.address, wallet);

  const balance = isNativeTokenIn
    ? await provider.getBalance(wallet.address)
    : await tokenContract.balanceOf(wallet.address);

  return { address: wallet.address, balance };
};
