import { Construct } from 'constructs';
import { Chart } from 'cdk8s';
import * as kplus from 'cdk8s-plus-30';
import { ProcessorsConfig } from './types';
import { EnvInfo } from './types/env';

export class ProcessorChart extends Chart {
  constructor(scope: Construct, id: string, envMeta: EnvInfo, config: ProcessorsConfig) {
    super(scope, id);

    config.processors.forEach((processorConfig) => {
      const configMap = new kplus.ConfigMap(this, `${processorConfig.name}-config`, {
        metadata: { name: `${processorConfig.name}-config` },
        data: {
          'config.yaml': `processor_name: ${processorConfig.processor_name}\nconnection_string: "${processorConfig.connection_string}"\ngrpc_hostname: "${processorConfig.grpc_hostname}"\ngrpc_port: 30734\n${Object.entries(processorConfig.additional_config)
            .map(([k, v]) => `${k}: ${JSON.stringify(v)}`)
            .join('\n')}`,
        },
      });

      const deployment = new kplus.Deployment(this, processorConfig.name, {
        metadata: { name: processorConfig.name },
        replicas: 1,
      });

      const container = deployment.addContainer({
        name: processorConfig.name,
        image: `${config.image.repository}:${config.image.tag}`,
        imagePullPolicy: kplus.ImagePullPolicy.IF_NOT_PRESENT,
      });

      container.mount(
        `${config.processorConfigMountPath}/config.yaml`,
        kplus.Volume.fromConfigMap(this, `${processorConfig.name}-config-vol`, configMap),
        { subPath: 'config.yaml' },
      );
    });
  }
}
