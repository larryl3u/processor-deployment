import { ChartProps } from 'cdk8s';
import { MovementConfigJson } from './types/movement-config';

export interface MovementChainOverrides {
  maptos_chain_id?: number;
  maptos_db_path?: string;
  genesis_timestamp_microseconds?: number;
  genesis_block_hash_hex?: string;
  known_framework_release_str?: string;
  enable_indexer_grpc?: boolean;
}

export interface MovementConfig {
  image: {
    repository: string;
    tag: string;
    pullPolicy?: string;
  };
  env: {
    dotMovementPath: string;
    movementTiming: string;
    rustBacktrace: string;
  };
  ports: {
    api: number;
    grpc: number;
    metrics: number;
  };
  volume: {
    mountPath: string;
    emptyDir: boolean;
    storageClass?: string;
  };
  livenessProbe: {
    enabled: boolean;
    path: string;
    port: number;
  };
  chainOverrides?: MovementChainOverrides;
  configJson?: MovementConfigJson;
}

export interface PostgresConfig {
  image: {
    repository: string;
    tag: string;
    pullPolicy?: string;
  };
  postgres: {
    user: string;
    // TODO: use secret manager + fetch to handle pwd.
    password: string;
    database: string;
  };
  storage: {
    size: string; // e.g., "10Gi", "100Gb" (passed as-is to PVC)
  };
}

// Single processor configuration (one processor)
export interface ProcessorConfig {
  name: string;
  processor_name: string;
  connection_string: string;
  grpc_hostname: string;
  additional_config: Record<string, unknown>;
}

// Chart-level processors configuration (one or more processors)
export interface ProcessorsConfig {
  image: {
    repository: string;
    tag: string;
    pullPolicy?: string;
  };
  processorConfigMountPath: string;
  processors: Array<ProcessorConfig>; // Vec<ProcessorConfig>
}

export interface EnvironmentConfig {
  id: string;
  chartProps?: ChartProps;
  chainId: number;
  movement: MovementConfig;
  postgres: PostgresConfig;
  processors: ProcessorsConfig;
}
