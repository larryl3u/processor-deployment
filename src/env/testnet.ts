import type { EnvInfo } from '../env';

export const envInfo: EnvInfo = {
  namespace: "movement-testnet",
  networkName: "testnet",
  chainId: 234,
  replicaCount: 1,
  imageTag: "f236944",
  // LOCAL DEV ONLY, for aws, use `io2` storage class.
  storageClass: "local-path"
}; 