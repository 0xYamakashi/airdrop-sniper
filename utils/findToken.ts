import { NetworkNames } from "../constants/networks";
import { tokens } from "../constants/tokens";

export function findToken(tokenSymbol: string, network: NetworkNames) {
  return tokens[network].find((token) => token.symbol === tokenSymbol);
}
