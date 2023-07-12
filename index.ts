import { config } from "dotenv";
import { tokens } from "./data/tokens";
import { PoolType, syncswapTrade } from "./utils/syncswapTrade";
import { muteTrade } from "./utils/muteTrade";
import { ethers } from "ethers";
import { getTokenBalance } from "./utils/getTokenBalance";

config();

const privateKeys = (process.env.PRIVATE_KEYS || "").split(",");

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
  const command = args[0];
  const inTokenSymbol = args[1];
  const outTokenSymbol = args[2];
  const percentageOfBalanceForSwap = parseInt(args[3]);
  const poolType = parseInt(args[4]); // 0 for stable, 1 for others

  const inToken = tokens.find((token) => token.symbol === inTokenSymbol);
  const outToken = tokens.find((token) => token.symbol === outTokenSymbol);

  if (!inToken) {
    throw new Error("Token not found");
  }

  for (const [index, privateKey] of privateKeys.entries()) {
    try {
      const delay = Math.random() * (MAX_DELAY - MIN_DELAY) + MIN_DELAY;
      const isLastKey = index === privateKeys.length - 1;

      if (command === "balances") {
        await getTokenBalance(privateKey, inToken);
      } else if (command === "mute" && outToken) {
        await muteTrade(
          privateKey,
          percentageOfBalanceForSwap,
          inToken,
          outToken
        );
        if (!isLastKey) {
          console.log("Delay before next trade: ", delay);
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      } else if (command === "syncswap" && outToken) {
        await syncswapTrade(
          privateKey,
          percentageOfBalanceForSwap,
          inToken,
          outToken,
          poolType
        );
        if (!isLastKey) {
          console.log("Delay before next trade: ", delay);
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
    } catch (e) {
      console.error("Error", e);
    }
  }

  console.log("FINISHED!!!!!!!!!!!!");
};

main();
