import { config } from "dotenv";
import { findToken } from "../../utils/findToken";
import { program } from "commander";
import { muteTrade } from "./mute/mute";
import { syncswapTrade } from "./syncSwap/syncSwap";
import {
  inTokenOption,
  networkOption,
  selectedWalletAddressesOption,
} from "../../utils/commanderOptions";
import customConfig from "../../config";
import { getCurrentMainnetGasPrice } from "../../utils/getGasPrice";
import { selectRandomArrayElements } from "../../utils/selectRandomArrayElements";
import { getTokenBalance } from "../../utils/getTokenBalance";
import {
  NetworkNames,
  netowrksArray,
  networks,
} from "../../constants/networks";
import { ethers } from "ethers";
import chalk from "chalk";
import { filterPkByAddress } from "../../utils/filterPkByAddress";
import { kyberswapTrade } from "./kyberSwap/kyberSwap";
import { getTokensGroupedByCategory } from "../../constants/tokens";

config();

async function main(): Promise<void> {
  program
    .description("A sample application to parse options")
    .requiredOption(...networkOption)
    .requiredOption("--protocol <protocol>", "Specify a protocol")
    .requiredOption("--network <protocol>", "Specify a protocol")
    .requiredOption(
      "--percentageOfBalanceForSwap <percentageOfBalanceForSwap>",
      "Specify a VALUE"
    )
    .option(
      "--tradeType <tradeType>",
      "You can specify trade type: 'stables', 'ethereums', 'others'"
    )
    .option(...inTokenOption)
    .option("--outTokenSymbol <outTokenSymbol>", "Alpha")
    .option(
      "--randomCount <randomCount>",
      "randomCount random number of accounts you want to interact with"
    )
    .option(...selectedWalletAddressesOption);

  program.parse(process.argv);

  const {
    protocol,
    network: networkName,
    percentageOfBalanceForSwap,
    randomCount,
    inTokenSymbol,
    outTokenSymbol,
    selectedWalletAddresses,
    tradeType,
  }: {
    network?: NetworkNames;
    protocol?: "mute" | "syncswap" | "kyberswap";
    percentageOfBalanceForSwap?: string;
    randomCount?: string;
    inTokenSymbol?: string;
    outTokenSymbol?: string;
    selectedWalletAddresses?: string;
    tradeType?: "stables" | "ethereums" | "others" | "hop";
  } = program.opts();

  if (!networkName || netowrksArray.indexOf(networkName) === -1)
    throw new Error(chalk.red(`Network ${networkName} not supported`));

  const network = networks[networkName];

  const selectedWalletAddressesParsed: string[] =
    selectedWalletAddresses && JSON.parse(selectedWalletAddresses);

  const { stable, ethereum } = getTokensGroupedByCategory(networkName);

  // tradeType is defined, but is neither "stables" nor "ethereums"
  if (tradeType && tradeType !== "ethereums" && tradeType !== "stables") {
    throw new Error(
      chalk.red("Trade type must be either 'stables' or 'ethereums'")
    );
  }

  // tradeType is not defined and there is no inTokenSymbol or outTokenSymbol
  if (!tradeType && (!inTokenSymbol || !outTokenSymbol))
    throw new Error(
      chalk.red("You must specify inTokenSymbol and outTokenSymbol")
    );

  const [inTokenSymbolsParsed, outTokenSymbolsParsed]: [string[], string[]] =
    tradeType === "stables"
      ? [stable, stable]
      : tradeType === "ethereums"
      ? [ethereum, ethereum]
      : [[inTokenSymbol!], [outTokenSymbol!]];

  if (customConfig.maxGasPrice < Number(getCurrentMainnetGasPrice())) {
    throw new Error("Gas price is too high!");
  }

  const inTokens = inTokenSymbolsParsed.map((inTokenSymbol) => {
    const token = findToken(inTokenSymbol, networkName);
    if (!token) throw new Error("inToken not found");
    return token;
  });

  const outTokens = outTokenSymbolsParsed.map((outTokenSymbol) => {
    const token = findToken(outTokenSymbol, networkName);
    if (!token) throw new Error("outToken not found");
    return token;
  });

  const privateKeys = (process.env.PRIVATE_KEYS || "").split(",");
  let eligiblePrivateKeys = [...privateKeys];

  if (selectedWalletAddressesParsed) {
    eligiblePrivateKeys = filterPkByAddress(
      privateKeys,
      selectedWalletAddressesParsed
    );
  }

  let balancesByPk: {
    [privateKey: string]: {
      [inTokenAddress: string]: bigint;
    };
  } = {};

  for (const privateKey of privateKeys) {
    for (const inToken of inTokens) {
      const { balance } = await getTokenBalance(privateKey, inToken, network);

      if (balance > BigInt(0)) {
        balancesByPk = {
          ...balancesByPk,
          [privateKey]: {
            ...balancesByPk[privateKey],
            [inToken.address]: balance,
          },
        };
      }

      if (selectedWalletAddressesParsed) {
        eligiblePrivateKeys = privateKeys.filter((privateKey) => {
          return (
            selectedWalletAddressesParsed.indexOf(
              new ethers.Wallet(privateKey).address
            ) !== -1
          );
        });
      }
    }
  }

  for (let privKey in balancesByPk) {
    if (Object.keys(balancesByPk[privKey]).length === 0)
      eligiblePrivateKeys.splice(eligiblePrivateKeys.indexOf(privKey), 1);
  }

  const selectedKeys = randomCount
    ? selectRandomArrayElements(eligiblePrivateKeys, Number(randomCount))
    : selectRandomArrayElements(
        eligiblePrivateKeys,
        eligiblePrivateKeys.length
      );

  for (const privateKey of selectedKeys) {
    const delay =
      Math.random() * (customConfig.maxDelay - customConfig.minDelay) +
      customConfig.minDelay;

    const availableInToken = selectRandomArrayElements(
      Object.keys(balancesByPk[privateKey]),
      1
    )[0];

    const selectedInToken = inTokens.find(
      (token) => token.address === availableInToken
    );

    if (!selectedInToken) {
      console.error("selectedInToken not found");
      continue;
    }

    const selectedOutToken = selectRandomArrayElements(
      outTokens.filter((t) => t.address !== selectedInToken.address),
      1
    )[0];

    const provider = new ethers.JsonRpcProvider(network.url);

    try {
      await provider._detectNetwork();
    } catch (err) {
      console.log(err);
    }

    const wallet = new ethers.Wallet(privateKey, provider);

    if (!wallet?.provider) {
      throw new Error("Wallet provider not found");
    }

    console.log(`Starting trade for address: ${wallet.address}`);

    try {
      if (protocol === "mute") {
        await muteTrade(
          Number(percentageOfBalanceForSwap),
          selectedInToken,
          selectedOutToken,
          network as (typeof networks)["zksync"],
          wallet
        );
      } else if (protocol === "syncswap") {
        await syncswapTrade(
          Number(percentageOfBalanceForSwap),
          selectedInToken,
          selectedOutToken,
          network as (typeof networks)["zksync"],
          wallet
        );
      } else if (protocol === "kyberswap") {
        await kyberswapTrade(
          Number(percentageOfBalanceForSwap),
          selectedInToken,
          selectedOutToken,
          network as (typeof networks)["zksync"],
          wallet
        );
      }

      if (selectedKeys.indexOf(privateKey) === selectedKeys.length - 1) {
        break;
      }

      console.log("Delay before next trade: ", delay);
      await new Promise((resolve) => setTimeout(resolve, delay));
    } catch (e) {
      console.log(
        chalk.red(`Error in ${protocol} trade for address: `) +
          chalk.yellow(new ethers.Wallet(privateKey).address) +
          "\n" +
          e +
          "\n"
      );
    }

    if (selectedKeys.indexOf(privateKey) === selectedKeys.length - 1) {
      break;
    }

    console.log("Delay before next trade: ", delay);
    await new Promise((resolve) => setTimeout(resolve, delay));
  }

  console.log(chalk.green("FINISHED!!!!!!!!!!!!"));
}

main();
