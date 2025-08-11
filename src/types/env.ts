export interface EnvImageOverride {
  repository?: string;
  tag?: string;
}

export interface EnvProcessorSpec {
  name: string;
  processor_name: string;
  additional_config?: Record<string, unknown>;
}

export interface EnvInfo {
  id: string;            // e.g., "devnet-staging"
  networkName: string;   // e.g., "devnet" | "testnet" | "mainnet"
  chainId: number;       // CHAIN_ID for movement
  namespace: string;     // default namespace to deploy into
  movementImage?: EnvImageOverride;
  postgresImage?: EnvImageOverride;
  processorImage?: EnvImageOverride;
  processors?: Array<EnvProcessorSpec>;
}
