export type Erc20ContractTokenInfo = {
  decimals: number;
  name: string;
  symbol: string;
  // TODO: Add the `total_supply`
};

export interface EthBridgeStatus {
  paused: boolean;
  swapMin: string;
  swapMax: string;
  supply: string;
  cap: string;
  fee: string;
  reverseAggLimit: string;
  reverseAggLimitCap: string;
}

export interface EtherscanGasFeeResponse {
  status: string;
  result: {
    SafeGasPrice: string;
    ProposeGasPrice: string;
    FastGasPrice: string;
  };
}

export interface EthGasFeeInfo {
  low: string;
  average: string;
  high: string;
}