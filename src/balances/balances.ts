import { findToken } from "../../utils/findToken";
import { getTokenBalance } from "../../utils/getTokenBalance";
import { config } from "dotenv";
config();

const privateKeys = (process.env.PRIVATE_KEYS || "").split(",");

export async function getTokenBalances(inTokenSymbol: string, network: any) {
  const inToken = findToken(inTokenSymbol);

  if (!inToken) {
    throw new Error("inToken not found");
  }
  for (const privateKey of privateKeys) {
    await getTokenBalance(privateKey, inToken, network);
  }
}
