export interface EnvInfo {
  namespace: string;
  networkName: string;
  chainId: number;
  replicaCount: number;
  imageTag: string;
  storageClass?: string;
} 