# Movement Blockchain CDK8s Deployment

## 🚀 **Quick Start**

```bash
# Bootstrap
pnpm install

# Deploy
pnpm run deploy:testnet
pnpm run deploy:devnet
pnpm run deploy:mainnet

# Diff
pnpm run diff:testnet
pnpm run diff:devnet
pnpm run diff:mainnet

# Destroy
pnpm run destroy:testnet
pnpm run destroy:devnet
pnpm run destroy:mainnet
```

## Local development

Make sure contexts are created. 

```bash
# Create testnet context
kubectl config set-context movement-testnet-cluster --cluster=default --user=default

# Create devnet context  
kubectl config set-context movement-devnet-cluster --cluster=default --user=default

# Create mainnet context
kubectl config set-context movement-mainnet-cluster --cluster=default --user=default
```

