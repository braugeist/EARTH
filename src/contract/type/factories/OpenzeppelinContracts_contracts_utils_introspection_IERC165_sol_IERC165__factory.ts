/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Contract, Signer, utils } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type {
  OpenzeppelinContracts_contracts_utils_introspection_IERC165_sol_IERC165,
  OpenzeppelinContracts_contracts_utils_introspection_IERC165_sol_IERC165Interface,
} from "../OpenzeppelinContracts_contracts_utils_introspection_IERC165_sol_IERC165";

const _abi = [
  {
    inputs: [
      {
        internalType: "bytes4",
        name: "interfaceId",
        type: "bytes4",
      },
    ],
    name: "supportsInterface",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];

export class OpenzeppelinContracts_contracts_utils_introspection_IERC165_sol_IERC165__factory {
  static readonly abi = _abi;
  static createInterface(): OpenzeppelinContracts_contracts_utils_introspection_IERC165_sol_IERC165Interface {
    return new utils.Interface(
      _abi
    ) as OpenzeppelinContracts_contracts_utils_introspection_IERC165_sol_IERC165Interface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): OpenzeppelinContracts_contracts_utils_introspection_IERC165_sol_IERC165 {
    return new Contract(
      address,
      _abi,
      signerOrProvider
    ) as OpenzeppelinContracts_contracts_utils_introspection_IERC165_sol_IERC165;
  }
}
