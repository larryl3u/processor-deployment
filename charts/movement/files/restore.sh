#!/bin/bash
set -e

echo "Installing dependencies..."
apk add --no-cache curl bash restic aws-cli

# Check if any file is under /.movement; if yes, skip the restic restore
if [ -n "$(ls -A /.movement 2>/dev/null)" ]; then
    echo "/.movement is not empty, skipping restore"
    exit 0
fi

echo "Running restic restore..."
export HOME=/
export DOT_MOVEMENT_PATH=/.movement

# Download and run the restic restore script
curl -sSL https://raw.githubusercontent.com/movementlabsxyz/movement/main/docs/movement-node/run-fullnode/scripts/mainnet/restic-restore.sh | bash

# Restored files are under /.movement/.movement, move them up one level
if [ -d /.movement/.movement ]; then
    mv /.movement/.movement/* /.movement/ 2>/dev/null || true
    rmdir /.movement/.movement 2>/dev/null || true
    echo "Files moved successfully"
else
    echo "No nested directory found, files are already in correct location"
fi

echo "Restore completed!" 