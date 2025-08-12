import { App } from 'cdk8s';
import { MovementChart } from './src/node';
import { PostgresChart } from './src/db';
import { ProcessorChart } from './src/processors';
import { loadConfig } from './src/utils/config_loader';
import { EnvInfo } from './src/types/env';
import * as yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { VALID_ENVIRONMENTS } from './src/const';

export { MovementChart } from './src/node';
export { PostgresChart } from './src/db';
export { ProcessorChart } from './src/processors';

// Parse CLI arguments using yargs
const argv = yargs(hideBin(process.argv))
  .option('env', {
    type: 'string',
    describe: 'Environment to deploy to',
    choices: VALID_ENVIRONMENTS,
    demandOption: true
  })
  .help()
  .alias('h', 'help')
  .version()
  .alias('v', 'version')
  .parseSync();

const app = new App();

// Load context from CLI flags into the cdk8s App context
const cliCtx: Record<string, string> = {};

// Add main options to context
cliCtx.env = argv.env;

// Load context into the cdk8s App
for (const [key, value] of Object.entries(cliCtx)) {
  app.node.setContext(key, value);
}

// Resolve environment and cluster
const envId: string = app.node.tryGetContext('env') ?? 'devnet-staging';

// Load environment metadata
// eslint-disable-next-line @typescript-eslint/no-var-requires
const envMeta: EnvInfo = require(`./src/env/${envId}/env.ts`).envInfo;

// Load configurations using the config loader
const configs = loadConfig(envMeta);

new MovementChart(app, `movement-${envId}`, envMeta, configs.fullnode);
new PostgresChart(app, `postgres-${envId}`, envMeta, configs.postgres);
new ProcessorChart(app, `processor-${envId}`, envMeta, configs.indexer);

app.synth();

console.log('Successfully generated Kubernetes manifests!');
console.log(`   Environment: ${envId}`);
