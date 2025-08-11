import { MovementConfig } from '../types';

export const defaultMovementConfig: MovementConfig = {
  image: {
    repository: 'ghcr.io/movementlabsxyz/movement-full-node',
    tag: 'f236944',
    pullPolicy: 'IfNotPresent',
  },
  env: {
    dotMovementPath: '/.movement',
    movementTiming: 'info',
    rustBacktrace: '1',
  },
  ports: {
    api: 30731,
    grpc: 30734,
    metrics: 30735,
  },
  volume: {
    mountPath: '/.movement',
    emptyDir: false,
  },
  livenessProbe: {
    enabled: false,
    path: '/health',
    port: 30731,
  },
};
