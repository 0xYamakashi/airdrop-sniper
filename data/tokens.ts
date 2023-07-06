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
    address: "0x0000000000000000000000000000000000000000",
    symbol: "ETH",
    decimals: 18,
    kind: "ERC20",
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
];
