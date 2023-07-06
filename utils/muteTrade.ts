import { ethers, BigNumber } from "ethers";
import { network } from "..";
import { Token } from "../data/tokens";
import RouterContractABI from "../abis/mute/ROUTER_ABI.json";
import Erc20Abi from "../abis/ERC20_ABI.json";

export const muteTrade = async (
  privateKey: string,
  amountInUsd: number,
  inToken: Token,
  outToken: Token
): Promise<void> => {
  const provider: ethers.providers.JsonRpcProvider =
    new ethers.providers.JsonRpcProvider(network.url);

  const wallet: ethers.Wallet = new ethers.Wallet(privateKey, provider);

  console.log(`STARTING TRADE FOR ADDRESS: ${wallet.address}`);

  const muteRouter: ethers.Contract = new ethers.Contract(
    network.muteRouter,
    RouterContractABI,
    wallet
  );

  const fromTokenContract: ethers.Contract = new ethers.Contract(
    inToken.address,
    Erc20Abi,
    wallet
  );

  console.log(await fromTokenContract.decimals());

  const allowance = await fromTokenContract.allowance(
    wallet.address,
    network.muteRouter
  );
  const bigNumberAmount = ethers.utils.parseUnits(
    amountInUsd.toString(),
    inToken.decimals
  );

  if (allowance.lt(bigNumberAmount)) {
    const approveTx = await fromTokenContract.approve(
      network.muteRouter,
      ethers.constants.MaxUint256
    );

    await approveTx.wait();
    console.log(
      `Token approved in tx: ${approveTx.hash} for ${wallet.address}`
    );
  }

  const path = [inToken.address, outToken.address];

  const swapTx = await muteRouter.swapExactTokensForTokens(
    bigNumberAmount,
    ethers.utils.parseUnits((amountInUsd * 0.99).toString(), outToken.decimals),
    path,
    wallet.address,
    BigNumber.from(Math.floor(Date.now() / 1000)).add(1800),
    [true, true]
  );
  console.log(`Tokens swaped in tx: ${swapTx.hash} for ${wallet.address}`);
};
