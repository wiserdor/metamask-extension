import contractMap from '@metamask/contract-metadata';

/**
 * A normalized list of addresses exported as part of the contractMap in
 * `@metamask/contract-metadata`. Used primarily to validate if manually entered
 * contract addresses do not match one of our listed tokens
 */
export const LISTED_CONTRACT_ADDRESSES = Object.keys(
  contractMap,
).map((address) => address.toLowerCase());

export const STATIC_MAINNET_TOKEN_LIST = Object.keys(contractMap).reduce(
  (acc, base) => {
    return {
      ...acc,
      [base.toLowerCase()]: {
        ...contractMap[base],
        address: base.toLowerCase(),
      },
    };
  },
  {},
);
