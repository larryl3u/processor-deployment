// Base template for Movement node config.json
// This is intentionally generic; env-specific values (chain id, ports) are overridden at synth time.
export const movementConfigTemplate = {
  maptos_config: {
    chain: {
      maptos_chain_id: 126,
      maptos_rest_listen_hostname: '0.0.0.0',
      maptos_rest_listen_port: 30731,
      maptos_private_key_signer_identifier: {
        Local: {
          private_key_hex_bytes:
            '0000000000000000000000000000000000000000000000000000000000000001',
        },
      },
      maptos_read_only: false,
      enabled_pruning: false,
      maptos_ledger_prune_window: 50000000,
      maptos_epoch_snapshot_prune_window: 50000000,
      maptos_state_merkle_prune_window: 100000,
      maptos_db_path: '/.movement/maptos/126/.maptos',
      genesis_timestamp_microseconds: 1600000000000,
      genesis_block_hash_hex:
        '25112f5405bbc65b2542a67d94094f12f4d2e287025480efcdb6200c5fed8671',
      known_framework_release_str: 'elsa',
      dont_increase_epoch_until_version: 0,
      enable_indexer_grpc: true,
    },
    indexer: {
      maptos_indexer_grpc_listen_hostname: '0.0.0.0',
      maptos_indexer_grpc_listen_port: 30734,
      maptos_indexer_grpc_inactivity_timeout: 60,
      maptos_indexer_grpc_inactivity_ping_interval: 10,
      maptos_indexer_grpc_healthcheck_hostname: '0.0.0.0',
      maptos_indexer_grpc_healthcheck_port: 8084,
    },
  },
};
