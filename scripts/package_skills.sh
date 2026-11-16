#!/usr/bin/env bash
# Zip each skill folder into dist/<skill-name>.zip, ready to upload to claude.ai
# (Settings → Capabilities → Skills) or to attach to a GitHub release.
set -euo pipefail
cd "$(dirname "$0")/.."
rm -rf dist && mkdir -p dist
for dir in skills/*/; do
  name="$(basename "$dir")"
  (cd skills && zip -qr "../dist/${name}.zip" "$name" -x '*/__pycache__/*' '*.DS_Store')
  echo "packaged dist/${name}.zip"
done
