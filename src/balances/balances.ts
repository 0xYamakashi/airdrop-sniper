import { NetworkNames, Networks } from "../../constants/networks";
import { findToken } from "../../utils/findToken";
import { getTokenBalance } from "../../utils/getTokenBalance";

export async function getTokenBalances(
  inTokenSymbol: string,
  network: Networks[NetworkNames]
) {
  const privateKeys = (process.env.PRIVATE_KEYS || "").split(",");
  const inToken = findToken(inTokenSymbol);

  if (!inToken) {
    throw new Error("inToken not found");
  }
  for (const privateKey of privateKeys) {
    await getTokenBalance(privateKey, inToken, network);
  }
}
