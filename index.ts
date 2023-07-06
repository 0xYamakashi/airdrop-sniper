import { config } from "dotenv";
import { tokens } from "./data/tokens";
import { syncswapTrade } from "./utils/syncswapTrade";
import { muteTrade } from "./utils/muteTrade";


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
};

const main = async (): Promise<void> => {
  const inToken = tokens.find((token) => token.symbol === "USDC");
  const outToken = tokens.find((token) => token.symbol === "USD+");

  if (!inToken || !outToken) {
    throw new Error("Token not found");
  }
  for (const privateKey of privateKeys) {
    try {
      // on mute u only have USDC/USD+ pool
      await muteTrade(privateKey, 0.4, inToken, outToken);
      await syncswapTrade(privateKey, 0.4, inToken, outToken);
    } catch (e) {
      console.error("Error", e);
    }
  }
};

main();
