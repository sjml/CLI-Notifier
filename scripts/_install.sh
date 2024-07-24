#!/usr/bin/env bash

cd "$(dirname "$0")"
cd ..

hash deno 2>/dev/null
if [ $? -ne 0 ]; then
  echo "Need deno installed to run the install process."
  exit 1
fi

deno run --allow-read --allow-write --allow-env --allow-run scripts/install.ts
