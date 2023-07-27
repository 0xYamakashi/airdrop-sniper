import { JsonRpcProvider } from "ethers";
import { networks } from "../constants/networks";

export async function getCurrentMainnetGasPrice() {
  const provider: JsonRpcProvider = new JsonRpcProvider(
    networks["mainnet"].url
  );

  const feeData = await provider.getFeeData();
  return feeData.gasPrice?.toString();
}
