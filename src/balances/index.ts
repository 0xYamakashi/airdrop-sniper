import { program } from "commander";
import {
  NetworkNames,
  netowrksArray,
  networks,
} from "../../constants/networks";
import { getTokenBalances } from "./balances";
import { config } from "dotenv";
import { inTokenOption, networkOption } from "../../utils/commanderOptions";
import customConfig from "../../config";
import { getCurrentMainnetGasPrice } from "../../utils/getGasPrice";
import chalk from "chalk";
config();

async function main(): Promise<void> {
  program
    .description("A sample application to parse options")
    .requiredOption(...inTokenOption)
    .requiredOption(...networkOption);

  if (customConfig.maxGasPrice < Number(getCurrentMainnetGasPrice())) {
    throw new Error("Gas price is too high!");
  }

  program.parse(process.argv);
  const {
    network,
    inTokenSymbol,
  }: { network: NetworkNames; inTokenSymbol: string } = program.opts();

  if (!network || netowrksArray.indexOf(network) === -1)
    throw new Error(chalk.red(`Network ${network} not supported`));

  await getTokenBalances([inTokenSymbol], networks[network]);
}

main();
