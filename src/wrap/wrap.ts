import { ethers } from "ethers";
import WethAbi from "../../abis/WETH_ABI.json";

export async function wrap(
  privateKey: string,
  percentageOfWalletBalance: number,
  network: any
) {
  const provider: ethers.JsonRpcProvider = new ethers.JsonRpcProvider(
    network.url
  );

  const wallet: ethers.Wallet = new ethers.Wallet(privateKey, provider);

  const wethContract: ethers.Contract = new ethers.Contract(
    network.wethAddress,
    WethAbi,
    wallet
  );
  
  const balance = await provider.getBalance(wallet.address);

  const inAmount =  balance * BigInt(percentageOfWalletBalance) / BigInt(100);
  const tx = await wethContract.deposit({ value: inAmount });
  console.log(
    `Wrapped ${ethers.formatEther(inAmount)} ETH. Transaction hash: ${tx.hash}`
  );
}
