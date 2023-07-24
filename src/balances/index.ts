import { program } from "commander";
import { getNetwork } from "../../constants/networks";
import { getTokenBalances } from "./balances";
import { config } from "dotenv";
config();

async function main(): Promise<void> {
  program
    .description("A sample application to parse options")
    .requiredOption("--inTokenSymbol <inTokenSymbol>", "Specify a VALUE")
    .requiredOption("--network <network>", "Specify a VALUE");

  program.parse(process.argv);
  const { inTokenSymbol, network } = program.opts();

  const definedNetwork = getNetwork(network);

  if (!definedNetwork) {
    throw new Error("No network with this key!");
  }
  await getTokenBalances(inTokenSymbol, definedNetwork);
}

main();
