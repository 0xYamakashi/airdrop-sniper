import { program } from "commander";
import { getNetwork } from "../../constants/networks";
import { config } from "dotenv";
import { wrap } from "./wrap";
import { unWrap } from "./unWrap";
import { MAX_DELAY, MIN_DELAY } from "../../constants";

config();
const privateKeys = (process.env.PRIVATE_KEYS || "").split(",");

async function main(): Promise<void> {
  program
    .description("A sample application to parse options")
    .requiredOption("--option <option>", "Specify a VALUE")
    .requiredOption("--network <network>", "Specify a VALUE")
    .requiredOption(
      "--percentageOfBalanceForSwap <percentageOfBalanceForSwap>",
      "Specify a VALUE"
    );

  program.parse(process.argv);
  const { option, network, percentageOfBalanceForSwap } = program.opts();
  console.log("test");

  const definedNetwork = getNetwork(network);
  if (!definedNetwork) {
    throw new Error("No network with this key!");
  }
  for (const [index, privateKey] of privateKeys.entries()) {
    const delay = Math.random() * (MAX_DELAY - MIN_DELAY) + MIN_DELAY;

    if (index % 2 !== 1) {
      continue;
    }
    try {
      if (option === "wrap") {
        await wrap(privateKey, percentageOfBalanceForSwap, definedNetwork);
      } else if (option === "unwrap") {
        await unWrap(privateKey, percentageOfBalanceForSwap, definedNetwork);
      }
    } catch (e) {
      console.error("Error", e);
    }
    console.log("Delay before next wrap: ", delay);
    await new Promise((resolve) => setTimeout(resolve, delay));
  }
}

main();
