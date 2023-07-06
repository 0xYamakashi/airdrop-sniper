import { ethers, BigNumber } from "ethers";
import { defaultAbiCoder } from "ethers/lib/utils";
import { network } from "..";
import { Token } from "../data/tokens";
import RouterContractABI from "../abis/syncswap/ROUTER_ABI.json";
import Erc20Abi from "../abis/ERC20_ABI.json";
import StablePoolFactoryAbi from "../abis/syncswap/STABLE_POOL_FACTORY_ABI.json";

export const syncswapTrade = async (
  privateKey: string,
  amountInUsd: number,
  inToken: Token,
  outToken: Token
): Promise<void> => {
  const provider: ethers.providers.JsonRpcProvider =
    new ethers.providers.JsonRpcProvider(network.url);

  const wallet: ethers.Wallet = new ethers.Wallet(privateKey, provider);

  console.log(`STARTING TRADE FOR ADDRESS: ${wallet.address}`);

  const syncswapRouter: ethers.Contract = new ethers.Contract(
    network.syncswapRouter,
    RouterContractABI,
    wallet
  );

  const fromTokenContract: ethers.Contract = new ethers.Contract(
    inToken.address,
    Erc20Abi,
    wallet
  );

  const stablePoolFactoryContract: ethers.Contract = new ethers.Contract(
    network.syncswapStablePoolFactory,
    StablePoolFactoryAbi,
    provider
  );

  const lpTokenAddress = await stablePoolFactoryContract.getPool(
    inToken.address,
    outToken.address
  );

  const allowance = await fromTokenContract.allowance(
    wallet.address,
    network.syncswapRouter
  );
  const bigNumberAmount = ethers.utils.parseUnits(
    amountInUsd.toString(),
    inToken.decimals
  );

  if (allowance.lt(bigNumberAmount)) {
    const approveTx = await fromTokenContract.approve(
      network.syncswapRouter,
      ethers.constants.MaxUint256
    );

    await approveTx.wait();
    console.log(
      `Token approved in tx: ${approveTx.hash} for ${wallet.address}`
    );
  }

  const withdrawMode = 1; // 1 or 2 to withdraw to user's wallet

  const swapData: string = defaultAbiCoder.encode(
    ["address", "address", "uint8"],
    [inToken.address, wallet.address, withdrawMode] // tokenIn, to, withdraw mode
  );

  // We have only 1 step.
  const steps = [
    {
      pool: lpTokenAddress,
      data: swapData,
      callback: ethers.constants.AddressZero, // we don't have a callback
      callbackData: "0x",
    },
  ];

  // We have only 1 path.
  const paths = [
    {
      steps: steps,
      tokenIn: inToken.address,
      amountIn: bigNumberAmount,
    },
  ];

  const swapTx = await syncswapRouter.swap(
    paths,
    ethers.utils.parseUnits((amountInUsd * 0.99).toString(), outToken.decimals),
    BigNumber.from(Math.floor(Date.now() / 1000)).add(1800)
  );

  console.log(`Tokens swaped in tx: ${swapTx.hash} for ${wallet.address}`);
};
