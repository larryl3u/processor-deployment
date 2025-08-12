#!/bin/bash
set -e

# Validate environment parameter
if [ $# -eq 0 ]; then
    echo "Error: Environment parameter is required"
    echo "Usage: $0 <environment>"
    echo "Valid environments: devnet, testnet, mainnet"
    exit 1
fi

ENV="$1"

# Check if environment is valid
if [[ "$ENV" != "devnet" && "$ENV" != "testnet" && "$ENV" != "mainnet" ]]; then
    echo "Error: Invalid environment '$ENV'"
    echo "Valid environments: devnet, testnet, mainnet"
    exit 1
fi

echo "Installing dependencies..."
# apk add --no-cache curl bash restic aws-cli

# Check if any file is under /.movement; if yes, skip the restic restore
if [ -n "$(ls -A /.movement 2>/dev/null)" ]; then
    echo "/.movement is not empty, skipping restore"
    exit 0
fi

echo "Running restic restore for environment: $ENV"

# Environment-specific configuration
export HOME=/home/larry/garbage
export DOT_MOVEMENT_PATH=$HOME/.movement

# Run restic restore with environment-specific configuration
echo "Running restic restore..."
curl -sSL "https://raw.githubusercontent.com/movementlabsxyz/movement/main/docs/movement-node/run-fullnode/scripts/${ENV}/restic-restore.sh" | bash

# Restored files are under /.movement/.movement, move them up one level
if [ -d /.movement/.movement ]; then
    mv /.movement/.movement/* /.movement/ 2>/dev/null || true
    rmdir /.movement/.movement 2>/dev/null || true
    echo "Files moved successfully"
else
    echo "No nested directory found, files are already in correct location"
fi

echo "Restore completed for $ENV environment!"
