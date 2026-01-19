#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/../.."  # backend/
source venv/bin/activate
python manage.py mark_iot_offline_devices --minutes "${1:-5}" --create-alerts
