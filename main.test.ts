import { MovementChart } from './src/node';
import {Testing} from 'cdk8s';

describe('Charts', () => {
  test('Movement Chart', () => {
    const app = Testing.app();
    const config = {
      image: { repository: 'test', tag: 'latest' },
      env: { dotMovementPath: '/.movement', movementTiming: 'info', rustBacktrace: '1' },
      ports: { api: 30731, grpc: 30734, metrics: 30735 },
      volume: { mountPath: '/.movement', emptyDir: true },
      livenessProbe: { enabled: false, path: '/health', port: 30731 }
    };
    const chart = new MovementChart(app, 'test-movement', config);
    const results = Testing.synth(chart)
    expect(results).toMatchSnapshot();
  });
});
