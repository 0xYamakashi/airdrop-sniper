import { config } from "dotenv";
import { findToken } from "../../utils/findToken";
import { program } from "commander";
import { muteTrade } from "./mute/mute";
import { syncswapTrade } from "./syncSwap/syncSwap";
import { MAX_DELAY, MIN_DELAY } from "../../constants";

config();
const privateKeys = (process.env.PRIVATE_KEYS || "").split(",");

async function main(): Promise<void> {
  program
    .description("A sample application to parse options")
    .requiredOption("--protocol <protocol>", "Specify a ")
    .requiredOption("--inTokenSymbol <inTokenSymbol>", "Specify a VALUE")
    .requiredOption("--outTokenSymbol <outTokenSymbol>", "Alpha")
    .requiredOption(
      "--percentageOfBalanceForSwap <percentageOfBalanceForSwap>",
      "Specify a VALUE"
    )
    .requiredOption("--poolType <poolType>", "Beta");

  program.parse(process.argv);

  const {
    protocol,
    inTokenSymbol,
    outTokenSymbol,
    percentageOfBalanceForSwap,
    poolType,
  } = program.opts();

  const inToken = findToken(inTokenSymbol);
  const outToken = findToken(outTokenSymbol);

  if (!inToken) throw new Error("inToken not found");
  if (!outToken) throw new Error("outToken not found");

  try {
    const delay = Math.random() * (MAX_DELAY - MIN_DELAY) + MIN_DELAY;

    switch (protocol) {
      case "mute": {
        for (const privateKey of privateKeys) {
          await muteTrade(
            privateKey,
            Number(percentageOfBalanceForSwap),
            inToken,
            outToken
          );

          console.log("Delay before next trade: ", delay);
          new Promise((resolve) => setTimeout(resolve, delay));
        }
        break;
      }
      case "syncswap": {
        for (const privateKey of privateKeys) {
          await syncswapTrade(
            privateKey,
            Number(percentageOfBalanceForSwap),
            inToken,
            outToken,
            Number(poolType)
          );

          console.log("Delay before next trade: ", delay);
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
        break;
      }
    }
  } catch (e) {
    console.error("Error", e);
  }

  console.log("FINISHED!!!!!!!!!!!!");
}

main();
