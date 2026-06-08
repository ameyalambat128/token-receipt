#!/bin/bash
set -euo pipefail

bash -n install.sh
bash -n codex/token-receipt/scripts/install-runtime.sh
bash -n codex/token-receipt/scripts/generate.sh
bash -n claude/token-receipt/scripts/install-runtime.sh
bash -n claude/token-receipt/scripts/generate.sh
