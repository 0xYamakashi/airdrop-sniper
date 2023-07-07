import { ethers, BigNumber } from "ethers";
import { defaultAbiCoder } from "ethers/lib/utils";
import { network } from "..";
import { Token } from "../data/tokens";
import RouterContractABI from "../abis/syncswap/ROUTER_ABI.json";
import Erc20Abi from "../abis/ERC20_ABI.json";
import StablePoolFactoryAbi from "../abis/syncswap/STABLE_POOL_FACTORY_ABI.json";

export enum PoolType {
  Stable = 0,
  Classic = 1,
}

export const syncswapTrade = async (
  privateKey: string,
  percentageOfWalletBallance: number,
  inToken: Token,
  outToken: Token,
  poolType: PoolType
): Promise<void> => {
  const provider: ethers.providers.JsonRpcProvider =
    new ethers.providers.JsonRpcProvider(network.url);

  const wallet: ethers.Wallet = new ethers.Wallet(privateKey, provider);

  console.log(`STARTING TRADE FOR ADDRESS: ${wallet.address}`);

  const isNativeTokenIn = inToken.symbol === "ETH";
  const isNativeTokenOut = outToken.symbol === "ETH";


  const syncswapRouter: ethers.Contract = new ethers.Contract(
    network.syncswapRouter,
    RouterContractABI,
    wallet
  );

  const fromTokenContract: ethers.Contract = new ethers.Contract(
    isNativeTokenIn ? network.wethAddress : inToken.address,
    Erc20Abi,
    wallet
  );

  const balance = isNativeTokenIn
    ? await provider.getBalance(wallet.address)
    : await fromTokenContract.balanceOf(wallet.address);

  const inAmount = balance.mul(percentageOfWalletBallance).div(100);

  const poolFactoryContract: ethers.Contract = new ethers.Contract(
    poolType
      ? network.syncswapClassicPoolFactory
      : network.syncswapStablePoolFactory,
    StablePoolFactoryAbi,
    provider
  );

  const lpTokenAddress = await poolFactoryContract.getPool(
    isNativeTokenIn ? network.wethAddress : inToken.address,
    isNativeTokenOut ? network.wethAddress : outToken.address
  );

  const allowance = await fromTokenContract.allowance(
    wallet.address,
    network.syncswapRouter
  );

  if (allowance.lt(inAmount) && !isNativeTokenIn) {
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
    [
      isNativeTokenIn ? network.wethAddress : inToken.address,
      wallet.address,
      withdrawMode,
    ] // tokenIn, to, withdraw mode
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
      amountIn: inAmount,
    },
  ];

  const swapTx = await syncswapRouter.swap(
    paths,
    0,
    BigNumber.from(Math.floor(Date.now() / 1000)).add(1800),
    {
      value: isNativeTokenIn ? inAmount : 0,
    }
  );

  console.log(`Tokens swaped in tx: ${swapTx.hash} for ${wallet.address}`);
};
