import { ethers } from "ethers";
import { Token } from "../../../constants/tokens";
import RouterContractABI from "../../../abis/mute/ROUTER_ABI.json";
import Erc20Abi from "../../../abis/ERC20_ABI.json";
import { networks } from "../../../constants/networks";

export const muteTrade = async (
  privateKey: string,
  percentageOfWalletBalance: number,
  inToken: Token,
  outToken: Token
): Promise<void> => {
  const { url, muteRouterAddress } = networks["zkSync Era Mainnet"];

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

  const muteRouter: ethers.Contract = new ethers.Contract(
    muteRouterAddress,
    RouterContractABI,
    wallet
  );

  const fromTokenContract: ethers.Contract = new ethers.Contract(
    inToken.address,
    Erc20Abi,
    wallet
  );

  const allowance = await fromTokenContract.allowance(
    wallet.address,
    muteRouter
  );

  const balance = await fromTokenContract.balanceOf(wallet.address);

  const inAmount = balance.mul(percentageOfWalletBalance).div(100);

  if (allowance.lt(inAmount)) {
    const approveTx = await fromTokenContract.approve(
      muteRouter,
      ethers.MaxUint256
    );

    await approveTx.wait();
    console.log(
      `Token approved in tx: ${approveTx.hash} for ${wallet.address}`
    );
  }

  const path = [inToken.address, outToken.address];

  const swapTx = await muteRouter.swapExactTokensForTokens(
    balance,
    inAmount.mul(99).div(100),
    path,
    wallet.address,
    BigInt(Math.floor(Date.now() / 1000)) + BigInt(1800),
    [true, true]
  );
  console.log(`Tokens swaped in tx: ${swapTx.hash} for ${wallet.address}`);
};
