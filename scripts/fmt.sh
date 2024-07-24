#!/usr/bin/env bash

cd "$(dirname "$0")"
cd ..

hash deno 2>/dev/null
if [ $? -ne 0 ]; then
  echo "Need deno installed to run the fmt process."
  exit 1
fi

hash swiftformat 2>/dev/null
if [ $? -ne 0 ]; then
  echo "Need swiftformat installed to run the fmt process."
  exit 1
fi

deno fmt \
  --line-width=100 \
  ./scripts

swiftformat \
  --swiftversion 5 \
  --disable sortImports \
  --binarygrouping none \
  --decimalgrouping none \
  --elseposition next-line \
  --hexgrouping none \
  --octalgrouping none \
  --semicolons never \
  --wraparguments before-first \
  ./Teller
