#!/bin/bash

set -e

bun install

bun run build

bun run preview
