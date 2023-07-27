import { JsonRpcProvider } from "ethers";
import { networks } from "../constants/networks";

export async function getCurrentMainnetGasPrice() {
  const provider: JsonRpcProvider = new JsonRpcProvider(
    networks["Ethereum Mainnet"].url
  );

  const feeData = await provider.getFeeData();
  return feeData.gasPrice?.toString();
}
