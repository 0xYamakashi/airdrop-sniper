import { tokens } from "../constants/tokens";

export function findToken(tokenSymbol: string) {
  return tokens.find((token) => token.symbol === tokenSymbol);
}
