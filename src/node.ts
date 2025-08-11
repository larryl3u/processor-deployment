import { Construct } from 'constructs';
import { Chart, ChartProps, Size } from 'cdk8s';
import * as kplus from 'cdk8s-plus-30';
import { MovementConfig } from './types';
import { MovementConfigJson } from './types/movement-config';
import { movementConfigTemplate } from './config/movement-config';

function buildMovementConfigJson(config: MovementConfig) {
  const base: MovementConfigJson = (config.configJson as MovementConfigJson) ?? movementConfigTemplate;
  const merged: MovementConfigJson = JSON.parse(JSON.stringify(base));
  const chain = merged.maptos_config.chain as any;
  if (config.chainOverrides) {
    const o = config.chainOverrides as Record<string, unknown>;
    for (const [k, v] of Object.entries(o)) {
      if (v !== undefined && v !== null) chain[k] = v;
    }
  }
  // Ensure ports from config are reflected
  merged.maptos_config.chain.maptos_rest_listen_port = config.ports.api;
  merged.maptos_config.indexer.maptos_indexer_grpc_listen_port = config.ports.grpc;
  return merged;
}

const restoreScript = `#!/bin/bash\nset -e\n\necho "Installing dependencies..."\napk add --no-cache curl bash restic aws-cli\n\n# Check if any file is under /.movement; if yes, skip the restic restore\nif [ -n "$(ls -A /.movement 2>/dev/null)" ]; then\n    echo "/.movement is not empty, skipping restore"\n    exit 0\nfi\n\necho "Running restic restore..."\nexport HOME=/\nexport DOT_MOVEMENT_PATH=/.movement\n\n# Download and run the restic restore script\ncurl -sSL https://raw.githubusercontent.com/movementlabsxyz/movement/main/docs/movement-node/run-fullnode/scripts/mainnet/restic-restore.sh | bash\n\n# Restored files are under /.movement/.movement, move them up one level\nif [ -d /.movement/.movement ]; then\n    mv /.movement/.movement/* /.movement/ 2>/dev/null || true\n    rmdir /.movement/.movement 2>/dev/null || true\n    echo "Files moved successfully"\nelse\n    echo "No nested directory found, files are already in correct location"\nfi\n\necho "Restore completed!"`;

export class MovementChart extends Chart {
  constructor(scope: Construct, id: string, config: MovementConfig, props: ChartProps = {}) {
    super(scope, id, props);

    const configMap = new kplus.ConfigMap(this, 'movement-config', {
      metadata: { name: 'movement-config' },
      data: { 'config.json': JSON.stringify(buildMovementConfigJson(config), null, 2) },
    });

    const restoreScriptConfigMap = new kplus.ConfigMap(this, 'movement-restore-script', {
      metadata: { name: 'movement-restore-script' },
      data: { 'restore.sh': restoreScript },
    });

    let pvc: kplus.PersistentVolumeClaim | undefined;
    if (!config.volume.emptyDir) {
      pvc = new kplus.PersistentVolumeClaim(this, 'movement-data', {
        metadata: { name: 'movement-data' },
        accessModes: [kplus.PersistentVolumeAccessMode.READ_WRITE_ONCE],
        storage: Size.gibibytes(100),
        storageClassName: config.volume.storageClass,
      });
    }

    const service = new kplus.Service(this, 'movement-service', {
      metadata: { name: 'movement-movement' },
      type: kplus.ServiceType.NODE_PORT,
      ports: [
        { name: 'api', port: config.ports.api, nodePort: config.ports.api },
        { name: 'grpc', port: config.ports.grpc, nodePort: config.ports.grpc },
        { name: 'metrics', port: config.ports.metrics, nodePort: config.ports.metrics },
      ],
    });

    const statefulSet = new kplus.StatefulSet(this, 'movement', {
      metadata: { name: 'movement' },
      service: service,
      replicas: 1,
    });

    const dataVolume = config.volume.emptyDir
      ? kplus.Volume.fromEmptyDir(this, 'movement-data-vol', 'movement-data')
      : kplus.Volume.fromPersistentVolumeClaim(this, 'movement-data-vol', pvc!);
    const restoreVolume = kplus.Volume.fromConfigMap(this, 'restore-script-vol', restoreScriptConfigMap);
    const configVolume = kplus.Volume.fromConfigMap(this, 'config-vol', configMap);

    statefulSet.addInitContainer({
      name: 'check-movement-empty',
      image: 'alpine:latest',
      command: ['sh', '-c'],
      args: ['if [ -z "$(ls -A /.movement 2>/dev/null)" ]; then sh /tmp/restore.sh; else echo "/.movement is not empty, skipping restore"; fi'],
      volumeMounts: [
        { path: '/.movement', volume: dataVolume },
        { path: '/tmp/restore.sh', volume: restoreVolume, subPath: 'restore.sh' },
      ],
    });

    statefulSet.addInitContainer({
      name: 'copy-config',
      image: 'busybox',
      command: ['sh', '-c'],
      args: ['cp /tmp/config.json /.movement/config.json'],
      volumeMounts: [
        { path: '/tmp/config.json', volume: configVolume, subPath: 'config.json' },
        { path: '/.movement', volume: dataVolume },
      ],
    });

    const container = statefulSet.addContainer({
      name: 'movement-full-node',
      image: `${config.image.repository}:${config.image.tag}`,
      imagePullPolicy: kplus.ImagePullPolicy.IF_NOT_PRESENT,
      args: ['run'],
      envVariables: {
        DOT_MOVEMENT_PATH: kplus.EnvValue.fromValue(config.env.dotMovementPath),
        MOVEMENT_TIMING: kplus.EnvValue.fromValue(config.env.movementTiming),
        RUST_BACKTRACE: kplus.EnvValue.fromValue(config.env.rustBacktrace),
      },
      portNumber: config.ports.grpc,
      ...(config.livenessProbe.enabled && {
        liveness: kplus.Probe.fromHttpGet(config.livenessProbe.path, {
          port: config.livenessProbe.port,
        }),
      }),
    });

    container.addPort({ number: config.ports.api, name: 'api' });
    container.addPort({ number: config.ports.metrics, name: 'metrics' });

    container.mount(config.volume.mountPath, dataVolume);
    container.mount('/tmp/config.json', configVolume, { subPath: 'config.json' });
  }
}
