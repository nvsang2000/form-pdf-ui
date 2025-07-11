#!/bin/bash

set -e

yarn install

yarn build

yarn postinstall

node dist/src/main