import { ethers, AbiCoder, JsonRpcProvider } from "ethers";
import { Token, tokens } from "../../../constants/tokens";
import { networks } from "../../../constants/networks";
import {
  ERC20_ABI__factory,
  POOL_ABI__factory,
  STABLE_POOL_FACTORY_ABI__factory,
} from "../../../abis/types";
import { ROUTER_ABI__factory } from "../../../abis/types/factories/syncswap";
import { calculateGasMargin } from "../../../utils/calculateGasMargin";

export const syncswapTrade = async (
  privateKey: string,
  percentageOfWalletBallance: number,
  inToken: Token,
  outToken: Token
): Promise<void> => {
  const {
    url,
    syncswapRouterAddress,
    wethAddress,
    syncswapClassicPoolFactoryAddress,
    syncswapStablePoolFactoryAddress,
  } = networks["zksync"];

  const provider = new JsonRpcProvider(url);

  try {
    await provider._detectNetwork();
  } catch (err) {
    console.log(err);
  }

  const wallet = new ethers.Wallet(privateKey, provider);

  console.log(
    `STARTING TRADE FOR ADDRESS: ${wallet.address} from token ${inToken.symbol} to token ${outToken.symbol} for ${percentageOfWalletBallance}% of wallet balance`
  );

  const isNativeTokenIn = inToken.symbol === "ETH";
  const isNativeTokenOut = outToken.symbol === "ETH";

  const syncswapRouterContract = ROUTER_ABI__factory.connect(
    syncswapRouterAddress,
    wallet
  );

  const fromTokenContract = ERC20_ABI__factory.connect(
    isNativeTokenIn ? wethAddress : inToken.address,
    wallet
  );

  const balance = isNativeTokenIn
    ? await provider.getBalance(wallet.address)
    : await fromTokenContract.balanceOf(wallet.address);

  const inAmount = (balance * BigInt(percentageOfWalletBallance)) / BigInt(100);

  const isStablePair =
    inToken.category === "stable" && outToken.category === "stable";

  const poolFactoryContract = STABLE_POOL_FACTORY_ABI__factory.connect(
    isStablePair
      ? syncswapStablePoolFactoryAddress
      : syncswapClassicPoolFactoryAddress,
    wallet
  );

  const lpTokenAddress = await poolFactoryContract.getPool(
    isNativeTokenIn ? wethAddress : inToken.address,
    isNativeTokenOut ? wethAddress : outToken.address
  );

  console.log(`LP Token Address: ${lpTokenAddress}`);

  const pool = POOL_ABI__factory.connect(lpTokenAddress, wallet);
  const reserves = await pool.getReserves();
  const [reserveInToken, reserveOutToken] =
    (isNativeTokenIn ? wethAddress : inToken.address) <
    (isNativeTokenOut ? wethAddress : outToken.address)
      ? reserves
      : [reserves[1], reserves[0]];

  const slippageRate = 99;

  const amountOutMin = isStablePair
    ? (BigInt(inAmount) * BigInt(99)) / BigInt(100)
    : (((reserveOutToken * BigInt(inAmount)) / BigInt(reserveInToken)) *
        BigInt(slippageRate)) /
      BigInt(100);

  const allowance = await fromTokenContract.allowance(
    wallet.address,
    syncswapRouterContract
  );

  if (allowance < inAmount && !isNativeTokenIn) {
    const approveTx = await fromTokenContract.approve(
      syncswapRouterContract,
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

  const deadline = BigInt(Math.floor(Date.now() / 1000)) + BigInt(1800);

  const swapTxGasEstimate = await syncswapRouterContract.swap.estimateGas(
    paths,
    amountOutMin,
    deadline,
    {
      value: isNativeTokenIn ? inAmount : 0,
    }
  );

  await new Promise((res) =>
    setTimeout(() => res(true), 15000 * Math.random())
  );

  console.log(`Swap tx gas estimate: ${swapTxGasEstimate.toString()}`);

  const swapTx = await syncswapRouterContract.swap(
    paths,
    amountOutMin,
    deadline,
    {
      value: isNativeTokenIn ? inAmount : 0,
      gasLimit: calculateGasMargin(swapTxGasEstimate),
    }
  );

  console.log(`Tokens swaped in tx: ${swapTx.hash}`);
};
