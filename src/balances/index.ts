import { program } from "commander";
import { NetworkNames, networks } from "../../constants/networks";
import { getTokenBalances } from "./balances";
import { config } from "dotenv";
import { inTokenOption, networkOption } from "../../utils/commanderOptions";
import customConfig from "../../config";
import { getCurrentMainnetGasPrice } from "../../utils/getGasPrice";
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
  const { network }: { network: NetworkNames } = program.opts();
  const selectedNetwork = networks[network];
  if (!selectedNetwork) throw new Error("No network with this key!");

  console.log(program.opts().inTokenSymbols, "program.opts().inTokenSymbols");
  const inTokenSymbols: string[] = JSON.parse(program.opts().inTokenSymbols);

  await getTokenBalances(inTokenSymbols[0], selectedNetwork);
}

main();
