import { formatUnits } from "ethers";
import { NetworkNames, networks } from "../../constants/networks";
import { findToken } from "../../utils/findToken";
import { getTokenBalance } from "../../utils/getTokenBalance";

export async function getTokenBalances(
  inTokenSymbol: string,
  network: (typeof networks)[NetworkNames]
) {
  const privateKeys = (process.env.PRIVATE_KEYS || "").split(",");

  const inToken = findToken(inTokenSymbol);

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
