import { ethers } from "ethers";

export type NetworkNames = "zksync" | "mainnet" | "linea";

// export function getNetwork(key: NetworkNames) {
//   return networks[NetworkNames[key]];
// }

export const networks = {
  mainnet: {
    name: "Ethereum Mainnet",
    chainId: "1",
    url: "https://mainnet.infura.io/v3/7a4dbd3a4c864f8e83a151ea6f05a933",
  },
  zksync: {
    name: "zkSync Era Mainnet",
    chainId: "324",
    url: "https://mainnet.era.zksync.io",
    syncswapRouterAddress: "0x2da10A1e27bF85cEdD8FFb1AbBe97e53391C0295",
    syncswapStablePoolFactoryAddress:
      "0x5b9f21d407F35b10CbfDDca17D5D84b129356ea3",
    syncswapClassicPoolFactoryAddress:
      "0xf2DAd89f2788a8CD54625C60b55cD3d2D0ACa7Cb",
    muteRouterAddress: "0x8B791913eB07C32779a16750e3868aA8495F5964",
    ethAddress: ethers.ZeroAddress,
    wethAddress: "0x5aea5775959fbc2557cc8789bc1bf90a239d9a91",
  },
  linea: {
    name: "Linea",
    url: "https://linea-mainnet.infura.io/v3",
    chainId: "59144",
    syncswapRouterAddress: "0x80e38291e06339d10AAB483C65695D004dBD5C69",
    syncswapStablePoolFactoryAddress:
      "0xE4CF807E351b56720B17A59094179e7Ed9dD3727",
    syncswapClassicPoolFactoryAddress:
      "0x37BAc764494c8db4e54BDE72f6965beA9fa0AC2d",
    wethAdress: "0xe5d7c2a44ffddf6b295a15c148167daaaf5cf34f",
  },
} as const;
