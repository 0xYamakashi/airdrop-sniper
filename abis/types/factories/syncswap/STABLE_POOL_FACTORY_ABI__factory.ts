/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Contract, Interface, type ContractRunner } from "ethers";
import type {
  STABLE_POOL_FACTORY_ABI,
  STABLE_POOL_FACTORY_ABIInterface,
} from "../../syncswap/STABLE_POOL_FACTORY_ABI";

const _abi = [
  {
    inputs: [
      {
        internalType: "address",
        name: "_master",
        type: "address",
      },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    inputs: [],
    name: "InvalidTokens",
    type: "error",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "token0",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "token1",
        type: "address",
      },
      {
        indexed: false,
        internalType: "address",
        name: "pool",
        type: "address",
      },
    ],
    name: "PoolCreated",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "bytes",
        name: "data",
        type: "bytes",
      },
    ],
    name: "createPool",
    outputs: [
      {
        internalType: "address",
        name: "pool",
        type: "address",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "getDeployData",
    outputs: [
      {
        internalType: "bytes",
        name: "deployData",
        type: "bytes",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    name: "getPool",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "pool",
        type: "address",
      },
      {
        internalType: "address",
        name: "sender",
        type: "address",
      },
      {
        internalType: "address",
        name: "tokenIn",
        type: "address",
      },
      {
        internalType: "address",
        name: "tokenOut",
        type: "address",
      },
      {
        internalType: "bytes",
        name: "data",
        type: "bytes",
      },
    ],
    name: "getSwapFee",
    outputs: [
      {
        internalType: "uint24",
        name: "swapFee",
        type: "uint24",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "master",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
] as const;

export class STABLE_POOL_FACTORY_ABI__factory {
  static readonly abi = _abi;
  static createInterface(): STABLE_POOL_FACTORY_ABIInterface {
    return new Interface(_abi) as STABLE_POOL_FACTORY_ABIInterface;
  }
  static connect(
    address: string,
    runner?: ContractRunner | null
  ): STABLE_POOL_FACTORY_ABI {
    return new Contract(
      address,
      _abi,
      runner
    ) as unknown as STABLE_POOL_FACTORY_ABI;
  }
}
