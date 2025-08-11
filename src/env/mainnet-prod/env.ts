import { EnvInfo } from '../../types/env';

export const envInfo: EnvInfo = {
  id: 'mainnet-prod',
  networkName: 'mainnet',
  chainId: 126,
  namespace: 'mainnet',
  movementImage: { tag: 'f236944' },
  postgresImage: { tag: '15' },
  processorImage: { tag: 'a4e526b' },
  processors: [
    { name: 'default-processor', processor_name: 'default_processor' },
    { name: 'token-v2-processor', processor_name: 'token_v2_processor' },
    { name: 'fungible-asset-processor', processor_name: 'fungible_asset_processor' },
  ],
};
