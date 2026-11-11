#!/bin/sh
# Builds a Chrome Web Store zip containing only shipping files.
set -eu
cd "$(dirname "$0")/.."
VERSION=$(node -p "require('./manifest.json').version")
OUT="dist/fragrance-focus-$VERSION.zip"
mkdir -p dist && rm -f "$OUT"
zip -X -r "$OUT" manifest.json src icons -x '*.DS_Store'
echo "Built $OUT"; unzip -l "$OUT"
