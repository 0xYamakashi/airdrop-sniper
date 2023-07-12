import { findToken } from "../../utils/findToken";
import { getTokenBalance } from "../../utils/getTokenBalance";
import { program } from "commander";
import { getTokenBalances } from "./getTokenBalance/getTokenBalances";

async function main(): Promise<void> {
  program
    .description("A sample application to parse options")
    .requiredOption("--inTokenSymbol <inTokenSymbol>", "Specify a VALUE")
    .requiredOption("--network <network>", "Specify a VALUE");

  program.parse(process.argv);
  const { inTokenSymbol, network } = program.opts();

  await getTokenBalances(inTokenSymbol, network);
}

main();
