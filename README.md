# Movement Processor Deployment

This repository contains Helm charts for deploying the Movement blockchain processor system on Kubernetes clusters. The deployment includes three main components:

- **Processor**: Movement blockchain indexer and processor components
- **Movement**: Movement full node for blockchain data
- **PostgreSQL**: (Optinoal) Database for storing processed blockchain data

## Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/larryl3u/processor-deployment
cd processor-deployment
```

### 2. Deploy to Production Cluster

#### Create Namespace (Optional)
```bash
kubectl create namespace movement
kubectl config set-context --current --namespace=movement
```

#### Deploy the Stack
```bash
# Deploy the components
helm install movement-stack ./charts/movement
```

Wait for mainnet restoration.

```bash

helm install postgres-stack ./charts/postgres
helm install processor-stack ./charts/processor
```

### 3. Deploy to Local Cluster (k3s)

```bash
# Start k3s if not already running
sudo systemctl start k3s

# Get kubeconfig
sudo cat /etc/rancher/k3s/k3s.yaml

# Deploy the stack
helm install movement-stack ./charts/movement
helm install postgres-stack ./charts/postgres
helm install processor-stack ./charts/processor
```

## Configuration

### Movement Full Node Configuration

The Movement full node can be configured via the `values.yaml` file or command-line parameters:

```yaml
# charts/movement/values.yaml
replicaCount: 1
image:
  repository: ghcr.io/movementlabsxyz/movement-full-node
  tag: f236944

ports:
  api: 30731
  grpc: 30734
  metrics: 30735

volume:
  mountPath: /.movement
  emptyDir: false  # Use PVC for production
  storageClass: ""  # Specify storage class for production
```

### Processor Configuration

Configure the processor components:

```yaml
# charts/processor/values.yaml
replicaCount: 1
image:
  repository: ghcr.io/movementlabsxyz/movement-indexer-v2
  tag: a4e526b

processors:
  - name: default-processor
    processor_name: default_processor
    connection_string: "postgresql://postgres:password@postgres-pg:5432/postgres"
    grpc_hostname: "movement-movement.default.svc.cluster.local"
```
