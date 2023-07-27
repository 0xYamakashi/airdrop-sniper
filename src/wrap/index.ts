import { program } from "commander";
import { config } from "dotenv";
import { wrap } from "./wrap";
import { unWrap } from "./unWrap";
import { inTokenOption } from "../../utils/commanderOptions";
import customConfig from "../../config";
import { getCurrentMainnetGasPrice } from "../../utils/getGasPrice";
import chalk from "chalk";
import {
  NetworkNames,
  netowrksArray,
  networks,
} from "../../constants/networks";

config();
const privateKeys = (process.env.PRIVATE_KEYS || "").split(",");

async function main(): Promise<void> {
  program
    .description("A sample application to parse options")
    .requiredOption("--option <option>", "Specify a VALUE")
    .requiredOption(...inTokenOption)
    .requiredOption(
      "--percentageOfBalanceForSwap <percentageOfBalanceForSwap>",
      "Specify a VALUE"
    );

  program.parse(process.argv);
  const {
    option,
    network,
    percentageOfBalanceForSwap,
  }: {
    network?: NetworkNames;
    option?: "wrap" | "unwrap";
    percentageOfBalanceForSwap?: string;
  } = program.opts();

  const percentageOfBalanceForSwapParsed = Number(percentageOfBalanceForSwap);
  if (customConfig.maxGasPrice < Number(getCurrentMainnetGasPrice())) {
    throw new Error("Gas price is too high!");
  }

  if (!network || netowrksArray.indexOf(network) === -1)
    throw new Error(chalk.red(`Network ${network} not supported`));

  const definedNetwork = networks[network];
  for (const [index, privateKey] of privateKeys.entries()) {
    const delay =
      Math.random() * (customConfig.maxDelay - customConfig.minDelay) +
      customConfig.minDelay;
    if (index % 2 !== 1) {
      continue;
    }
    try {
      if (option === "wrap") {
        await wrap(
          privateKey,
          percentageOfBalanceForSwapParsed,
          definedNetwork
        );
      } else if (option === "unwrap") {
        await unWrap(
          privateKey,
          percentageOfBalanceForSwapParsed,
          definedNetwork
        );
      }
    } catch (e) {
      console.error("Error", e);
    }
    console.log("Delay before next wrap: ", delay);
    await new Promise((resolve) => setTimeout(resolve, delay));
  }
}

main();
