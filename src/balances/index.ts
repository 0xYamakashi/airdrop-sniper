import { program } from "commander";
import { NetworkNames, getNetwork } from "../../constants/networks";
import { getTokenBalances } from "./balances";
import { config } from "dotenv";
import { inTokenOption, networkOption } from "../../utils/commanderOptions";
config();

async function main(): Promise<void> {
  program
    .description("A sample application to parse options")
    .requiredOption(...inTokenOption)
    .requiredOption(...networkOption);

  program.parse(process.argv);
  const {
    inTokenSymbol,
    network,
  }: { inTokenSymbol: string; network: keyof typeof NetworkNames } =
    program.opts();

  const definedNetwork = getNetwork(network);

  if (!definedNetwork) {
    throw new Error("No network with this key!");
  }
  await getTokenBalances(inTokenSymbol, definedNetwork);
}

main();
