import { defaultMovementConfig } from '../config/movement';
import { defaultPostgresConfig } from '../config/postgres';
import { defaultProcessorsConfig } from '../config/processors';
import { MovementConfig, PostgresConfig, ProcessorsConfig } from '../types';
import { EnvInfo } from '../types/env';

export interface LoadedConfigs {
  postgres: PostgresConfig;
  fullnode: MovementConfig;
  indexer: ProcessorsConfig;
}

/**
 * Loads configuration for a specific environment
 * @param envInfo - Environment information from env.ts
 * @returns Loaded configurations for postgres, fullnode, and indexer
 */
export function loadConfig(envInfo: EnvInfo): LoadedConfigs {
  // Start with default configurations
  const postgresConfig: PostgresConfig = { ...defaultPostgresConfig };
  const fullnodeConfig: MovementConfig = { ...defaultMovementConfig };
  const indexerConfig: ProcessorsConfig = { ...defaultProcessorsConfig };

  // Apply environment-specific overrides
  if (envInfo.postgresImage) {
    postgresConfig.image = { ...postgresConfig.image, ...envInfo.postgresImage };
  }

  if (envInfo.movementImage) {
    fullnodeConfig.image = { ...fullnodeConfig.image, ...envInfo.movementImage };
  }

  if (envInfo.processorImage) {
    indexerConfig.image = { ...indexerConfig.image, ...envInfo.processorImage };
  }

  // Apply processor-specific configurations if provided
  if (envInfo.processors && Array.isArray(envInfo.processors) && envInfo.processors.length > 0) {
    indexerConfig.processors = envInfo.processors.map((p) => ({
      name: p.name,
      processor_name: p.processor_name,
      connection_string: `postgresql://${postgresConfig.postgres.user}:${postgresConfig.postgres.password}@postgres-pg.${envInfo.namespace}.svc.cluster.local:5432/${postgresConfig.postgres.database}`,
      grpc_hostname: `movement-movement.${envInfo.namespace}.svc.cluster.local`,
      additional_config: p.additional_config ?? {},
    }));
  }

  return {
    postgres: postgresConfig,
    fullnode: fullnodeConfig,
    indexer: indexerConfig,
  };
}
