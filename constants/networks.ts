import { ethers } from "ethers";

export enum NetworkNames {
  zksync = "zkSync Era Mainnet",
  mainnet = "Ethereum Mainnet",
}

export function getNetwork(key: keyof typeof NetworkNames) {
  return networks[NetworkNames[key]];
}

export const networks = {
  "Ethereum Mainnet": {
    name: "Ethereum Mainnet",
    chainId: "1",
    url: "https://mainnet.infura.io/v3/7a4dbd3a4c864f8e83a151ea6f05a933",
  },
  "zkSync Era Mainnet": {
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
    wbtcAddress: "0xbbeb516fb02a01611cbbe0453fe3c580d7281011",
  },
} as const;
