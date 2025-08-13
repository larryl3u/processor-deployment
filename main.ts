#!/usr/bin/env node
import { App, TerraformStack } from "cdktf";
import { Construct } from "constructs";
import { MovementFullnodeConstruct } from "./src/constructs/movement-fullnode";
import { KubernetesProvider } from "./.gen/providers/kubernetes/provider";

// Import environment configurations
import { envInfo as testnetEnv } from "./src/env/testnet";
import { envInfo as devnetEnv } from "./src/env/devnet";
import { envInfo as mainnetEnv } from "./src/env/mainnet";

class MovementStack extends TerraformStack {
  constructor(scope: Construct, id: string, envInfo: any) {
    super(scope, id);

    // Construct cluster name from network name
    const clusterName = `movement-${envInfo.networkName}-cluster`;
    
    // TODO: AWS EKS approach.
    // const eksCluster = new DataAwsEksCluster(this, "eks-cluster", { name: clusterName });
    // const eksAuth = new DataAwsEksClusterAuth(this, "eks-auth", { name: clusterName });
    let k8sProvider = new KubernetesProvider(this, "kubernetes-provider", {
      configPath: "~/.kube/config",
      configContext: clusterName,
    });
    
    // Pass provider to construct
    new MovementFullnodeConstruct(this, `movement-${envInfo.networkName}`, envInfo, k8sProvider);
  }
}

const app = new App();

// No need to pass cluster context - it's constructed automatically
new MovementStack(app, "indexer_testnet", testnetEnv);
new MovementStack(app, "indexer_devnet", devnetEnv);
new MovementStack(app, "indexer_mainnet", mainnetEnv);

app.synth();
