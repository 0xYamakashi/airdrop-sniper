import { ethers, Contract, AbiCoder } from "ethers";
import { Token } from "../../../constants/tokens";
import RouterContractAbi from "../../../abis/syncswap/ROUTER_ABI.json";
import Erc20Abi from "../../../abis/ERC20_ABI.json";
import StablePoolFactoryAbi from "../../../abis/syncswap/STABLE_POOL_FACTORY_ABI.json";
import PoolAbi from "../../../abis/syncswap/POOL_ABI.json";
import { networks } from "../../../constants/networks";

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
  const {
    url,
    syncswapRouter,
    wethAddress,
    syncswapClassicPoolFactory,
    syncswapStablePoolFactory,
  } = networks["zkSync Era Mainnet"];

  const provider: ethers.JsonRpcProvider = new ethers.JsonRpcProvider(url);

  const wallet: ethers.Wallet = new ethers.Wallet(privateKey, provider);

  console.log(`STARTING TRADE FOR ADDRESS: ${wallet.address}`);

  const isNativeTokenIn = inToken.symbol === "ETH";
  const isNativeTokenOut = outToken.symbol === "ETH";

  const syncswapRouterContract: ethers.Contract = new ethers.Contract(
    syncswapRouter,
    RouterContractAbi,
    wallet
  );

  const fromTokenContract: ethers.Contract = new ethers.Contract(
    isNativeTokenIn ? wethAddress : inToken.address,
    Erc20Abi,
    wallet
  );

  const balance = isNativeTokenIn
    ? await provider.getBalance(wallet.address)
    : await fromTokenContract.balanceOf(wallet.address);

  const inAmount = balance * BigInt(percentageOfWalletBallance) / BigInt(100);

  const poolFactoryContract: ethers.Contract = new ethers.Contract(
    poolType ? syncswapClassicPoolFactory : syncswapStablePoolFactory,
    StablePoolFactoryAbi,
    provider
  );

  const lpTokenAddress = await poolFactoryContract.getPool(
    isNativeTokenIn ? wethAddress : inToken.address,
    isNativeTokenOut ? wethAddress : outToken.address
  );

  const pool: Contract = new Contract(lpTokenAddress, PoolAbi, provider);
  const reserves: [bigint, bigint] = await pool.getReserves();
  const [reserveInToken, reserveOutToken] =
    (isNativeTokenIn ? wethAddress : inToken.address) <
    (isNativeTokenOut ? wethAddress : outToken.address)
      ? reserves
      : [reserves[1], reserves[0]];

  const slippageRate = 99;

  const amountOutMin =
    (((reserveOutToken * BigInt(inAmount)) / BigInt(reserveInToken)) *
      BigInt(slippageRate)) /
    BigInt(100);

  const allowance = await fromTokenContract.allowance(
    wallet.address,
    syncswapRouterContract
  );

  if (allowance.lt(inAmount) && !isNativeTokenIn) {
    const approveTx = await fromTokenContract.approve(
      syncswapRouterContract,
      ethers.MaxUint256
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

  const swapData: string = new AbiCoder().encode(
    ["address", "address", "uint8"],
    [
      isNativeTokenIn ? wethAddress : inToken.address,
      wallet.address,
      withdrawMode,
    ] // tokenIn, to, withdraw mode
  );

  // We have only 1 step.
  const steps = [
    {
      pool: lpTokenAddress,
      data: swapData,
      callback: ethers.ZeroAddress, // we don't have a callback
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

  const swapTx = await syncswapRouterContract.swap(
    paths,
    amountOutMin,
    BigInt(Math.floor(Date.now() / 1000)) + BigInt(1800),
    {
      value: isNativeTokenIn ? inAmount : 0,
    }
  );

  console.log(`Tokens swaped in tx: ${swapTx.hash}`);
};
