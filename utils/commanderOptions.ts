import { NetworkNames } from "../constants/networks";

export const networkOption = [
  "-n --network <network>",
  `Specify a network. Options: ${Object.keys(NetworkNames)}`,
] as const;

export const inTokenOption = [
  "--inTokenSymbols <inTokenSymbols>",
  "Specify a paying token",
  '["ETH"]',
] as const;
