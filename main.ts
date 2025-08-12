#!/usr/bin/env node
import { App, TerraformStack } from "cdktf";
import { Construct } from "constructs";
import { MovementFullnodeConstruct } from "./src/constructs/movement-fullnode";

// Import environment configurations
import { envInfo as testnetEnv } from "./src/env/testnet";
import { envInfo as devnetEnv } from "./src/env/devnet";
import { envInfo as mainnetEnv } from "./src/env/mainnet";

class MovementStack extends TerraformStack {
  constructor(scope: Construct, id: string, envInfo: any) {
    super(scope, id);

    // Create Movement fullnode construct with unique ID
    new MovementFullnodeConstruct(this, `movement-${envInfo.networkName}`, envInfo);
  }
}

const app = new App();

// Create stacks for each environment
new MovementStack(app, "kubernetes_testnet", testnetEnv);
new MovementStack(app, "kubernetes_devnet", devnetEnv);
new MovementStack(app, "kubernetes_mainnet", mainnetEnv);

app.synth();
