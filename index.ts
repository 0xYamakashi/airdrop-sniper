import { config } from "dotenv";
import { tokens } from "./data/tokens";
import { PoolType, syncswapTrade } from "./utils/syncswapTrade";
import { muteTrade } from "./utils/muteTrade";
import { ethers } from "ethers";
import { getTokenBalance } from "./utils/getTokenBalance";

config();

const privateKeys = (process.env.PRIVATE_KEYS || "").split(",");

type Arguments = {
  protocol: string;
  inTokenSymbol: string;
  outTokenSymbol: string;
  percentageOfBalanceForSwap: string;
  poolType: string;
};

export const network = {
  name: "zkSync Era Mainnet",
  chainId: 324,
  url: "https://mainnet.era.zksync.io",
  syncswapRouter: "0x2da10A1e27bF85cEdD8FFb1AbBe97e53391C0295",
  syncswapStablePoolFactory: "0x5b9f21d407F35b10CbfDDca17D5D84b129356ea3",
  syncswapClassicPoolFactory: "0xf2DAd89f2788a8CD54625C60b55cD3d2D0ACa7Cb",
  muteRouter: "0x8B791913eB07C32779a16750e3868aA8495F5964",
  ethAddress: ethers.constants.AddressZero,
  wethAddress: "0x5aea5775959fbc2557cc8789bc1bf90a239d9a91",
};

const MIN_DELAY = 500000;
const MAX_DELAY = 1000000;

const main = async (): Promise<void> => {
  const args = process.argv.slice(2);

  const {
    protocol,
    inTokenSymbol,
    outTokenSymbol,
    percentageOfBalanceForSwap,
    poolType,
  }: Arguments = args.reduce((obj, arg) => {
    let [key, value] = arg.split("=");
    key = key.replace("--", "");
    obj[key as keyof Arguments] = value;
    return obj;
  }, {} as Arguments);

  Object.values({
    protocol,
    inTokenSymbol,
    outTokenSymbol,
    percentageOfBalanceForSwap,
    poolType,
  }).forEach((v) => {
    if (!v) throw new Error(`Missing argument`);
  });

  const inToken = tokens.find((token) => token.symbol === inTokenSymbol);
  const outToken = tokens.find((token) => token.symbol === outTokenSymbol);

  if (!inToken) {
    throw new Error("inToken not found");
  }
  if (!outToken) {
    throw new Error("outToken not found");
  }

  for (const [index, privateKey] of privateKeys.entries()) {
    try {
      const delay = Math.random() * (MAX_DELAY - MIN_DELAY) + MIN_DELAY;
      const isLastKey = index === privateKeys.length - 1;

      switch (protocol) {
        case "balances": {
          await getTokenBalance(privateKey, inToken);
          break;
        }
        case "mute": {
          await muteTrade(
            privateKey,
            Number(percentageOfBalanceForSwap),
            inToken,
            outToken
          );
          if (!isLastKey) {
            console.log("Delay before next trade: ", delay);
            await new Promise((resolve) => setTimeout(resolve, delay));
          }
          break;
        }
        case "syncswap": {
          await syncswapTrade(
            privateKey,
            Number(percentageOfBalanceForSwap),
            inToken,
            outToken,
            Number(poolType)
          );
          if (!isLastKey) {
            console.log("Delay before next trade: ", delay);
            await new Promise((resolve) => setTimeout(resolve, delay));
          }
          break;
        }
      }
    } catch (e) {
      console.error("Error", e);
    }
  }

  console.log("FINISHED!!!!!!!!!!!!");
};

main();
