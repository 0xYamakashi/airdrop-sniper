import { ethers, BigNumber, Contract } from "ethers";
import { defaultAbiCoder } from "ethers/lib/utils";
import { network } from "..";
import { Token } from "../data/tokens";
import RouterContractAbi from "../abis/syncswap/ROUTER_ABI.json";
import Erc20Abi from "../abis/ERC20_ABI.json";
import StablePoolFactoryAbi from "../abis/syncswap/STABLE_POOL_FACTORY_ABI.json";
import PoolAbi from "../abis/syncswap/POOL_ABI.json";

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
    RouterContractAbi,
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

  const pool: Contract = new Contract(lpTokenAddress, PoolAbi, provider);
  const reserves: [BigNumber, BigNumber] = await pool.getReserves();
  const [reserveInToken, reserveOutToken] =
    (isNativeTokenIn ? network.wethAddress : inToken.address) <
    (isNativeTokenOut ? network.wethAddress : outToken.address)
      ? reserves
      : [reserves[1], reserves[0]];

  const slippageRate = 99;

  const amountOutMin = reserveOutToken
    .mul(inAmount)
    .div(reserveInToken)
    .mul(slippageRate)
    .div(100);

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

  // Determine withdraw mode, to withdraw native ETH or wETH on last step.
  // 0 - vault internal transfer
  // 1 - withdraw and unwrap to naitve ETH
  // 2 - withdraw and wrap to wETH
  const withdrawMode = 1;

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
    amountOutMin,
    BigNumber.from(Math.floor(Date.now() / 1000)).add(1800),
    {
      value: isNativeTokenIn ? inAmount : 0,
    }
  );

  console.log(`Tokens swaped in tx: ${swapTx.hash}`);
};
