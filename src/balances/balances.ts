import { formatUnits } from "ethers";
import { NetworkNames, networks } from "../../constants/networks";
import { findToken } from "../../utils/findToken";
import { getTokenBalance } from "../../utils/getTokenBalance";

export async function getTokenBalances(
  inTokenSymbols: string[],
  network: (typeof networks)[NetworkNames]
) {
  const privateKeys = (process.env.PRIVATE_KEYS || "").split(",");

  const inTokens = inTokenSymbols.map((ts) => findToken(ts, network.name));
  console.log(inTokens);
  for (const inToken of inTokens) {
    if (!inToken) {
      throw new Error("inToken not found");
    }

    for (const privateKey of privateKeys) {
      const { balance, address } = await getTokenBalance(
        privateKey,
        inToken,
        network
      );

      console.log(
        `${inToken.symbol} Balance for ${address}: ${formatUnits(
          balance,
          inToken.decimals
        )}`
      );
    }
  }
}
