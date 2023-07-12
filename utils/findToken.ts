import { tokens } from "../data/tokens";

console.log(process.env.PRIVATE_KEYS, "privateKeys privateKeys privateKeys ");

export function findToken(tokenSymbol: string) {
  return tokens.find((token) => token.symbol === tokenSymbol);
}
