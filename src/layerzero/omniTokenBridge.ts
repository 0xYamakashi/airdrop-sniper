import chalk from "chalk";
import { JsonRpcProvider, Wallet, ZeroAddress, solidityPacked } from "ethers";
import {
  STGtoken__factory,
  Endpoint__factory,
  BTCb__factory,
  STGtoken,
  BTCb,
} from "../../abis/types";
import { NetworkNames, networks } from "../../constants/networks";
import { calculateGasMargin } from "../../utils/calculateGasMargin";
import { Token } from "../../constants/tokens";

export async function bridgeOmniToken({
  parsedNetwork,
  privateKey,
  inTokenSymbol,
  inToken,
  provider,
  percentageOfBalanceForSwap,
  destinationNetwork,
}: {
  parsedNetwork: (typeof networks)[NetworkNames];
  privateKey: string;
  inTokenSymbol: string;
  inToken: Token;
  provider: JsonRpcProvider;
  percentageOfBalanceForSwap: number;
  destinationNetwork: NetworkNames;
}) {
  const wallet = new Wallet(privateKey, provider);

  const tokenContact =
    inToken.symbol === "STG"
      ? STGtoken__factory.connect(inToken.address, wallet)
      : BTCb__factory.connect(inToken.address, wallet);

  const endpoint = Endpoint__factory.connect(
    parsedNetwork.layerzeroEndpointAddress,
    wallet
  );

  const balance = await tokenContact.balanceOf(wallet.address);

  if (balance === BigInt(0)) {
    throw new Error(chalk.red(`No balance for ${inTokenSymbol}`));
  }

  const inAmount = (balance * BigInt(percentageOfBalanceForSwap)) / BigInt(100);
  const adapterParams = solidityPacked(["uint16", "uint256"], [1, 85000]);

  const destinationNetworkLayerzeroChainId =
    networks[destinationNetwork].layerzeroChainId;

  const fees = await endpoint
    .estimateFees(
      destinationNetworkLayerzeroChainId, // the destination LayerZero chainId
      await tokenContact.getAddress(), // your contract address that calls Endpoint.send()
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

  if (inToken.symbol === "STG") {
    const sendTxGasEstimate = await (
      tokenContact as STGtoken
    ).sendTokens.estimateGas(
      destinationNetworkLayerzeroChainId, // send tokens to this chainId
      wallet.address, // bytes calldata _to. where to deliver the tokens on the destination chain
      inAmount, // uint256 _qty, // how many tokens to send
      ZeroAddress, // address zroPaymentAddress, // ZRO payment address
      adapterParams, // bytes calldata adapterParam // txParameters
      {
        value: lzDestinationFee,
      }
    );

    await (tokenContact as STGtoken)
      .sendTokens(
        destinationNetworkLayerzeroChainId, // send tokens to this chainId
        wallet.address, // bytes calldata _to. where to deliver the tokens on the destination chain
        inAmount, // uint256 _qty, // how many tokens to send
        ZeroAddress, // address zroPaymentAddress, // ZRO payment address
        adapterParams, // bytes calldata adapterParam // txParameters
        {
          gasLimit: calculateGasMargin(sendTxGasEstimate),
          value: lzDestinationFee,
        }
      )
      .catch((err) => {
        console.log(chalk.red(err));
      });

    return;
  }

  const sendTxGasEstimate = await (tokenContact as BTCb).sendFrom.estimateGas(
    wallet.address,
    BigInt(networks[destinationNetwork].layerzeroChainId),
    wallet.address, // bytes calldata _to. where to deliver the tokens on the destination chain
    inAmount, // uint256 _qty, // how many tokens to send
    inAmount, // uint256 _qty, // how many tokens to send
    {
      refundAddress: wallet.address, // send tokens to this chainId
      zroPaymentAddress: ZeroAddress, // address zroPaymentAddress, // ZRO payment address
      adapterParams,
    }, // bytes calldata adapterParam // txParameters
    { value: lzDestinationFee }
  );

  await (tokenContact as BTCb)
    .sendFrom(
      wallet.address,
      BigInt(networks[destinationNetwork].layerzeroChainId),
      wallet.address, // bytes calldata _to. where to deliver the tokens on the destination chain
      inAmount, // uint256 _qty, // how many tokens to send
      inAmount, // uint256 _qty, // how many tokens to send
      {
        refundAddress: wallet.address, // send tokens to this chainId
        zroPaymentAddress: ZeroAddress, // address zroPaymentAddress, // ZRO payment address
        adapterParams,
      }, // bytes calldata adapterParam // txParameters
      {
        gasLimit: calculateGasMargin(sendTxGasEstimate),
        value: lzDestinationFee,
      }
    )
    .catch((err) => {
      console.log(chalk.red(err));
    });

  console.log(
    `Bridged ${inAmount} ${inToken.symbol} from ${parsedNetwork} to ${destinationNetwork}  `
  );
}
