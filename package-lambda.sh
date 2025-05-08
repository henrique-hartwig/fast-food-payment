#!/bin/bash

set -e

mkdir -p dist

for domain in payment; do
  for usecase in $(ls .build/$domain/useCases); do
    mkdir -p dist/$domain
    zip -rq dist/$domain/$usecase.zip \
      .build/$domain/domain \
      .build/$domain/useCases/$usecase \
      .build/utils
  done
done