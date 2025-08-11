import { PostgresConfig } from '../types';

export const defaultPostgresConfig: PostgresConfig = {
  image: {
    repository: 'postgres',
    tag: '15',
    pullPolicy: 'IfNotPresent',
  },
  postgres: {
    user: 'postgres',
    password: 'password',
    database: 'postgres',
  },
  storage: {
    size: '100Gi',
  },
};
