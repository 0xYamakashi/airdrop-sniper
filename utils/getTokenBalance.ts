import { ethers } from "ethers";
import Erc20Abi from "../abis/ERC20_ABI.json";
import { Token } from "../constants/tokens";

export const getTokenBalance = async (
  privateKey: string,
  inToken: Token,
  networks: any
): Promise<void> => {
  const provider: ethers.JsonRpcProvider = new ethers.JsonRpcProvider(
    networks.url
  );

  const wallet: ethers.Wallet = new ethers.Wallet(privateKey, provider);
  const isNativeTokenIn = inToken.symbol === "ETH";

  const fromTokenContract: ethers.Contract = new ethers.Contract(
    inToken.address,
    Erc20Abi,
    wallet
  );

  const balance = isNativeTokenIn
    ? await provider.getBalance(wallet.address)
    : await fromTokenContract.balanceOf(wallet.address);

  console.log(
    `${inToken.symbol} Balance for ${wallet.address}: ${ethers.formatUnits(
      balance,
      inToken.decimals
    )}`
  );
};
