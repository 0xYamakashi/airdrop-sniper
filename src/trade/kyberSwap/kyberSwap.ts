import axios from "axios";
import { ethers } from "ethers";
import Erc20Abi from "../../../abis/ERC20_ABI.json";
import { networks } from "../../../constants/networks";
import { Token } from "../../../constants/tokens";

export const kyberswapTrade = async (
  privateKey: string,
  percentageOfWalletBalance: number,
  inToken: Token,
  outToken: Token
): Promise<void> => {
  const { url, kyberswapRouterAddress, wethAddress, name } = networks["zksync"];

  const provider = new ethers.JsonRpcProvider(url);

  try {
    await provider._detectNetwork();
  } catch (err) {
    console.log(err);
  }

  const wallet = new ethers.Wallet(privateKey, provider);

  console.log(`Starting trade for address: ${wallet.address}`);

  const isNativeTokenIn = inToken.symbol === "ETH";

  const fromTokenContract = new ethers.Contract(
    isNativeTokenIn ? wethAddress : inToken.address,
    Erc20Abi,
    wallet
  );

  const balance = isNativeTokenIn
    ? await provider.getBalance(wallet.address)
    : await fromTokenContract.balanceOf(wallet.address);

  if (balance === BigInt(0)) {
    console.log(`Token balance is zero for: ${wallet.address}`);
    return;
  }

  const inAmount = (balance * BigInt(percentageOfWalletBalance)) / BigInt(100);

  const routeResponse = await axios.get(
    `https://aggregator-api.kyberswap.com/${name}/api/v1/routes`,
    {
      params: {
        tokenIn: inToken.address,
        tokenOut: outToken.address,
        amountIn: inAmount,
        saveGas: true,
      },
    }
  );

  const buildResponse = await axios.post(
    `https://aggregator-api.kyberswap.com/${name}/api/v1/route/build`,
    {
      routeSummary: routeResponse.data.data.routeSummary,
      deadline: 0,
      slippageTolerance: 1000, // 1%=100
      sender: wallet.address,
      recipient: wallet.address,
    }
  );

  if (buildResponse.status !== 200) {
    console.log("Failed response from kyberswap api!");
    return;
  }

  const allowance = await fromTokenContract.allowance(
    wallet.address,
    kyberswapRouterAddress
  );

  if (allowance < inAmount && !isNativeTokenIn) {
    const approveTx = await fromTokenContract.approve(
      kyberswapRouterAddress,
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

  const swapTx = await wallet.sendTransaction({
    to: kyberswapRouterAddress,
    from: wallet.address,
    data: buildResponse.data.data.data,
  });

  console.log(`Tokens swaped in tx: ${swapTx.hash}`);
};
