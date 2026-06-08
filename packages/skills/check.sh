#!/bin/bash
set -euo pipefail

bash -n install.sh
bash -n ../../skills/token-receipt/scripts/install-runtime.sh
bash -n ../../skills/token-receipt/scripts/generate.sh
