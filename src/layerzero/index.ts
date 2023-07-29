import { program } from "commander";
import { Endpoint__factory, STGtoken__factory } from "../../abis/types";
import {
  NetworkNames,
  netowrksArray,
  networks,
} from "../../constants/networks";
import chalk from "chalk";
import { findToken } from "../../utils/findToken";
import { JsonRpcProvider, Wallet, ZeroAddress, solidityPacked } from "ethers";
import { config } from "dotenv";
import { calculateGasMargin } from "../../utils/calculateGasMargin";

config();
async function main() {
  program
    .description("A sample application to parse options")
    .requiredOption(
      "--originNetwork <originNetwork>",
      `Specify a origin network`
    )
    .requiredOption(
      "--destinationNetwork <destinationNetwork>",
      "Specify a destination network"
    )
    .requiredOption(
      "--inTokenSymbol <inTokenSymbol>",
      "Specify a paying token",
      "STG"
    )
    .requiredOption(
      "--percentageOfBalanceForSwap <percentageOfBalanceForSwap>",
      "Specify a VALUE"
    );
  // .option(...selectedWalletAddressesOption);
  program.parse(process.argv);

  const privateKey = (process.env.PRIVATE_KEYS || "").split(",")[3];

  const {
    originNetwork,
    destinationNetwork,
    inTokenSymbol,
    selectedWalletAddresses,
    percentageOfBalanceForSwap,
  }: {
    originNetwork?: NetworkNames;
    destinationNetwork?: NetworkNames;
    inTokenSymbol: string;
    selectedWalletAddresses: string[];
    percentageOfBalanceForSwap: string;
  } = program.opts();

  console.log(
    originNetwork,
    destinationNetwork,
    inTokenSymbol,
    selectedWalletAddresses,
    percentageOfBalanceForSwap,
    "dadad"
  );

  if (!originNetwork || netowrksArray.indexOf(originNetwork) === -1)
    throw new Error(
      chalk.red(`Network ${chalk.yellow(originNetwork)} not supported`)
    );

  if (!destinationNetwork || netowrksArray.indexOf(destinationNetwork) === -1)
    throw new Error(
      chalk.red(`Network ${chalk.yellow(destinationNetwork)} not supported`)
    );

  const parsedNetwork = networks[originNetwork];

  const inToken = findToken(inTokenSymbol, parsedNetwork.name);

  if (!inToken) {
    throw new Error(
      chalk.red(
        `No inToken found for ${chalk.yellow(inTokenSymbol)} on ${chalk.yellow(
          parsedNetwork.name
        )}`
      )
    );
  }

  const provider = new JsonRpcProvider(parsedNetwork.url);

  try {
    await provider._detectNetwork();
  } catch (err) {
    console.log(err);
  }

  const wallet = new Wallet(privateKey, provider);

  const stgToken = STGtoken__factory.connect(inToken.address, wallet);
  const endpoint = Endpoint__factory.connect(
    parsedNetwork.layerzeroEndpointAddress,
    wallet
  );

  const balance = await stgToken.balanceOf(wallet.address);

  if (balance === BigInt(0)) {
    throw new Error(chalk.red(`No balance for ${inTokenSymbol}`));
  }

  const inAmount = (balance * BigInt(percentageOfBalanceForSwap)) / BigInt(100);
  const adapterParam = solidityPacked(["uint16", "uint256"], [1, 85000]);

  const destinationNetworkLayerzeroChainId =
    networks[destinationNetwork].layerzeroChainId;

  const fees = await endpoint
    .estimateFees(
      destinationNetworkLayerzeroChainId, // the destination LayerZero chainId
      await stgToken.getAddress(), // your contract address that calls Endpoint.send()
      "0x", // empty payload
      false, // _payInZRO
      "0x" // default '0x' adapterParams, see: Relayer Adapter Param docs
    )
    .catch((err) => {
      console.log(chalk.red(err));
    });

  const lzDestinationFee = fees?.[0];

  if (!lzDestinationFee)
    throw new Error(chalk.red("Not able to estimate fees"));

  const sendTxGasEstimate = await stgToken.sendTokens.estimateGas(
    destinationNetworkLayerzeroChainId, // send tokens to this chainId
    wallet.address, // bytes calldata _to. where to deliver the tokens on the destination chain
    inAmount, // uint256 _qty, // how many tokens to send
    ZeroAddress, // address zroPaymentAddress, // ZRO payment address
    adapterParam, // bytes calldata adapterParam // txParameters
    { value: lzDestinationFee }
  );

  // console.log(`fees[0] is the message fee in wei: ${fees[0].toString()}`);

  await stgToken
    .sendTokens(
      destinationNetworkLayerzeroChainId, // send tokens to this chainId
      wallet.address, // bytes calldata _to. where to deliver the tokens on the destination chain
      inAmount, // uint256 _qty, // how many tokens to send
      ZeroAddress, // address zroPaymentAddress, // ZRO payment address
      adapterParam, // bytes calldata adapterParam // txParameters
      {
        gasLimit: calculateGasMargin(sendTxGasEstimate),
        value: lzDestinationFee,
      }
    )
    .catch((err) => {
      console.log(chalk.red(err));
    });
}

main();
