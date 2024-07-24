#!/usr/bin/env bash

cd "$(dirname "$0")"
cd ..

hash deno 2>/dev/null
if [ $? -ne 0 ]; then
  echo "Need deno installed to run the build process."
  exit 1
fi

if [[ $1 = "clean" ]]; then
  echo "Cleaning up old builds..."
  rm -rf build/*
fi
deno run --allow-read --allow-write --allow-run scripts/build.ts
