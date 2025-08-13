import type { EnvInfo } from '../env';

export const envInfo: EnvInfo = {
  namespace: "movement-devnet",
  networkName: "devnet",
  chainId: 126,
  replicaCount: 1,
  imageTag: "f236944",
  // LOCAL DEV ONLY, for aws, use `io2` storage class.
  storageClass: "local-path"
}; 