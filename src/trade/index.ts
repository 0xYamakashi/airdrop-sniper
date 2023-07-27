import { config } from "dotenv";
import { findToken } from "../../utils/findToken";
import { program } from "commander";
import { muteTrade } from "./mute/mute";
import { syncswapTrade } from "./syncSwap/syncSwap";
import { inTokenOption } from "../../utils/commanderOptions";
import customConfig from "../../config";
import { getCurrentMainnetGasPrice } from "../../utils/getGasPrice";
import { selectRandomArrayElements } from "../../utils/selectRandomArrayElements";
import { getTokenBalance } from "../../utils/getTokenBalance";
import { networks } from "../../constants/networks";
import { ethers } from "ethers";

config();

async function main(): Promise<void> {
  program
    .description("A sample application to parse options")
    .requiredOption("--protocol <protocol>", "Specify a protocol")
    .requiredOption(...inTokenOption)
    .requiredOption("--outTokenSymbols <outTokenSymbols>", "Alpha")
    .requiredOption(
      "--percentageOfBalanceForSwap <percentageOfBalanceForSwap>",
      "Specify a VALUE"
    )
    .requiredOption("--poolType <poolType>", "Beta")
    .option(
      "--randomCount <randomCount>",
      "randomCount random number of accounts you want to interact with"
    )
    .option(
      "--selectedWalletAddresses <selectedWalletAddresses>",
      "Addresses of wallets you want to use"
    );

  program.parse(process.argv);

  const {
    protocol,
    percentageOfBalanceForSwap,
    poolType,
    randomCount,
  }: {
    protocol: "mute" | "syncswap";
    percentageOfBalanceForSwap: string;
    poolType: "0" | "1";
    randomCount: number;
  } = program.opts();

  const selectedWalletAddresses: string[] = JSON.parse(
    program.opts().selectedWalletAddresses
  );
  const inTokenSymbols: string[] = JSON.parse(program.opts().inTokenSymbols);
  const outTokenSymbols: string[] = JSON.parse(program.opts().outTokenSymbols);

  if (customConfig.maxGasPrice < Number(getCurrentMainnetGasPrice())) {
    throw new Error("Gas price is too high!");
  }

  const inTokens = inTokenSymbols.map((inTokenSymbol) => {
    const token = findToken(inTokenSymbol);
    if (!token) throw new Error("inToken not found");
    return token;
  });

  const outTokens = outTokenSymbols.map((outTokenSymbol) => {
    const token = findToken(outTokenSymbol);
    if (!token) throw new Error("outToken not found");
    return token;
  });

  try {
    const privateKeys = (process.env.PRIVATE_KEYS || "").split(",");
    let eligiblePrivateKeys = [...privateKeys];

    if (selectedWalletAddresses) {
      eligiblePrivateKeys = privateKeys.filter((privateKey) => {
        return (
          selectedWalletAddresses.indexOf(
            new ethers.Wallet(privateKey).address
          ) !== -1
        );
      });
    }

    let balances: {
      [privateKey: string]: {
        // address: string;
        [inTokenAddress: string]: bigint;
      };
    } = {};
    for (const privateKey of privateKeys) {
      for (const inToken of inTokens) {
        const { balance, address } = await getTokenBalance(
          privateKey,
          inToken,
          networks["zkSync Era Mainnet"]
        );

        balances = {
          ...balances,
          [privateKey]: { ...balances[privateKey], [inToken.address]: balance },
        };
      }
    }

    for (let privKey in balances) {
      const value = balances[privKey];
      inTokens.forEach((inToken) => {
        if (value[inToken.address].valueOf() === BigInt(0)) {
          delete balances[privKey][inToken.address];
        }

        if (Object.keys(balances[privKey]).length === 0) {
          eligiblePrivateKeys.splice(eligiblePrivateKeys.indexOf(privKey), 1);
        }
      });
    }

    const selectedKeys = randomCount
      ? selectRandomArrayElements(eligiblePrivateKeys, randomCount)
      : eligiblePrivateKeys;

    const delay =
      Math.random() * (customConfig.maxDelay - customConfig.minDelay) +
      customConfig.minDelay;

    switch (protocol) {
      case "mute":
      case "syncswap": {
        for (const privateKey of selectedKeys) {
          const selectedInToken = inTokens.find(
            (token) => token.address === Object.keys(balances[privateKey])[0]
          );

          if (!selectedInToken) {
            console.error("selectedInToken not found");
            continue;
          }

          const selectedOutToken = selectRandomArrayElements(outTokens, 1)[0];

          if (protocol === "mute") {
            await muteTrade(
              privateKey,
              Number(percentageOfBalanceForSwap),
              selectedInToken,
              selectedOutToken
            );
          } else if (protocol === "syncswap") {
            await syncswapTrade(
              privateKey,
              Number(percentageOfBalanceForSwap),
              selectedInToken,
              selectedOutToken,
              Number(poolType)
            );
          }

          if (selectedKeys.indexOf(privateKey) === selectedKeys.length - 1) {
            break;
          }

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
