import { ethers } from "ethers";

export const netowrksArray = [
  "zksync",
  "mainnet",
  "linea",
  "optimism",
  "avax",
  "bnb",
  "polygon",
] as const;
export type NetworkNames = (typeof netowrksArray)[number];

// export function getNetwork(key: NetworkNames) {
//   return networks[NetworkNames[key]];
// }

export const networks = {
  mainnet: {
    name: "mainnet",
    chainId: "1",
    url: "https://mainnet.infura.io/v3/7a4dbd3a4c864f8e83a151ea6f05a933",
    layerzeroChainId: 100,
    layerzeroEndpointAddress: "0x66A71Dcef29A0fFBDBE3c6a460a3B5BC225Cd675",
  },
  zksync: {
    name: "zksync",
    chainId: "324",
    //  you can also use: 'https://zksync-era.rpc.thirdweb.com'
    url: "https://mainnet.era.zksync.io",
    syncswapRouterAddress: "0x2da10A1e27bF85cEdD8FFb1AbBe97e53391C0295",
    syncswapStablePoolFactoryAddress:
      "0x5b9f21d407F35b10CbfDDca17D5D84b129356ea3",
    syncswapClassicPoolFactoryAddress:
      "0xf2DAd89f2788a8CD54625C60b55cD3d2D0ACa7Cb",
    muteRouterAddress: "0x8B791913eB07C32779a16750e3868aA8495F5964",
    ethAddress: ethers.ZeroAddress,
    wethAddress: "0x5aea5775959fbc2557cc8789bc1bf90a239d9a91",
    layerzeroChainId: 165,
    layerzeroEndpointAddress: "0x9b896c0e23220469C7AE69cb4BbAE391eAa4C8da",
  },
  linea: {
    name: "linea",
    url: "https://linea-mainnet.infura.io/v3/7a4dbd3a4c864f8e83a151ea6f05a933",
    chainId: "59144",
    syncswapRouterAddress: "0x80e38291e06339d10AAB483C65695D004dBD5C69",
    syncswapStablePoolFactoryAddress:
      "0xE4CF807E351b56720B17A59094179e7Ed9dD3727",
    syncswapClassicPoolFactoryAddress:
      "0x37BAc764494c8db4e54BDE72f6965beA9fa0AC2d",
    wethAdress: "0xe5d7c2a44ffddf6b295a15c148167daaaf5cf34f",
    layerzeroChainId: 183,
    layerzeroEndpointAddress: "0xb6319cC6c8c27A8F5dAF0dD3DF91EA35C4720dd7",
  },
  avax: {
    chainId: "43114",
    name: "avax",
    url: "https://api.avax.network/ext/bc/C/rpc",
    layerzeroChainId: 106,
    layerzeroEndpointAddress: "0x3c2269811836af69497E5F486A85D7316753cf62",
  },
  optimism: {
    chainId: "10",
    name: "optimism",
    url: "https://mainnet.optimism.io",
    layerzeroChainId: 111,
    layerzeroEndpointAddress: "0x3c2269811836af69497E5F486A85D7316753cf62",
  },
  bnb: {
    chainId: "56",
    name: "bnb",
    url: "https://bsc-dataseed.binance.org",
    layerzeroChainId: 102,
    layerzeroEndpointAddress: "0x3c2269811836af69497E5F486A85D7316753cf62",
  },
  polygon: {
    chainId: "137",
    name: "polygon",
    url: "https://rpc-mainnet.maticvigil.com",
    layerzeroChainId: 109,
    layerzeroEndpointAddress: "0x3c2269811836af69497E5F486A85D7316753cf62",
  },
} as const;
