import { Construct } from "constructs";
import { TerraformOutput } from "cdktf";
import { KubernetesProvider } from "../../.gen/providers/kubernetes/provider";
import { Namespace } from "../../.gen/providers/kubernetes/namespace";
import { PersistentVolumeClaim } from "../../.gen/providers/kubernetes/persistent-volume-claim";
import { StatefulSet } from "../../.gen/providers/kubernetes/stateful-set";
import { Service } from "../../.gen/providers/kubernetes/service";
import { ConfigMap } from "../../.gen/providers/kubernetes/config-map";
import type { EnvInfo } from "../env";

export class MovementFullnodeConstruct extends Construct {
  public readonly namespace: Namespace;
  public readonly pvc: PersistentVolumeClaim;
  public readonly statefulSet: StatefulSet;
  public readonly service: Service;

  constructor(scope: Construct, id: string, envInfo: EnvInfo, k8sProvider: KubernetesProvider) {
    super(scope, id);

    // Create a unique prefix for all resources in this construct
    const resourcePrefix = `movement-${envInfo.networkName}`;

    // Namespace
    this.namespace = new Namespace(this, `${resourcePrefix}-namespace`, {
      metadata: {
        name: envInfo.namespace,
        labels: {
          app: "movement",
          environment: "staging",
          cluster: "local",
        },
      },
      provider: k8sProvider,
    });

    // PVC
    this.pvc = new PersistentVolumeClaim(this, `${resourcePrefix}-pvc`, {
      metadata: {
        name: "movement-data",
        namespace: envInfo.namespace,
        labels: {
          app: "movement",
          environment: "staging",
          cluster: "local",
        },
      },
      spec: {
        accessModes: ["ReadWriteOnce"],
        resources: {
          requests: {
            storage: "1Ti",
          },
        },
        ...(envInfo.storageClass && { storageClassName: envInfo.storageClass }),
      },
      provider: k8sProvider,
    });

    // ConfigMap for config.json
    const configMap = new ConfigMap(this, `${resourcePrefix}-config`, {
      metadata: {
        name: `movement-${envInfo.networkName}-config`,
        namespace: envInfo.namespace,
        labels: {
          app: "movement",
          environment: "staging",
        },
      },
      data: {
        "config.json": `{
          "network": "${envInfo.networkName}",
          "rpc_endpoint": "https://${envInfo.networkName}.movement.xyz",
          "api_port": 30731,
          "grpc_port": 30734,
          "metrics_port": 30735
        }`,
      },
      provider: k8sProvider,
    });

    // ConfigMap for restore script
    const restoreScriptConfigMap = new ConfigMap(this, `${resourcePrefix}-restore-script`, {
      metadata: {
        name: `movement-${envInfo.networkName}-restore-script`,
        namespace: envInfo.namespace,
        labels: {
          app: "movement",
          environment: "staging",
        },
      },
      data: {
        "restore.sh": `#!/bin/bash
set -e

echo "Installing dependencies..."
apk add --no-cache curl bash restic aws-cli

echo "Running restic restore..."
export HOME=/
export DOT_MOVEMENT_PATH=/.movement

# Download and run the restic restore script
curl -sSL https://raw.githubusercontent.com/movementlabsxyz/movement/main/docs/movement-node/run-fullnode/scripts/mainnet/restic-restore.sh | bash

echo "Moving files up one level..."
if [ -d /.movement/.movement ]; then
    mv /.movement/.movement/* /.movement/ 2>/dev/null || true
    rmdir /.movement/.movement 2>/dev/null || true
    echo "Files moved successfully"
else
    echo "No nested directory found, files are already in correct location"
fi

echo "Restore completed!"`,
      },
      provider: k8sProvider,
    });

    // StatefulSet
    this.statefulSet = new StatefulSet(this, `${resourcePrefix}-statefulset`, {
      metadata: {
        name: `movement-${envInfo.networkName}`,
        namespace: envInfo.namespace,
        labels: {
          app: "movement",
          environment: "staging",
        },
      },
      spec: {
        serviceName: `movement-${envInfo.networkName}`,
        replicas: envInfo.replicaCount.toString(),
        selector: {
          matchLabels: {
            app: "movement",
            environment: "staging",
          },
        },
        template: {
          metadata: {
            labels: {
              app: "movement",
              environment: "staging",
            },
          },
          spec: {
            initContainer: [
              {
                name: "check-movement-empty",
                image: "alpine:latest",
                command: ["sh", "-c"],
                args: [
                  "if [ -z \"$(ls -A /.movement 2>/dev/null)\" ]; then sh /tmp/restore.sh; else echo '/.movement is not empty, skipping restore'; fi",
                ],
                volumeMount: [
                  {
                    name: "movement-data",
                    mountPath: "/.movement",
                  },
                  {
                    name: "restore-script",
                    mountPath: "/tmp/restore.sh",
                    subPath: "restore.sh",
                  },
                ],
              },
              {
                name: "copy-config",
                image: "busybox",
                command: ["sh", "-c"],
                args: ["cp /tmp/config.json /.movement/config.json"],
                volumeMount: [
                  {
                    name: "config-volume",
                    mountPath: "/tmp/config.json",
                    subPath: "config.json",
                  },
                  {
                    name: "movement-data",
                    mountPath: "/.movement",
                  },
                ],
              },
            ],
            container: [
              {
                name: "movement-full-node",
                image: `ghcr.io/movementlabsxyz/movement-full-node:${envInfo.imageTag}`,
                imagePullPolicy: "IfNotPresent",
                args: ["run"],
                env: [
                  { name: "DOT_MOVEMENT_PATH", value: "/.movement" },
                  { name: "MOVEMENT_TIMING", value: "info" },
                  { name: "RUST_BACKTRACE", value: "1" },
                ],
                port: [
                  { name: "api", containerPort: 30731 },
                  { name: "grpc", containerPort: 30734 },
                  { name: "metrics", containerPort: 30735 },
                ],
                volumeMount: [
                  { name: "movement-data", mountPath: "/.movement" },
                  { name: "config-volume", mountPath: "/tmp/config.json", subPath: "config.json" },
                ],
              },
            ],
            volume: [
              { name: "movement-data", persistentVolumeClaim: { claimName: this.pvc.metadata.name } },
              { name: "config-volume", configMap: { name: configMap.metadata.name } },
              { name: "restore-script", configMap: { name: restoreScriptConfigMap.metadata.name } },
            ],
          },
        },
      },
      provider: k8sProvider,
    });

    // Service
    this.service = new Service(this, `${resourcePrefix}-service`, {
      metadata: {
        name: `movement-${envInfo.networkName}`,
        namespace: envInfo.namespace,
        labels: {
          app: "movement",
          environment: "staging",
        },
      },
      spec: {
        selector: {
          app: "movement",
          environment: "staging",
        },
        port: [
          { name: "api", port: 30731, targetPort: "30731" },
          { name: "grpc", port: 30734, targetPort: "30734" },
          { name: "metrics", port: 30735, targetPort: "30735" },
        ],
        type: "ClusterIP",
      },
      provider: k8sProvider,
    });

    // Terraform Outputs
    new TerraformOutput(this, `${resourcePrefix}-namespace-output`, {
      value: this.namespace.metadata.name,
    });

    new TerraformOutput(this, `${resourcePrefix}-pvc-output`, {
      value: this.pvc.metadata.name,
    });

    new TerraformOutput(this, `${resourcePrefix}-statefulset-output`, {
      value: this.statefulSet.metadata.name,
    });

    new TerraformOutput(this, `${resourcePrefix}-service-output`, {
      value: this.service.metadata.name,
    });
  }
} 