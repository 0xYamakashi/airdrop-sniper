import { BigNumber, Signer, ethers } from "ethers";
import RouterContractABI from "./abis/ROUTER_ABI.json";
import Erc20Abi from "./abis/ERC20_ABI.json";
import StablePoolFactoryAbi from "./abis/STABLE_POOL_FACTORY_ABI.json";
import { defaultAbiCoder } from "ethers/lib/utils";
import { Token, tokens } from "./data/tokens";
import { config } from "dotenv";

config();

const privateKeys = (process.env.PRIVATE_KEYS || "").split(",");

const network = {
  name: "zkSync Era Mainnet",
  chainId: 324,
  url: "https://mainnet.era.zksync.io",
  syncswapRouter: "0x2da10A1e27bF85cEdD8FFb1AbBe97e53391C0295",
  syncswapStablePoolFactory: "0x5b9f21d407F35b10CbfDDca17D5D84b129356ea3",
  syncswapClassicPoolFactory: "0xf2DAd89f2788a8CD54625C60b55cD3d2D0ACa7Cb",
};

const trade = async (
  privateKey: string,
  amountInUsd: number,
  inToken: Token,
  outToken: Token
): Promise<void> => {
  const provider: ethers.providers.JsonRpcProvider =
    new ethers.providers.JsonRpcProvider(network.url);

  const wallet: ethers.Wallet = new ethers.Wallet(privateKey, provider);

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

const main = async (): Promise<void> => {
  const inToken = tokens.find((token) => token.symbol === "USDC");
  const outToken = tokens.find((token) => token.symbol === "USDT");

  if (!inToken || !outToken) {
    throw new Error("Token not found");
  }
  for (const privateKey of privateKeys) {
    await trade(privateKey, 1, inToken, outToken);
  }
};

main();
