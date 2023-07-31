import { NetworkNames } from "../constants/networks";

export const networkOption = [
  "-n --network <network>",
  `Specify a network. Options: `,
] as const;

export const inTokenOption = [
  "--inTokenSymbols <inTokenSymbols>",
  "Specify a paying token",
] as const;

export const selectedWalletAddressesOption = [
  "--selectedWalletAddresses <selectedWalletAddresses>",
  "Addresses of wallets you want to use",
] as const;
