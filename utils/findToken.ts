import { tokens } from "../data/tokens";

export function findToken(tokenSymbol: string) {
  return tokens.find((token) => token.symbol === tokenSymbol);
}
