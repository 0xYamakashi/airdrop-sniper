import { ethers } from "ethers";
import { WETH_ABI__factory } from "../../abis/types";

export async function unWrap(
  privateKey: string,
  percentageOfWalletBalance: number,
  network: any
) {
  const provider: ethers.JsonRpcProvider = new ethers.JsonRpcProvider(
    network.url
  );

  const wallet: ethers.Wallet = new ethers.Wallet(privateKey, provider);

  const wethContract = WETH_ABI__factory.connect(network.wethAddress, wallet);

  const balance = await wethContract.balanceOf(wallet.address);

  const inAmount = (balance * BigInt(percentageOfWalletBalance)) / BigInt(100);
  const tx = await wethContract.withdraw(inAmount);
  console.log(
    `Unwrrapped ${ethers.formatEther(inAmount)} ETH. Transaction hash: ${
      tx.hash
    }`
  );
}
