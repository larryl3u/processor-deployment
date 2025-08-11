export interface MovementConfigJson {
  maptos_config: {
    chain: {
      maptos_chain_id: number;
      maptos_rest_listen_hostname: string;
      maptos_rest_listen_port: number;
      maptos_private_key_signer_identifier: {
        Local: {
          private_key_hex_bytes: string;
        };
      };
      maptos_read_only: boolean;
      enabled_pruning: boolean;
      maptos_ledger_prune_window: number;
      maptos_epoch_snapshot_prune_window: number;
      maptos_state_merkle_prune_window: number;
      maptos_db_path: string;
      genesis_timestamp_microseconds: number;
      genesis_block_hash_hex: string;
      known_framework_release_str: string;
      dont_increase_epoch_until_version: number;
      enable_indexer_grpc: boolean;
    };
    indexer: {
      maptos_indexer_grpc_listen_hostname: string;
      maptos_indexer_grpc_listen_port: number;
      maptos_indexer_grpc_inactivity_timeout: number;
      maptos_indexer_grpc_inactivity_ping_interval: number;
      maptos_indexer_grpc_healthcheck_hostname: string;
      maptos_indexer_grpc_healthcheck_port: number;
    };
  };
}
