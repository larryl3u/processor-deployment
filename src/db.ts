import { Construct } from 'constructs';
import { Chart, ChartProps, ApiObject } from 'cdk8s';
import * as kplus from 'cdk8s-plus-30';
import { PostgresConfig } from './types';

export class PostgresChart extends Chart {
  constructor(scope: Construct, id: string, config: PostgresConfig, props: ChartProps = {}) {
    super(scope, id, props);

    const pvcName = 'postgres-data';
    new ApiObject(this, 'postgres-data', {
      apiVersion: 'v1',
      kind: 'PersistentVolumeClaim',
      metadata: { name: pvcName },
      spec: {
        accessModes: ['ReadWriteOnce'],
        resources: { requests: { storage: config.storage.size } },
        volumeMode: 'Filesystem',
      },
    });
    const pvc = kplus.PersistentVolumeClaim.fromClaimName(this, 'postgres-data-ref', pvcName);

    const service = new kplus.Service(this, 'postgres-service', {
      metadata: { name: 'postgres-pg' },
      type: kplus.ServiceType.CLUSTER_IP,
      ports: [{ name: 'postgres', port: 5432, targetPort: 5432 }],
    });

    const statefulSet = new kplus.StatefulSet(this, 'postgres', {
      metadata: { name: 'postgres' },
      service: service,
      replicas: 1,
    });

    const container = statefulSet.addContainer({
      name: 'postgres',
      image: `${config.image.repository}:${config.image.tag}`,
      imagePullPolicy: kplus.ImagePullPolicy.IF_NOT_PRESENT,
      envVariables: {
        POSTGRES_USER: kplus.EnvValue.fromValue(config.postgres.user),
        POSTGRES_PASSWORD: kplus.EnvValue.fromValue(config.postgres.password),
        POSTGRES_DB: kplus.EnvValue.fromValue(config.postgres.database),
        PGDATA: kplus.EnvValue.fromValue('/var/lib/postgresql/data/pgdata'),
      },
      portNumber: 5432,
    });

    container.mount(
      '/var/lib/postgresql/data',
      kplus.Volume.fromPersistentVolumeClaim(this, 'postgres-data-vol', pvc),
    );
  }
}
