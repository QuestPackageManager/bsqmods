#!/bin/bash
cd "$(readlink -f "$(dirname "$0")/..")"

(cd "source" && npm i)
(cd "source/scripts" && npm i)
(cd "source/website" && npm i)

if [[ -n $GITHUB_REPOSITORY ]]; then
  wget --quiet "https://github.com/$GITHUB_REPOSITORY/releases/download/cache/cache.txz" -O - | tar -xJvf -
fi

(cd "source/scripts" && npx tsx combine.ts)
