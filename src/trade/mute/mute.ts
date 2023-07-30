import { ethers } from "ethers";
import { Token } from "../../../constants/tokens";
import { networks } from "../../../constants/networks";
import { ERC20_ABI__factory, ROUTER_ABI__factory } from "../../../abis/types";
import { calculateGasMargin } from "../../../utils/calculateGasMargin";

export const muteTrade = async (
  privateKey: string,
  percentageOfWalletBalance: number,
  inToken: Token,
  outToken: Token
): Promise<void> => {
  const { url, muteRouterAddress } = networks["zksync"];

  if (
    (inToken.symbol !== "USDC" && inToken.symbol !== "USD+") ||
    (outToken.symbol !== "USDC" && outToken.symbol !== "USD+")
  ) {
    throw new Error(
      "On mute trade for now only USDC and USD+ pool is supported"
    );
  }

  const provider: ethers.JsonRpcProvider = new ethers.JsonRpcProvider(url);

  const wallet: ethers.Wallet = new ethers.Wallet(privateKey, provider);

  console.log(`STARTING TRADE FOR ADDRESS: ${wallet.address}`);

  const muteRouter = ROUTER_ABI__factory.connect(muteRouterAddress, wallet);

  const fromTokenContract = ERC20_ABI__factory.connect(inToken.address, wallet);

  const allowance = await fromTokenContract.allowance(
    wallet.address,
    muteRouter
  );

  const balance = await fromTokenContract.balanceOf(wallet.address);

  const inAmount = (balance * BigInt(percentageOfWalletBalance)) / BigInt(100);

  if (allowance < inAmount) {
    const approveTx = await fromTokenContract.approve(
      muteRouter,
      ethers.MaxUint256
    );

    // Thorows an error if you don't wait
    await new Promise((res) =>
      setTimeout(() => res(true), 40000 * Math.random())
    );

    await approveTx.wait();
    console.log(
      `Token approved in tx: ${approveTx.hash} for ${wallet.address}`
    );
  }

  const path = [inToken.address, outToken.address];

  const deadline = BigInt(Math.floor(Date.now() / 1000)) + BigInt(1800);
  const amountOutMin = (inAmount * BigInt(99)) / BigInt(100);

  const swapTxGasEstimate =
    await muteRouter.swapExactTokensForTokens.estimateGas(
      balance,
      amountOutMin,
      path,
      wallet.address,
      deadline,
      [true, true]
    );

  const swapTx = await muteRouter.swapExactTokensForTokens(
    balance,
    amountOutMin,
    path,
    wallet.address,
    deadline,
    [true, true],
    { gasLimit: calculateGasMargin(swapTxGasEstimate) }
  );

  console.log(`Tokens swaped in tx: ${swapTx.hash} for ${wallet.address}`);
};
