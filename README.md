# Movement Blockchain CDK8s Deployment

## 🚀 **Quick Start**

```bash
# Bootstrap
pnpm install

# Generate manifests
pnpm run synth:testnet
pnpm run synth:devnet
pnpm run synth:mainnet

# Deploy
pnpm run deploy:testnet
pnpm run deploy:devnet
pnpm run deploy:mainnet
```

## 📋 **Available Commands**

| Command | Description |
|---------|-------------|
| `pnpm run synth:testnet` | Generate testnet manifests |
| `pnpm run synth:devnet` | Generate devnet manifests |
| `pnpm run synth:mainnet` | Generate mainnet manifests |
| `pnpm run deploy:testnet` | Deploy to testnet cluster |
| `pnpm run deploy:devnet` | Deploy to devnet cluster |
| `pnpm run deploy:mainnet` | Deploy to mainnet cluster |