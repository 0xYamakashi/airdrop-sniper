import { ethers } from "ethers";

export type Token = {
  id: number;
  address: string;
  symbol: string;
  decimals: number;
  kind: string;
  is_nft: boolean;
};

export const tokens: Token[] = [
  {
    id: 0,
    address: ethers.constants.AddressZero,
    symbol: "ETH",
    decimals: 18,
    kind: "NATIVE",
    is_nft: false,
  },
  {
    id: 1,
    address: "0x3355df6d4c9c3035724fd0e3914de96a5a83aaf4",
    symbol: "USDC",
    decimals: 6,
    kind: "ERC20",
    is_nft: false,
  },
  {
    id: 2,
    address: "0x493257fd37edb34451f62edf8d2a0c418852ba4c",
    symbol: "USDT",
    decimals: 6,
    kind: "ERC20",
    is_nft: false,
  },
  {
    id: 3,
    address: "0x2039bb4116b4efc145ec4f0e2ea75012d6c0f181",
    symbol: "BUSD",
    decimals: 18,
    kind: "ERC20",
    is_nft: false,
  },
  {
    id: 4,
    address: "0x8E86e46278518EFc1C5CEd245cBA2C7e3ef11557",
    symbol: "USD+",
    decimals: 6,
    kind: "ERC20",
    is_nft: false,
  },
  {
    id: 5,
    address: "0x5aea5775959fbc2557cc8789bc1bf90a239d9a91",
    symbol: "WETH",
    decimals: 18,
    kind: "ERC20",
    is_nft: false,
  },
];
